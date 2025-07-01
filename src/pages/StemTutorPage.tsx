import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import Header from '@/components/Header';
import AnimatedButton from '@/components/AnimatedButton';
import PageTransition from '@/components/PageTransition';
import Loader from '@/components/ui/loader';
import SuccessCheckmark from '@/components/ui/success-checkmark';
import DynamicTabsResult from "./DynamicTabsResult";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Type definitions for Wolfram API results
interface WolframImage {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

interface WolframSound {
  url: string;
  type?: string;
}

interface WolframRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  query?: string;
  title?: string;
  assumptions?: string;
}

interface WolframImagemap {
  rects: WolframRect[];
}

interface WolframState {
  name: string;
  input: string;
}

interface WolframInfoLink {
  url: string;
  text?: string;
  title?: string;
}

interface WolframInfoUnit {
  short: string;
  long: string;
}

interface WolframInfoImg {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

interface WolframInfo {
  text?: string;
  img?: WolframInfoImg | WolframInfoImg[];
  link?: WolframInfoLink | WolframInfoLink[];
  links?: WolframInfoLink[];
  units?: WolframInfoUnit[];
}

interface WolframSubpod {
  title: string;
  plaintext?: string;
  img?: WolframImage;
  imagemap?: WolframImagemap;
  mathml?: string;
  sound?: WolframSound;
  wav?: WolframSound;
  minput?: string;
  moutput?: string;
  cell?: string;
  states?: WolframState[];
}

interface WolframPod {
  title: string;
  id: string;
  primary?: boolean;
  scanner?: string;
  position?: number;
  subpods: WolframSubpod[];
  states?: WolframState[];
  infos?: WolframInfo[];
}

interface WolframFullResult {
  success: boolean;
  error: boolean;
  numpods: number;
  datatypes: string;
  pods: WolframPod[];
  assumptions?: unknown;
  warnings?: unknown;
  sources?: unknown;
  generalizations?: unknown;
}

// Utility function for math rendering using react-katex
const renderMathContent = (content: string) => {
  // Split by LaTeX delimiters for block and inline
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
  return parts.map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const latex = part.slice(2, -2);
      return <BlockMath key={index} math={latex} />;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      const latex = part.slice(1, -1);
      return <InlineMath key={index} math={latex} />;
    } else {
      return <span key={index}>{part}</span>;
    }
  });
};

// Utility to render MathML as HTML (basic fallback)
const renderMathML = (mathml: string) => {
  return (
    <div
      className="mathml-block"
      dangerouslySetInnerHTML={{ __html: mathml }}
      style={{ overflowX: 'auto' }}
    />
  );
};

// Utility to render info/links/images in extra pod info
const renderInfos = (infos: WolframInfo[] | undefined) => {
  if (!infos || !infos.length) return null;
  return (
    <div className="mt-2 mb-2">
      {infos.map((info, idx) => (
        <div key={idx} className="text-xs opacity-80 mb-1">
          {info.text && <span>{info.text} </span>}
          {info.img && !Array.isArray(info.img) && info.img.src && (
            <img
              src={info.img.src}
              alt={info.img.alt || 'info'}
              style={{ maxWidth: 200, display: 'inline-block', verticalAlign: 'middle', marginLeft: 6 }}
            />
          )}
          {info.img && Array.isArray(info.img) &&
            info.img.map((img, j) =>
              img.src ? (
                <img
                  key={j}
                  src={img.src}
                  alt={img.alt || 'info'}
                  style={{ maxWidth: 200, display: 'inline-block', verticalAlign: 'middle', marginLeft: 6 }}
                />
              ) : null
            )}
          {info.link && !Array.isArray(info.link) && (
            <a
              href={info.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline ml-1"
            >
              {info.link.text || info.link.url}
            </a>
          )}
          {info.link && Array.isArray(info.link) &&
            info.link.map((l, j) =>
              <a
                key={j}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline ml-1"
              >
                {l.text || l.url}
              </a>
            )}
          {Array.isArray(info.links) &&
            info.links.map((l, j) => (
              <a
                key={j}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline ml-1"
              >
                {l.text || l.url}
              </a>
            ))}
        </div>
      ))}
    </div>
  );
};

const StemTutorPage: React.FC = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState<string>('');
  const [mode, setMode] = useState<string>(''); // Let user choose mode
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Use string for short/llm/spoken, WolframFullResult for full
  const [result, setResult] = useState<string | WolframFullResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>(''); // For error
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGetAnswer = async () => {
    if (!question.trim() || !mode) {
      setError('Please enter a question and select an answer mode.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);
    setImageUrl(null);

    try {
      if (mode === 'simple') {
        // For image mode, get blob and set imageUrl
        const response = await axios.post('/ask', {
          query: question.trim(),
          mode: mode
        }, { responseType: 'blob' });

        // Handle error blob as text if not an image
        const contentType = response.headers['content-type'];
        if (contentType && contentType.startsWith('image')) {
          const blob = new Blob([response.data], { type: contentType });
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setError(reader.result);
            } else {
              setError('Failed to get image answer.');
            }
          };
          reader.readAsText(response.data);
        }
      } else {
        // For all other modes, expect JSON
        const response = await axios.post('/ask', {
          query: question.trim(),
          mode: mode
        });
        setResult(response.data.answer || response.data || 'No answer received from Wolfram API');
      }
      setShowSuccess(true);
    } catch (err: unknown) {
      if (
        mode === 'simple' &&
        (err as { response?: { data?: Blob } }).response &&
        (err as { response: { data: Blob } }).response.data
      ) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setError(reader.result);
          } else {
            setError('Failed to get answer. Please try again.');
          }
        };
        reader.readAsText((err as { response: { data: Blob } }).response.data);
      } else {
        setError(
          (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
            'Failed to get answer. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleGetAnswer();
    }
  };

  // Render pods and subpods for "full" mode
  const renderPods = () => {
    if (!result || typeof result === 'string' || !('pods' in result)) return null;

    return (
      <div>
        {result.pods.map((pod, i) => (
          <div key={pod.id} className="mb-6">
            <div className="font-semibold text-lg mb-2 flex items-center gap-2">
              {pod.primary && <span className="text-green-600">★</span>}
              {pod.title}
            </div>
            {pod.infos && Array.isArray(pod.infos) && renderInfos(pod.infos)}

            {pod.subpods.map((sub, j) => (
              <div key={j} className="mb-3 ml-2">
                {/* Plaintext */}
                {sub.plaintext && (
                  <div className="mb-2 prose max-w-none">
                    {renderMathContent(sub.plaintext)}
                  </div>
                )}

                {/* MathML */}
                {sub.mathml && (
                  <div className="mb-2">{renderMathML(sub.mathml)}</div>
                )}

                {/* minput */}
                {sub.minput && (
                  <div className="mb-1">
                    <span className="font-mono rounded bg-gray-100 px-2 py-1 text-xs">Wolfram Language Input:</span>
                    <pre className="whitespace-pre-wrap bg-gray-50 border rounded p-2 mt-1 mb-1">{sub.minput}</pre>
                  </div>
                )}

                {/* moutput */}
                {sub.moutput && (
                  <div className="mb-1">
                    <span className="font-mono rounded bg-gray-100 px-2 py-1 text-xs">Wolfram Language Output:</span>
                    <pre className="whitespace-pre-wrap bg-gray-50 border rounded p-2 mt-1 mb-1">{sub.moutput}</pre>
                  </div>
                )}

                {/* cell */}
                {sub.cell && (
                  <div className="mb-1">
                    <span className="font-mono rounded bg-gray-100 px-2 py-1 text-xs">Cell:</span>
                    <pre className="whitespace-pre-wrap bg-gray-50 border rounded p-2 mt-1 mb-1">{sub.cell}</pre>
                  </div>
                )}

                {/* Image */}
                {sub.img && sub.img.src && sub.img.alt !== sub.plaintext &&(
                  <div className="mb-2 flex flex-wrap gap-2">
                    <img
                      src={sub.img.src}
                      alt={sub.img.alt || 'Wolfram pod img'}
                      style={{ maxWidth: 350, borderRadius: 8, border: '1px solid #ccc' }}
                    />
                  </div>
                )}

                {/* Sound */}
                {sub.sound && sub.sound.url && (
                  <div className="mb-2">
                    <audio controls src={sub.sound.url}>
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                {/* WAV */}
                {sub.wav && sub.wav.url && (
                  <div className="mb-2">
                    <audio controls src={sub.wav.url}>
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                {/* Imagemap */}
                {sub.imagemap && sub.imagemap.rects && Array.isArray(sub.imagemap.rects) && sub.img && sub.img.src && (
                  <div className="mb-2">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={sub.img.src}
                        alt="Imagemap"
                        style={{ maxWidth: 350, borderRadius: 8, border: '1px solid #ccc' }}
                        useMap={`#map${i}-${j}`}
                      />
                      <map name={`map${i}-${j}`}>
                        {sub.imagemap.rects.map((rect, k) => (
                          <area
                            key={k}
                            shape="rect"
                            coords={`${rect.left},${rect.top},${rect.right},${rect.bottom}`}
                            href={rect.query ? `/?query=${encodeURIComponent(rect.query)}` : '#'}
                            alt={rect.title || ''}
                            title={rect.title || ''}
                            target="_blank"
                          />
                        ))}
                      </map>
                    </div>
                  </div>
                )}

                {/* States */}
                {sub.states && sub.states.length > 0 && (
                  <div className="mb-1">
                    <span className="text-xs opacity-70">Other states available: {sub.states.map((s) => s.name || '').join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-text)'
      }}
    >
      <Header />
      <PageTransition>
        <main className="pt-20 pb-8">
          <div className="container mx-auto px-6 max-w-4xl">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Ask Your STEM Question</h1>
              <p className="text-lg opacity-80">Get detailed, step-by-step solutions powered by AI</p>
            </div>

            {/* Question Input Section */}
            <div 
              className="rounded-xl p-6 mb-6 shadow-lg transition-all duration-300 hover:shadow-xl"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <label htmlFor="question" className="block text-lg font-semibold mb-3">
                Enter your question:
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="e.g., How do I solve quadratic equations? Explain photosynthesis..."
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 mb-4"
                style={{
                  backgroundColor: 'var(--theme-bg)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)'
                }}
                rows={4}
                disabled={isLoading}
              />

              {/* Dropdown */}
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-3" style={{ color: 'var(--theme-text)' }}>
                  Choose answer mode:
                </label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger 
                    className="text-lg h-12 border-2 transition-all duration-200 focus:border-blue-500 hover:border-blue-400"
                    style={{
                      backgroundColor: 'var(--theme-bg)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  >
                    <SelectValue placeholder="Select how you want your answer" />
                  </SelectTrigger>
                  <SelectContent 
                    className="border-2 shadow-lg animate-scale-in z-50"
                    style={{
                      backgroundColor: 'var(--theme-card-bg)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  >
                    <SelectItem value="llm" className="text-lg py-3 transition-colors duration-150 hover:bg-blue-50">
                      🤖 LLM API (short summary)
                    </SelectItem>
                    <SelectItem value="full" className="text-lg py-3 transition-colors duration-150 hover:bg-blue-50">
                      📝 Full Results API (All necessary details)
                    </SelectItem>
                    <SelectItem value="step_by_step" className="text-lg py-3 transition-colors duration-150 hover:bg-blue-50">
                      🪜 Step-by-Step API (detailed guided steps)
                    </SelectItem>
                    <SelectItem value="short_answer" className="text-lg py-3 transition-colors duration-150 hover:bg-blue-50">
                      ⚡ Short Answers API (one-line response)
                    </SelectItem>
                    <SelectItem value="spoken_result" className="text-lg py-3 transition-colors duration-150 hover:bg-blue-50">
                      🗣️ Spoken Results API (conversational)
                    </SelectItem>
                    <SelectItem value="simple" className="text-lg py-3 transition-colors duration-150 hover:bg-blue-50">
                      🖼️ Simple API (visual)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <AnimatedButton
                  onClick={handleBackToHome}
                  variant="outline"
                  scaleOnHover={true}
                  disabled={isLoading}
                >
                  ← Back to Home
                </AnimatedButton>
                
                <AnimatedButton
                  onClick={handleGetAnswer}
                  pulseOnHover={true}
                  scaleOnHover={true}
                  disabled={!question.trim() || !mode || isLoading}
                  className="relative"
                  style={{ 
                    backgroundColor: 'var(--theme-accent)',
                    color: 'white'
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader size="sm" />
                      <span>Getting Answer...</span>
                    </div>
                  ) : (
                    'Get Answer'
                  )}
                </AnimatedButton>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8 animate-fade-in">
                <Loader size="lg" className="mx-auto mb-4" />
                <p className="text-lg opacity-70">AI is thinking... 🤖</p>
              </div>
            )}

            {/* Answer Section - Text Results (for LLM, Short, Spoken) */}
            {result && !isLoading && !imageUrl && (mode !== 'full') && (
              <div 
                className="rounded-xl p-6 shadow-lg animate-fade-in"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  📝 Answer
                </h2>
                <div className="prose max-w-none leading-relaxed">
                  {typeof result === 'string'
                    ? renderMathContent(result)
                    : renderMathContent((result as { answer?: string }).answer || JSON.stringify(result))}
                </div>
              </div>
            )}

            {/* Answer Section - Full Results */}
            {mode === 'full' && result && !isLoading && typeof result === "object" && "pods" in result && (
              <div 
                className="rounded-xl p-6 shadow-lg animate-fade-in"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  📝 Full Results
                </h2>
                <DynamicTabsResult pods={result.pods} />
              </div>
            )}

            {/* Answer Section - Step-by-Step Results */}
            {mode === 'step_by_step' && result && !isLoading && typeof result === "object" && "pods" in result && (
              <>
              {console.log("Step-by-step result from backend:", result)}
              <div 
                className="rounded-xl p-6 shadow-lg animate-fade-in"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  🪜 Step-by-Step Solution
                </h2>
                <DynamicTabsResult pods={result.pods} />
              </div>
              </>
            )}

            {/* Answer Section - Image Results */}
            {imageUrl && !isLoading && (
              <div 
                className="rounded-xl p-6 shadow-lg animate-fade-in"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  🖼️ Visual Answer
                </h2>
                <div className="flex justify-center">
                  <img 
                    src={imageUrl} 
                    alt="Wolfram Alpha Result" 
                    className="max-w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </PageTransition>

      {/* Success Checkmark */}
      <SuccessCheckmark 
        show={showSuccess} 
        onComplete={() => setShowSuccess(false)} 
      />
    </div>
  );
};

export default StemTutorPage;
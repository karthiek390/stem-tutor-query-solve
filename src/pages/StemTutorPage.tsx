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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const StemTutorPage: React.FC = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState<string>('');
  const [mode, setMode] = useState<string>(''); // Let user choose mode; don't default to "llm"
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>(''); // For text answer
  const [imageUrl, setImageUrl] = useState<string | null>(null); // For image answer
  const [error, setError] = useState<string>(''); // For error
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGetAnswer = async () => {
    if (!question.trim() || !mode) {
      setError('Please enter a question and select an answer mode.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');
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
        setResult(response.data.answer || 'No answer received from Wolfram API');
      }
      setShowSuccess(true);
    } catch (err: any) {
      if (mode === 'simple' && err.response && err.response.data) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setError(reader.result);
          } else {
            setError('Failed to get answer. Please try again.');
          }
        };
        reader.readAsText(err.response.data);
      } else {
        setError(err.response?.data?.error || 'Failed to get answer. Please try again.');
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
                      📝 Full Results API (step-by-step)
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

            {/* Answer Section - Text Results */}
            {result && !isLoading && !imageUrl && (
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
                  {renderMathContent(result)}
                </div>
              </div>
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
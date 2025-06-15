import React, { useState } from 'react';
import axios from 'axios';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, BookOpen, Calculator } from 'lucide-react';

const StemTutor: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [mode, setMode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!query.trim() || !mode) {
      setError('Please enter a question and select an answer mode.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');
    setImageUrl(null);

    try {
      console.log('Sending request to /ask with:', { query, mode });

      if (mode === 'simple') {
        // For image mode, get blob and set imageUrl
        const response = await axios.post('/ask', {
          query: query.trim(),
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
          query: query.trim(),
          mode: mode
        });
        setResult(response.data.answer || 'No answer received from Wolfram API');
      }
    } catch (err: any) {
      console.error('Error calling backend:', err);
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  const renderMathContent = (content: string) => {
    // Simple LaTeX detection and rendering
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Wolfram STEM Tutor</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get step-by-step solutions to your math and science questions using Wolfram&apos;s powerful computational engine
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label htmlFor="question" className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                  <BookOpen className="w-5 h-5" />
                  Ask your question
                </label>
                <Textarea
                  id="question"
                  placeholder="e.g., What is the derivative of x^2 + 3x?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[120px] text-lg resize-none border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Tip: Press Ctrl+Enter to submit quickly
                </p>
              </div>

              {/* Dropdown */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Choose answer mode
                </label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger className="text-lg h-12 border-2 border-gray-200 focus:border-blue-500">
                    <SelectValue placeholder="Select how you want your answer" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200">
                    <SelectItem value="llm" className="text-lg py-3">
                      LLM API (short summary)
                    </SelectItem>
                    <SelectItem value="full" className="text-lg py-3">
                      Full Results API (step-by-step)
                    </SelectItem>
                    <SelectItem value="short_answer" className="text-lg py-3">
                      Short Answers API (one-line response)
                    </SelectItem>
                    <SelectItem value="spoken_result" className="text-lg py-3">
                      Spoken Results API (for conversational/text-to-speech)
                    </SelectItem>
                    <SelectItem value="simple" className="text-lg py-3">
                      Simple API (image)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !query.trim() || !mode}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Fetching answer...
                  </>
                ) : (
                  'Get Answer'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Response Display Section */}
        {(result || imageUrl || error || isLoading) && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Answer</h2>

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Fetching answer from Wolfram...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-red-800 font-medium">Error</p>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Image result for Simple API */}
              {imageUrl && !isLoading && (
                <div className="flex flex-col items-center">
                  <img
                    src={imageUrl}
                    alt="Wolfram|Alpha Simple API result"
                    className="rounded shadow max-w-full"
                    style={{ background: "#fff" }}
                  />
                </div>
              )}

              {/* Text answer for other modes */}
              {result && !isLoading && !imageUrl && (
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                  <div className="prose max-w-none">
                    <div className="text-gray-800 leading-relaxed">
                      {renderMathContent(result)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Demo Instructions */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Demo interface for Wolfram STEM Tutor • Backend endpoint: <code className="bg-gray-100 px-2 py-1 rounded">/ask</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StemTutor;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import AnimatedButton from '@/components/AnimatedButton';
import PageTransition from '@/components/PageTransition';
import Loader from '@/components/ui/loader';
import SuccessCheckmark from '@/components/ui/success-checkmark';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StemTutorPage: React.FC = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [mode, setMode] = useState('llm');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGetAnswer = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer('');
    
    // Simulate API call based on selected mode
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let responseText = '';
      switch(mode) {
        case 'llm':
          responseText = `LLM API Response for: "${question}"\n\nThis is a concise summary with key insights and explanations.`;
          break;
        case 'full':
          responseText = `Full Results API Response for: "${question}"\n\nStep 1: Understanding the problem\nStep 2: Breaking down the components\nStep 3: Solving systematically\nStep 4: Verification and conclusion`;
          break;
        case 'short_answer':
          responseText = `Short Answer: ${question.includes('?') ? 'The answer depends on the specific context and variables involved.' : 'This requires further analysis to provide a complete response.'}`;
          break;
        case 'spoken_result':
          responseText = `Spoken Result for: "${question}"\n\nHere's an explanation designed for audio output: Let me walk you through this step by step in a conversational manner...`;
          break;
        case 'simple':
          responseText = `Simple API Response: Visual representation would be generated here for: "${question}"`;
          break;
        default:
          responseText = `AI-generated answer for: "${question}"\n\nThis would be the detailed explanation with step-by-step solutions.`;
      }
      
      setAnswer(responseText);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error fetching answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
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
                  disabled={!question.trim() || isLoading}
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

            {/* Answer Section */}
            {answer && !isLoading && (
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
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {answer}
                  </p>
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

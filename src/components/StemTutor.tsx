
import React from 'react';
import Header from './Header';

const StemTutor: React.FC = () => {
  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-text)'
      }}
    >
      {/* Header Component */}
      <Header />

      {/* Main Content Area */}
      <main className="pt-16"> {/* Add padding-top to account for fixed header */}
        <div className="container mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div 
            className="rounded-xl p-8 mb-8 shadow-lg"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-border)'
            }}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Welcome to STEM Tutor</h2>
              <p className="text-lg mb-6" style={{ color: 'var(--theme-text-muted)' }}>
                Your AI-powered learning companion for Science, Technology, Engineering, and Mathematics
              </p>
              <div className="flex justify-center space-x-8 text-4xl">
                <span>🧪</span>
                <span>💻</span>
                <span>⚙️</span>
                <span>📐</span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Interactive Learning",
                description: "Engage with dynamic problem-solving exercises",
                icon: "🎯"
              },
              {
                title: "Step-by-Step Solutions", 
                description: "Get detailed explanations for complex problems",
                icon: "📝"
              },
              {
                title: "Progress Tracking",
                description: "Monitor your learning journey and achievements",
                icon: "📈"
              },
              {
                title: "Multiple Subjects",
                description: "Cover all STEM fields with comprehensive content",
                icon: "🔬"
              },
              {
                title: "AI Assistance",
                description: "Get personalized help and guidance",
                icon: "🤖"
              },
              {
                title: "Practice Tests",
                description: "Prepare for exams with targeted practice",
                icon: "📋"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-lg p-6 shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p style={{ color: 'var(--theme-text-muted)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Getting Started Section */}
          <div 
            className="rounded-xl p-8 mt-8 shadow-lg"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-border)'
            }}
          >
            <h3 className="text-2xl font-bold mb-4 text-center">Ready to Start Learning?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ 
                  backgroundColor: 'var(--theme-accent)',
                  color: 'white'
                }}
              >
                Start Learning
              </button>
              <button 
                className="px-6 py-3 rounded-lg font-semibold border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ 
                  borderColor: 'var(--theme-accent)',
                  color: 'var(--theme-accent)'
                }}
              >
                Browse Subjects
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StemTutor;

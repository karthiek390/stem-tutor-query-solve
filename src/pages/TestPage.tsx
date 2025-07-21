// src/pages/TestPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Question {
  wpg_topic: string;
  wpg_difficulty: string;
  wpg_instance_steps_command: string;
  wpg_instance_answers: { MathematicaSolution: string[] }[];
}

const TestPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const configRaw = localStorage.getItem('customTestConfig');
    if (!configRaw) return;

    interface TopicConfig {
      difficulty: string;
      numQuestions: number;
    }

    const config: Record<string, TopicConfig> = JSON.parse(configRaw);

    const payload = {
      wpg_input: Object.entries(config).map(([subtopic, { difficulty, numQuestions }]) => ({
        wpg_topic: subtopic,
        wpg_instances: numQuestions,
        wpg_difficulty: difficulty,
        wpg_answer_type: 'Single Expression'
      }))
    };

    axios
      .post('http://localhost:5000/wpg/questions', payload)
      .then((res) => {
        const allQuestions: Question[] = Array.isArray(res.data) ? res.data.flat() : [];
        setQuestions(allQuestions);
        setUserAnswers(new Array(allQuestions.length).fill(''));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch questions', err);
        setLoading(false);
      });
  }, []);

  const handleAnswerChange = (value: string) => {
    const updated = [...userAnswers];
    updated[currentIndex] = value;
    setUserAnswers(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-semibold">Generating questions...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="p-6 text-lg font-medium text-center">
        No questions available.
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="flex items-center justify-center h-screen bg-white text-black">
      <div className="w-full max-w-2xl p-6 border rounded shadow-md bg-gray-50">
        <h1 className="text-xl font-bold mb-4 text-center">
          Question {currentIndex + 1} / {questions.length}
        </h1>

        <div className="mb-4 p-4 border rounded bg-white shadow">
          <strong>Command:</strong>{' '}
          <code className="text-blue-700">{q.wpg_instance_steps_command}</code>
        </div>

        <input
          className="w-full p-2 border rounded mb-6"
          placeholder="Enter your answer here..."
          value={userAnswers[currentIndex] || ''}
          onChange={(e) => handleAnswerChange(e.target.value)}
        />

        <div className="flex justify-between">
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            ⬅️ Previous
          </button>

          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={currentIndex === questions.length - 1}
          >
            Next ➡️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
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
    const selectedSubjects = JSON.parse(localStorage.getItem('selectedSubjects') || '[]');
    const difficulty = localStorage.getItem('difficulty') || 'Beginner';

    if (!selectedSubjects.length) return;

    const payload = {
      wpg_input: selectedSubjects.slice(0, 1).map((subject: string) => ({
        wpg_topic: subject,
        wpg_instances: 10,
        wpg_difficulty: difficulty,
        wpg_answer_type: 'Single Expression'
      }))
    };

    axios.post('http://localhost:5000/wpg/questions', payload)
      .then(res => {
        setQuestions(res.data);
        setUserAnswers(new Array(res.data.length).fill(''));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch questions', err);
        setLoading(false);
      });
  }, []);

  const handleAnswerChange = (value: string) => {
    const updated = [...userAnswers];
    updated[currentIndex] = value;
    setUserAnswers(updated);
  };

  if (loading) return <div className="p-6">Loading questions...</div>;
  if (!questions.length) return <div className="p-6">No questions available.</div>;

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Question {currentIndex + 1} of {questions.length}</h1>

      <div className="mb-4 p-4 border rounded bg-gray-50">
        <strong>Command:</strong> <code>{q.wpg_instance_steps_command}</code>
      </div>

      <input
        className="w-full p-2 border rounded mb-4"
        placeholder="Enter your answer here..."
        value={userAnswers[currentIndex] || ''}
        onChange={(e) => handleAnswerChange(e.target.value)}
      />

      <div className="flex justify-between">
        <button
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          ⬅️ Previous
        </button>

        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
          disabled={currentIndex === questions.length - 1}
        >
          Next ➡️
        </button>
      </div>
    </div>
  );
};

export default TestPage;

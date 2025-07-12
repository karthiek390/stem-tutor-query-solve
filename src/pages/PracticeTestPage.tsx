import React, { useEffect, useState } from 'react';
import axios from 'axios';

type WPGData = Record<string, string[]>;

const PracticeTestPage: React.FC = () => {
  const [topics, setTopics] = useState<WPGData>({});
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [difficulty, setDifficulty] = useState('Beginner');

  useEffect(() => {
    axios.get('http://localhost:5000/wpg/topics')
      .then((res) => setTopics(res.data))
      .catch((err) => console.error('Failed to fetch WPG topics:', err));
  }, []);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) => {
      const updated = new Set(prev);
      if (updated.has(subject)) {
        updated.delete(subject);
      } else {
        updated.add(subject);
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-4">🧪 Practice Test Setup</h1>

      <label className="block mb-4">
        <span className="text-lg font-semibold">Select Difficulty:</span>
        <select
          className="mt-1 block w-60 border p-2 rounded"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </label>

      <h2 className="text-2xl font-bold mb-2">Topics</h2>

      <div className="space-y-4">
        {Object.entries(topics).map(([topic, subjects]) => (
          <div key={topic} className="border rounded p-4 shadow-md">
            <div
              className="cursor-pointer font-semibold text-lg flex justify-between items-center"
              onClick={() => setExpandedTopic(expandedTopic === topic ? null : topic)}
            >
              <span>{topic} ({subjects.length})</span>
              <span>{expandedTopic === topic ? '▲' : '▼'}</span>
            </div>

            {expandedTopic === topic && (
              <div className="mt-3 ml-4 grid grid-cols-2 gap-2">
                {subjects.map((sub) => (
                  <label key={sub} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.has(sub)}
                      onChange={() => toggleSubject(sub)}
                    />
                    <span>{sub}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Generate Test Button */}
      <div className="mt-8 text-center">
        <button
          disabled={selectedSubjects.size === 0}
          onClick={() => {
            localStorage.setItem('selectedSubjects', JSON.stringify(Array.from(selectedSubjects)));
            localStorage.setItem('difficulty', difficulty);
            window.location.href = "/test";
          }}
          className={`px-6 py-3 rounded font-semibold transition ${
            selectedSubjects.size === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Generate Test
        </button>
      </div>
    </div>
  );
};

export default PracticeTestPage;

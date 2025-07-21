import React, { useEffect, useState } from 'react';
import axios from 'axios';

type WPGData = Record<string, string[]>;

type SelectionConfig = {
  [subtopic: string]: {
    difficulty: string;
    numQuestions: number;
  };
};

const PracticeTestPage: React.FC = () => {
  const [topics, setTopics] = useState<WPGData>({});
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [selectionMap, setSelectionMap] = useState<SelectionConfig>({});
  const [loading, setLoading] = useState(true); // 👈 Loading state added

  useEffect(() => {
    axios.get('http://localhost:5000/wpg/topics')
      .then((res) => {
        setTopics(res.data);
        setLoading(false); // 👈 Done loading
      })
      .catch((err) => {
        console.error('Failed to fetch WPG topics:', err);
        setLoading(false);
      });
  }, []);

  const toggleSubject = (subject: string) => {
    setSelectionMap(prev => {
      const updated = { ...prev };
      if (updated[subject]) {
        delete updated[subject];
      } else {
        updated[subject] = { difficulty: 'Beginner', numQuestions: 5 };
      }
      return updated;
    });
  };

  const updateSelectionField = (
    subject: string,
    field: 'difficulty' | 'numQuestions',
    value: string | number
  ) => {
    setSelectionMap(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [field]: field === 'numQuestions' ? parseInt(value as string) : value
      }
    }));
  };

  const handleGenerateTest = () => {
    localStorage.setItem('customTestConfig', JSON.stringify(selectionMap));
    window.location.href = '/test';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-semibold">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-4">🧪 Practice Test Setup</h1>

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
              <div className="mt-3 ml-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((sub) => (
                  <div key={sub} className="flex flex-col border rounded p-2">
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={!!selectionMap[sub]}
                        onChange={() => toggleSubject(sub)}
                      />
                      <span className="font-medium">{sub}</span>
                    </label>

                    {selectionMap[sub] && (
                      <div className="flex gap-4 ml-6">
                        <label className="text-sm">
                          Difficulty:
                          <select
                            value={selectionMap[sub].difficulty}
                            onChange={(e) => updateSelectionField(sub, 'difficulty', e.target.value)}
                            className="ml-2 border p-1 rounded"
                          >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                          </select>
                        </label>

                        <label className="text-sm">
                          Questions:
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={selectionMap[sub].numQuestions}
                            onChange={(e) => updateSelectionField(sub, 'numQuestions', e.target.value)}
                            className="ml-2 w-16 border p-1 rounded"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Generate Test Button */}
      <div className="mt-8 text-center">
        <button
          disabled={Object.keys(selectionMap).length === 0}
          onClick={handleGenerateTest}
          className={`px-6 py-3 rounded font-semibold transition ${
            Object.keys(selectionMap).length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Generate Test
        </button>
      </div>
    </div>
  );
};

export default PracticeTestPage;
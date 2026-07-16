import { useState, useEffect } from 'react';
import { adminApi, apiClient } from '../api/client';
import { Sparkles, AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';

interface Question {
  id: string;
  categoryId: string;
  categoryName?: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  flagCount: number;
  flagReason?: string;
  category?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function ContentModeration() {
  const [flaggedQuestions, setFlaggedQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // AI Gen state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [genCount, setGenCount] = useState(10);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<string | null>(null);

  const fetchFlagged = () => {
    setLoading(true);
    adminApi.content.getFlagged(page)
      .then((res) => {
        setFlaggedQuestions(res.data.data || res.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch flagged questions:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    apiClient.get('/quiz/categories')
      .then((res) => {
        setCategories(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedCategory(res.data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
      });
  };

  useEffect(() => {
    fetchFlagged();
  }, [page]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleModerate = async (questionId: string, approve: boolean) => {
    try {
      await adminApi.content.moderate(questionId, approve);
      fetchFlagged();
    } catch (err) {
      console.error('Failed to moderate question:', err);
      alert('Failed to moderate question');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    setGenLoading(true);
    setGenResult(null);
    try {
      const res = await adminApi.content.generateQuestions(selectedCategory, genCount, difficulty);
      setGenResult(`Successfully generated ${res.data.generated || genCount} questions!`);
      fetchFlagged(); // refresh in case it generated new items that were flagged, or just general updates
    } catch (err: any) {
      console.error('Failed to generate questions:', err);
      setGenResult(`Error: ${err.response?.data?.message || err.message || 'Generation failed'}`);
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* AI Generation Box */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="text-emerald-400" size={20} />
          AI Question Generator (GPT-4o)
        </h2>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
            >
              {categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Count</label>
            <input
              type="number"
              min={1}
              max={50}
              value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={genLoading || !selectedCategory}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-gray-950 font-bold p-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {genLoading ? 'Generating...' : 'Generate Questions'}
          </button>
        </form>
        {genResult && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${genResult.startsWith('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {genResult}
          </div>
        )}
      </div>

      {/* Flagged / Moderation Table */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="text-red-400" size={20} />
          Flagged Questions
        </h2>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="p-4 font-medium">Question</th>
                  <th className="p-4 font-medium">Category / Difficulty</th>
                  <th className="p-4 font-medium">Flags</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : flaggedQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">No flagged questions.</td>
                  </tr>
                ) : (
                  flaggedQuestions.map((q) => (
                    <tr key={q.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="p-4 max-w-md">
                        <div className="font-semibold text-white mb-2">{q.questionText}</div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`p-1 px-2 rounded ${opt === q.correctAnswer ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium' : 'bg-gray-900'}`}>
                              {opt}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">{q.category?.name || q.categoryName || q.categoryId}</div>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 font-semibold ${
                          q.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-500' :
                          q.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500">
                          <AlertTriangle size={12} className="mr-1" /> {q.flagCount} flag(s)
                        </span>
                        {q.flagReason && <p className="text-xs text-gray-500 mt-1 max-w-xs">{q.flagReason}</p>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleModerate(q.id, true)}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                            title="Keep (Approve)"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleModerate(q.id, false)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            title="Delete (Reject)"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-700 flex justify-between items-center text-sm text-gray-400">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-700 rounded-md"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

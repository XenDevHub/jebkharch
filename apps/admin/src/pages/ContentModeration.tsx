import { useState, useEffect } from 'react';
import { adminApi, apiClient } from '../api/client';
import { Sparkles, AlertTriangle, Check, X, ShieldAlert, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

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
      fetchFlagged();
    } catch (err: any) {
      console.error('Failed to generate questions:', err);
      setGenResult(`Error: ${err.response?.data?.message || err.message || 'Generation failed'}`);
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center space-x-2">
          <Layers className="text-indigo-400" size={22} />
          <span>Question Bank & Moderation</span>
        </h1>
        <p className="text-xs text-slate-400">Generate AI trivia questions with GPT-4o and moderate player-flagged content</p>
      </div>

      {/* AI Generation Box */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="text-emerald-400" size={18} />
          <span>AI Question Generator (GPT-4o)</span>
        </h2>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full glass-input rounded-xl p-2.5 text-xs text-white focus:outline-none"
            >
              {categories.length === 0 ? (
                <option value="" className="bg-slate-900 text-slate-300">No categories available</option>
              ) : (
                categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-300">{c.name}</option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Count</label>
            <input
              type="number"
              min={1}
              max={50}
              value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
              className="w-full glass-input rounded-xl p-2.5 text-xs text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full glass-input rounded-xl p-2.5 text-xs text-white focus:outline-none"
            >
              <option value="EASY" className="bg-slate-900 text-slate-300">Easy</option>
              <option value="MEDIUM" className="bg-slate-900 text-slate-300">Medium</option>
              <option value="HARD" className="bg-slate-900 text-slate-300">Hard</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={genLoading || !selectedCategory}
            className="w-full glass-button-primary disabled:opacity-50 text-white font-bold p-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
          >
            {genLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Generate Questions</span>
              </>
            )}
          </button>
        </form>
        {genResult && (
          <div className={`p-3 rounded-xl text-xs ${genResult.startsWith('Error') ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
            {genResult}
          </div>
        )}
      </div>

      {/* Flagged / Moderation Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="text-rose-400" size={18} />
          <span>Flagged Questions Requiring Review</span>
        </h2>

        {/* Mobile View for Question Cards (< md) */}
        <div className="block md:hidden space-y-3">
          {loading ? (
            <div className="glass-card p-8 rounded-2xl text-center text-slate-400 text-xs">
              Loading flagged questions...
            </div>
          ) : flaggedQuestions.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center text-slate-400 text-xs">
              No flagged questions in queue.
            </div>
          ) : (
            flaggedQuestions.map((q) => (
              <div key={q.id} className="glass-card p-4 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200">
                      {q.category?.name || q.categoryName || 'General'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      q.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      q.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                    <AlertTriangle size={11} className="mr-1" /> {q.flagCount} flags
                  </span>
                </div>

                <p className="text-xs font-semibold text-white leading-relaxed">
                  {q.questionText}
                </p>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 text-xs">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-xl text-xs truncate ${
                        opt === q.correctAnswer
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                          : 'bg-slate-900/60 text-slate-400 border border-white/5'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>

                {q.flagReason && (
                  <p className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-white/5">
                    <strong>Report:</strong> {q.flagReason}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleModerate(q.id, true)}
                    className="py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 font-semibold text-xs flex items-center justify-center space-x-1"
                  >
                    <Check size={14} />
                    <span>Approve (Keep)</span>
                  </button>
                  <button
                    onClick={() => handleModerate(q.id, false)}
                    className="py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 font-semibold text-xs flex items-center justify-center space-x-1"
                  >
                    <X size={14} />
                    <span>Reject (Delete)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop / Tablet Table View (>= md) */}
        <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-900/80 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Question Details</th>
                  <th className="p-4">Category & Difficulty</th>
                  <th className="p-4">Flags</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">Loading flagged questions...</td>
                  </tr>
                ) : flaggedQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">No flagged questions in queue.</td>
                  </tr>
                ) : (
                  flaggedQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 max-w-sm">
                        <div className="font-semibold text-white mb-2 leading-relaxed">{q.questionText}</div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-400">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`p-1.5 px-2 rounded-lg truncate ${opt === q.correctAnswer ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium' : 'bg-slate-900/60'}`}>
                              {opt}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">{q.category?.name || q.categoryName || q.categoryId}</div>
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded mt-1 font-semibold ${
                          q.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          q.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertTriangle size={12} className="mr-1" /> {q.flagCount} flag(s)
                        </span>
                        {q.flagReason && <p className="text-[11px] text-slate-400 mt-1 max-w-xs">{q.flagReason}</p>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleModerate(q.id, true)}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                            title="Keep (Approve)"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleModerate(q.id, false)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
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
        </div>

        {/* Pagination */}
        <div className="glass-card p-3.5 sm:p-4 rounded-2xl flex items-center justify-between text-xs text-slate-400">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg glass-button-secondary disabled:opacity-30 flex items-center space-x-1"
          >
            <ChevronLeft size={15} />
            <span>Previous</span>
          </button>
          <span>Page <strong className="text-slate-200">{page}</strong></span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg glass-button-secondary flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

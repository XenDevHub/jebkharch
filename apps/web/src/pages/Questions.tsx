import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sparkles, Check, X } from 'lucide-react';

export function QuestionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<string>('MEDIUM');
  const [genSuccess, setGenSuccess] = useState<string>('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.quiz.getCategories();
      return res.data;
    }
  });

  // Fetch Flagged Questions for Moderation
  const { data: flaggedData, isLoading: isLoadingFlagged } = useQuery({
    queryKey: ['flagged-questions', page],
    queryFn: async () => {
      const res = await api.admin.getFlaggedQuestions(page);
      return res.data;
    }
  });

  // Generate Questions Mutation
  const generateMutation = useMutation({
    mutationFn: (args: { categoryId: string, count: number, difficulty: string }) =>
      api.admin.generateQuestions(args.categoryId, args.count, args.difficulty),
    onSuccess: (res) => {
      setGenSuccess(`Successfully generated ${res.data?.count || questionCount} questions!`);
      queryClient.invalidateQueries({ queryKey: ['flagged-questions'] });
    }
  });

  // Moderate Question Mutation
  const moderateMutation = useMutation({
    mutationFn: (args: { questionId: string, approve: boolean }) =>
      api.admin.moderateQuestion(args.questionId, args.approve),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-questions'] });
    }
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setGenSuccess('');
    generateMutation.mutate({
      categoryId: selectedCategory,
      count: Number(questionCount),
      difficulty
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Question Bank & Moderation</h2>
        <p className="text-muted-foreground text-sm">Generate AI questions and moderate community/flagged questions</p>
      </div>

      {/* AI Question Generator Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 text-amber-500" />
            AI Question Generator
          </CardTitle>
          <CardDescription>
            Instantly generate multiple-choice questions for any category using Gemini AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="grid gap-4 md:grid-cols-4 items-end">
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Count (1-50)</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <Button type="submit" disabled={generateMutation.isPending || !selectedCategory}>
              {generateMutation.isPending ? 'Generating...' : 'Generate Questions'}
            </Button>
          </form>

          {genSuccess && (
            <div className="mt-4 p-3 bg-green-500/10 text-green-500 rounded-md text-sm">
              {genSuccess}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Moderation Queue Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Moderation Queue (Unapproved / Flagged)</h3>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Question Text</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Correct Answer</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingFlagged ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">Loading moderation queue...</TableCell>
                </TableRow>
              ) : flaggedData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No questions requiring moderation.
                  </TableCell>
                </TableRow>
              ) : (
                flaggedData?.data?.map((q: any) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.text}</TableCell>
                    <TableCell className="text-xs space-y-1">
                      <div>A: {q.optionA}</div>
                      <div>B: {q.optionB}</div>
                      <div>C: {q.optionC}</div>
                      <div>D: {q.optionD}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-500">{q.correctOption}</span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-muted">
                        {q.difficulty}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-500 hover:text-green-600 border-green-500/30"
                        onClick={() => moderateMutation.mutate({ questionId: q.id, approve: true })}
                        disabled={moderateMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => moderateMutation.mutate({ questionId: q.id, approve: false })}
                        disabled={moderateMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

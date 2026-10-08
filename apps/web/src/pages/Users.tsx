import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [banReason, setBanReason] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: async () => {
      const res = await api.admin.getUsers(page, 20, search);
      return res.data;
    }
  });

  const banMutation = useMutation({
    mutationFn: (args: { userId: string, reason: string }) => api.admin.banUser(args.userId, args.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsBanModalOpen(false);
      setBanReason('');
      setSelectedUserId(null);
    }
  });

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => api.admin.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const handleBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId && banReason) {
      banMutation.mutate({ userId: selectedUserId, reason: banReason });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <div className="w-72">
          <Input 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone / ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Coins</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
              </TableRow>
            ) : data?.data?.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.phone}
                  <div className="text-xs text-muted-foreground">{user.id}</div>
                </TableCell>
                <TableCell>{user.username || 'N/A'}</TableCell>
                <TableCell>{user.coins}</TableCell>
                <TableCell>
                  {user.isBanned ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                      Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                      Active
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {user.isBanned ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => unbanMutation.mutate(user.id)}
                      disabled={unbanMutation.isPending}
                    >
                      Unban
                    </Button>
                  ) : (
                    <Dialog open={isBanModalOpen && selectedUserId === user.id} onOpenChange={(open) => {
                      setIsBanModalOpen(open);
                      if (open) setSelectedUserId(user.id);
                      else setSelectedUserId(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">Ban</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ban User</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleBan} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Reason for banning</Label>
                            <Input 
                              required 
                              value={banReason}
                              onChange={(e) => setBanReason(e.target.value)}
                              placeholder="e.g. Fraudulent behavior" 
                            />
                          </div>
                          <Button type="submit" disabled={banMutation.isPending} className="w-full">
                            Confirm Ban
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <Button variant="outline" onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  );
}

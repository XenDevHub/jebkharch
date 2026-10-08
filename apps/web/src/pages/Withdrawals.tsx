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

export function WithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [page, setPage] = useState(1);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['withdrawals', statusFilter, page],
    queryFn: async () => {
      const res = await api.admin.getWithdrawals(statusFilter || undefined, page);
      return res.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: (withdrawalId: string) => api.admin.approveWithdrawal(withdrawalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (args: { withdrawalId: string, reason: string }) => 
      api.admin.rejectWithdrawal(args.withdrawalId, args.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setIsRejectModalOpen(false);
      setRejectReason('');
      setSelectedWithdrawalId(null);
    }
  });

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWithdrawalId) {
      rejectMutation.mutate({ withdrawalId: selectedWithdrawalId, reason: rejectReason });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Withdrawal Requests</h2>
          <p className="text-muted-foreground text-sm">Approve or reject user payout requests</p>
        </div>
        
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Phone / ID</TableHead>
              <TableHead>Amount (PKR)</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Account Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">Loading requests...</TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  No withdrawal requests found for {statusFilter} status.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.user?.phone || 'N/A'}
                    <div className="text-xs text-muted-foreground">{item.userId}</div>
                  </TableCell>
                  <TableCell className="font-semibold text-green-500">
                    Rs. {item.amountPkr || item.amount}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                      {item.method || 'JazzCash/Easypaisa'}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{item.accountNumber}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'APPROVED' 
                        ? 'bg-green-500/10 text-green-500' 
                        : item.status === 'REJECTED'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {item.status === 'PENDING' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => approveMutation.mutate(item.id)}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </Button>

                        <Dialog open={isRejectModalOpen && selectedWithdrawalId === item.id} onOpenChange={(open) => {
                          setIsRejectModalOpen(open);
                          if (open) setSelectedWithdrawalId(item.id);
                          else setSelectedWithdrawalId(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">Reject</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Withdrawal Request</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleReject} className="space-y-4">
                              <div className="space-y-2">
                                <Label>Reason for rejection</Label>
                                <Input 
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  placeholder="e.g. Invalid account details" 
                                />
                              </div>
                              <Button type="submit" disabled={rejectMutation.isPending} variant="destructive" className="w-full">
                                Confirm Rejection & Refund Coins
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
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

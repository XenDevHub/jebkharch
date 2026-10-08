import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Banknote, Swords, Activity } from 'lucide-react';
import { api } from '@/api';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.admin.getAnalytics();
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="animate-pulse flex space-x-4">Loading dashboard...</div>;
  }

  const stats = [
    {
      title: "Total Users",
      value: data?.totalUsers || 0,
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Active Challenges",
      value: data?.activeChallenges || 0,
      icon: Swords,
      color: "text-orange-500"
    },
    {
      title: "Coins in Circulation",
      value: data?.totalCoins || 0,
      icon: Banknote,
      color: "text-green-500"
    },
    {
      title: "Pending Withdrawals",
      value: data?.pendingWithdrawals || 0,
      icon: Activity,
      color: "text-red-500"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Placeholder for future charts */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-border/50 text-muted-foreground">
            Activity feed coming soon...
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue / Coin Flow</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-border/50 text-muted-foreground">
            Chart coming soon...
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

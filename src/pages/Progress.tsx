import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, Activity, Target, Calendar, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WorkoutSession {
  id: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
}

export default function Progress() {
  const { user, loading } = useAuth(true);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [thisMonthWorkouts, setThisMonthWorkouts] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      fetchWorkoutData();
    }
  }, [loading, user]);

  const fetchWorkoutData = async () => {
    if (!user) return;

    // Get current month's start date
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data, error } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("started_at", monthStart.toISOString())
      .order("started_at", { ascending: true });

    if (error) {
      console.error("Error fetching workout data:", error);
      return;
    }

    setWorkoutSessions(data || []);
    
    // Calculate this month's workouts
    const completedWorkouts = (data || []).filter(s => s.completed_at).length;
    setThisMonthWorkouts(completedWorkouts);

    // Estimate calories burned (rough estimate: 300 calories per 30 min workout)
    const totalMinutes = (data || []).reduce((sum, session) => {
      return sum + (session.duration_seconds ? session.duration_seconds / 60 : 0);
    }, 0);
    const estimatedCalories = Math.round((totalMinutes / 30) * 300);
    setCaloriesBurned(estimatedCalories);

    // Calculate current streak
    calculateStreak(data || []);
  };

  const calculateStreak = (sessions: WorkoutSession[]) => {
    if (!sessions.length) {
      setCurrentStreak(0);
      return;
    }

    const completedSessions = sessions.filter(s => s.completed_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    // Check backwards from today
    for (let i = 0; i < 30; i++) {
      const hasWorkout = completedSessions.some(session => {
        const sessionDate = new Date(session.started_at);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime();
      });

      if (hasWorkout) {
        streak++;
      } else if (streak > 0 || i === 0) {
        // If we found a gap after starting to count, or no workout today, break
        if (i > 0 || !hasWorkout) break;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    setCurrentStreak(streak);
  };

  const getWeeklyWorkoutData = () => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekData = Array(7).fill(0).map((_, i) => ({
      day: daysOfWeek[i],
      workouts: 0,
    }));

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    workoutSessions.forEach(session => {
      if (!session.completed_at) return;
      
      const sessionDate = new Date(session.started_at);
      if (sessionDate >= weekStart) {
        const dayIndex = sessionDate.getDay();
        weekData[dayIndex].workouts++;
      }
    });

    return weekData;
  };

  const stats = [
    {
      icon: Activity,
      label: "Workouts This Month",
      value: thisMonthWorkouts.toString(),
      change: "Completed workouts",
      trend: "up",
    },
    {
      icon: Flame,
      label: "Calories Burned",
      value: caloriesBurned.toLocaleString(),
      change: "Estimated from workouts",
      trend: "up",
    },
    {
      icon: Target,
      label: "Active Days",
      value: new Set(workoutSessions.filter(s => s.completed_at).map(s => 
        new Date(s.started_at).toDateString()
      )).size.toString(),
      change: "Unique workout days",
      trend: "up",
    },
    {
      icon: Calendar,
      label: "Current Streak",
      value: `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`,
      change: currentStreak > 0 ? "Keep it going!" : "Start today!",
      trend: "up",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const weeklyData = getWeeklyWorkoutData();
  const thisWeekTotal = weeklyData.reduce((sum, day) => sum + day.workouts, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Progress Analytics</h1>
        <p className="text-muted-foreground">
          Track your fitness journey with detailed insights and charts
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 shadow-soft border-border">
              <div className="flex items-start justify-between mb-3">
                <Icon className="h-8 w-8 text-primary" />
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
              <div className="text-xs text-success">{stat.change}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Workouts */}
        <Card className="p-6 shadow-medium border-border">
          <h2 className="text-xl font-bold mb-6">This Week's Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar
                dataKey="workouts"
                fill="hsl(var(--accent))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-accent" />
              <span className="font-medium">{thisWeekTotal} workout{thisWeekTotal !== 1 ? 's' : ''} completed</span>
              <span className="text-muted-foreground">• {thisWeekTotal > 0 ? "Keep it up!" : "Let's get started!"}</span>
            </div>
          </div>
        </Card>

        {/* Monthly Progress */}
        <Card className="p-6 shadow-medium border-border">
          <h2 className="text-xl font-bold mb-6">Monthly Summary</h2>
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Total Workouts</div>
              <div className="text-4xl font-bold">{thisMonthWorkouts}</div>
              <div className="text-xs text-success mt-2">This month</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Calories Burned</div>
              <div className="text-4xl font-bold">{caloriesBurned.toLocaleString()}</div>
              <div className="text-xs text-success mt-2">Estimated total</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Current Streak</div>
              <div className="text-4xl font-bold">{currentStreak}</div>
              <div className="text-xs text-success mt-2">Consecutive days</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 shadow-soft border-border">
        <h2 className="text-xl font-bold mb-4">Recent Workouts</h2>
        {workoutSessions.length > 0 ? (
          <div className="space-y-3">
            {workoutSessions.slice(0, 5).reverse().map((session) => (
              <div key={session.id} className="p-4 bg-muted rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {new Date(session.started_at).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  {session.duration_seconds && (
                    <div className="text-sm text-muted-foreground">
                      Duration: {Math.round(session.duration_seconds / 60)} minutes
                    </div>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  session.completed_at ? 'bg-success/20 text-success' : 'bg-muted-foreground/20 text-muted-foreground'
                }`}>
                  {session.completed_at ? 'Completed' : 'Started'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No workouts yet this month. Start your first workout today!
          </div>
        )}
      </Card>
    </div>
  );
}

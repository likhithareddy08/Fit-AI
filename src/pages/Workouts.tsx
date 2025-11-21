import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutTimer } from "@/components/WorkoutTimer";
import { toast } from "sonner";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  duration: string;
  difficulty: string;
  day_of_week: number;
}

export default function Workouts() {
  const { user, loading } = useAuth(true);
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [workoutSessionId, setWorkoutSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchTodayWorkout();
    }
  }, [loading, user]);

  const fetchTodayWorkout = async () => {
    const dayOfWeek = new Date().getDay();
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("day_of_week", dayOfWeek)
      .single();

    if (error) {
      console.error("Error fetching workout:", error);
      return;
    }

    if (data) {
      setTodayWorkout({
        id: data.id,
        name: data.name,
        duration: data.duration,
        difficulty: data.difficulty,
        day_of_week: data.day_of_week,
        exercises: data.exercises as unknown as Exercise[],
      });
    }
  };

  const handleStartWorkout = async () => {
    if (!todayWorkout || !user) return;

    const { data, error } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: user.id,
        workout_id: todayWorkout.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to start workout");
      return;
    }

    setWorkoutSessionId(data.id);
    setShowTimer(true);
  };

  const handleCompleteWorkout = async (durationSeconds: number) => {
    if (!workoutSessionId) return;

    const { error } = await supabase
      .from("workout_sessions")
      .update({
        completed_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq("id", workoutSessionId);

    if (error) {
      toast.error("Failed to save workout");
      return;
    }

    toast.success("Workout completed! Great job!");
    setShowTimer(false);
    setWorkoutSessionId(null);
  };

  const handleCancelWorkout = () => {
    setShowTimer(false);
    setWorkoutSessionId(null);
  };

  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "text-success";
      case "Intermediate":
        return "text-accent";
      case "Advanced":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Today's Workout</h1>
        <p className="text-muted-foreground">
          Your personalized daily workout plan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Workout Card */}
        <div className="space-y-4">
          {todayWorkout ? (
            <Card className="p-6 shadow-soft border-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold mb-1">{todayWorkout.name}</h3>
                  <span className={`text-sm font-medium ${difficultyColor(todayWorkout.difficulty)}`}>
                    {todayWorkout.difficulty}
                  </span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
                  <Dumbbell className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {todayWorkout.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {todayWorkout.exercises.length} exercises
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center shadow-soft border-border">
              <Dumbbell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No workout scheduled for today</p>
            </Card>
          )}
        </div>

        {/* Workout Details or Timer */}
        <div>
          {showTimer ? (
            <WorkoutTimer onComplete={handleCompleteWorkout} onCancel={handleCancelWorkout} />
          ) : todayWorkout ? (
            <Card className="p-6 shadow-medium border-border sticky top-24">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{todayWorkout.name}</h2>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className={difficultyColor(todayWorkout.difficulty)}>
                    {todayWorkout.difficulty}
                  </span>
                  <span>•</span>
                  <span>{todayWorkout.duration}</span>
                  <span>•</span>
                  <span>{todayWorkout.exercises.length} exercises</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Exercises</h3>
                {todayWorkout.exercises.map((exercise, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="font-medium mb-2">{exercise.name}</div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">{exercise.sets}</span> sets
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{exercise.reps}</span> reps
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{exercise.rest}</span> rest
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-6" size="lg" onClick={handleStartWorkout}>
                Start Workout
              </Button>
            </Card>
          ) : (
            <Card className="p-12 text-center shadow-soft border-border">
              <Dumbbell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No workout to display</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, X } from "lucide-react";

interface WorkoutTimerProps {
  onComplete: (durationSeconds: number) => void;
  onCancel: () => void;
}

export function WorkoutTimer({ onComplete, onCancel }: WorkoutTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleComplete = () => {
    onComplete(seconds);
  };

  return (
    <Card className="p-6 shadow-elegant border-primary/20">
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Workout Timer</h3>
          <div className="text-5xl font-bold text-primary">{formatTime(seconds)}</div>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button onClick={handleComplete} size="lg">
            Complete Workout
          </Button>
          <Button variant="outline" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

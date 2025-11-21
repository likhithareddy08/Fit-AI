import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface NutritionAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  suggestions: string[];
}

interface Meal {
  id: string;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  logged_at: string;
}

export default function Nutrition() {
  const { user, loading } = useAuth(true);
  const [mealDescription, setMealDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [dailyGoal] = useState(2000);

  useEffect(() => {
    if (!loading && user) {
      fetchTodayMeals();
    }
  }, [loading, user]);

  const fetchTodayMeals = async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", `${today}T00:00:00`)
      .lte("logged_at", `${today}T23:59:59`)
      .order("logged_at", { ascending: false });

    if (error) {
      console.error("Error fetching meals:", error);
      return;
    }

    setTodayMeals(data || []);
  };

  const analyzeMeal = async () => {
    if (!mealDescription.trim()) {
      toast.error("Please describe your meal");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-nutrition", {
        body: { mealDescription },
      });

      if (error) throw error;

      setAnalysis(data);
      toast.success("Meal analyzed successfully!");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to analyze meal. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    if (!analysis || !user) return;

    const { error } = await supabase.from("meals").insert({
      user_id: user.id,
      meal_name: mealDescription,
      calories: analysis.calories,
      protein: analysis.protein,
      carbs: analysis.carbs,
      fats: analysis.fat,
    });

    if (error) {
      toast.error("Failed to save meal");
      return;
    }

    toast.success("Meal saved!");
    setMealDescription("");
    setAnalysis(null);
    fetchTodayMeals();
  };

  const deleteMeal = async (mealId: string) => {
    const { error } = await supabase.from("meals").delete().eq("id", mealId);

    if (error) {
      toast.error("Failed to delete meal");
      return;
    }

    toast.success("Meal deleted");
    fetchTodayMeals();
  };

  const todayCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const todayProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
  const todayCarbs = todayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
  const todayFats = todayMeals.reduce((sum, meal) => sum + meal.fats, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Smart Nutrition Tracker</h1>
        <p className="text-muted-foreground">
          AI-powered calorie tracking and personalized diet coaching
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Summary */}
        <Card className="lg:col-span-1 p-6 shadow-soft border-border">
          <h2 className="text-xl font-bold mb-4">Today's Progress</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Calories</span>
                <span className="text-sm text-muted-foreground">
                  {todayCalories} / {dailyGoal}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all"
                  style={{ width: `${Math.min((todayCalories / dailyGoal) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{todayProtein}g</div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{todayCarbs}g</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{todayFats}g</div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Meal Input */}
        <Card className="lg:col-span-2 p-6 shadow-soft border-border">
          <h2 className="text-xl font-bold mb-4">Log Your Meal</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="meal">Describe your meal</Label>
              <Textarea
                id="meal"
                placeholder="E.g., Grilled chicken breast with brown rice and steamed broccoli"
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button
              onClick={analyzeMeal}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze with AI
                </>
              )}
            </Button>
          </div>

          {analysis && (
            <div className="mt-6 space-y-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">Nutrition Analysis</h3>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                  <div className="text-xl font-bold">{analysis.calories}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                  <div className="text-xl font-bold text-primary">{analysis.protein}g</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                  <div className="text-xl font-bold text-accent">{analysis.carbs}g</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                  <div className="text-xl font-bold text-destructive">{analysis.fat}g</div>
                </div>
              </div>

              {analysis.suggestions.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">AI Suggestions:</div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={saveMeal} className="w-full mt-4">
                Save Meal
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Meals */}
      <Card className="p-6 shadow-soft border-border">
        <h2 className="text-xl font-bold mb-4">Today's Meals</h2>
        {todayMeals.length > 0 ? (
          <div className="space-y-3">
            {todayMeals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{meal.meal_name}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>{meal.calories} cal</span>
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                    <span>F: {meal.fats}g</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMeal(meal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No meals logged yet today. Start by describing your meal above!
          </div>
        )}
      </Card>
    </div>
  );
}

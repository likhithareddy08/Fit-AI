import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, UtensilsCrossed, Calendar, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import gymHero from "@/assets/gym-hero.jpg";

const features = [
  {
    icon: Brain,
    title: "AI Fitness Coach",
    description: "Get personalized workout advice, motivation, and real-time guidance",
    link: "/chat",
    gradient: "bg-gradient-primary",
  },
  {
    icon: UtensilsCrossed,
    title: "Smart Nutrition",
    description: "Track calories, get meal suggestions, and optimize your diet with AI",
    link: "/nutrition",
    gradient: "bg-gradient-accent",
  },
  {
    icon: Calendar,
    title: "Workout Planner",
    description: "Create custom routines and get AI-powered exercise recommendations",
    link: "/workouts",
    gradient: "bg-gradient-primary",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Visualize your fitness journey with detailed charts and insights",
    link: "/progress",
    gradient: "bg-gradient-accent",
  },
];

export default function Home() {
  const { user, loading } = useAuth(false);

  // Show sign-in button when not logged in (or still loading to avoid flash)
  const showSignIn = !user && !loading;

  return (
    <div className="space-y-16 pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl shadow-medium">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${gymHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        <div className="relative z-10 p-12 max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Your AI-Powered Fitness Companion
          </h1>
          <p className="text-xl text-foreground/90 mb-8">
            Transform your fitness journey with personalized AI coaching, smart nutrition tracking, and data-driven insights.
          </p>
          <div className="flex flex-wrap gap-4">
            {showSignIn ? (
              <Link to="/auth">
                <Button size="lg" variant="default" className="font-semibold">
                  Sign In to Get Started
                </Button>
              </Link>
            ) : user ? (
              <>
                <Link to="/chat">
                  <Button size="lg" variant="default" className="font-semibold">
                    Start Chatting with AI Coach
                  </Button>
                </Link>
                <Link to="/nutrition">
                  <Button size="lg" variant="outline" className="font-semibold">
                    Track Your Nutrition
                  </Button>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </section>
      {user && (
        <>
          {/* Features Grid */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Move better, Eat better and Live better ----with AI.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link key={feature.title} to={feature.link}>
                    <Card className="group p-8 border-border hover:border-primary transition-all duration-300 cursor-pointer shadow-soft hover:shadow-medium h-full">
                      <div
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.gradient} mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-muted rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Fitness?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your journey today with AI-powered coaching and personalized insights
            </p>
            <Link to="/chat">
              <Button size="lg" className="font-semibold">
                Get Started Now
              </Button>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Dumbbell } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const cacheBustRef = useRef(Math.random().toString(36).substring(7) + Date.now());

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
      toast.success("Account created successfully! Please log in.");
      setSignupEmail("");
      setSignupPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;
      toast.success("Logged in successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <div className="grid h-full w-full grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[300px] gap-2 md:gap-3 p-3 md:p-6">
          {[
            "https://tse3.mm.bing.net/th/id/OIP.Sfh7vV-6ZzqcF_PwFzxClAHaFX?rs=1&pid=ImgDetMain&o=7&rm=3",
            "https://tse1.mm.bing.net/th/id/OIP.iuKreRfRAXBZ-QLxSj3FiAHaE7?w=800&h=533&rs=1&pid=ImgDetMain&o=7&rm=3",
            "https://image.freepik.com/free-photo/muscular-man-doing-skipping-exercise_13339-164954.jpg",
            "https://cdn.mos.cms.futurecdn.net/hAKz2iHcz5tAamSCeNb75W.jpg",
            "https://th.bing.com/th/id/OIP.tCIXFQlKi5L8xkU5KGfwMQHaE8?w=236&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
            "https://blog.myfitnesspal.com/wp-content/uploads/2017/12/Essential-Guide-to-Healthy-Eating-2-1200x900.png",
            "https://tse1.mm.bing.net/th/id/OIP.ilUuBnCeXgj5eXztYWWP5gHaLH?pid=ImgDet&w=178&h=267&c=7&o=7&rm=3",
            "https://tse1.mm.bing.net/th/id/OIP.LW81GnFJbw__nL3fIs_D9QHaHa?pid=ImgDet&w=178&h=178&c=7&o=7&rm=3",
          ].map((src, index) => {
            // Create a balanced 2x4 grid layout where all images are clearly visible
            return (
            <div
              key={`bg-img-${index}-${cacheBustRef.current}`}
              className="rounded-[20px] md:rounded-[28px] bg-cover bg-center shadow-2xl ring-1 ring-white/10 transition duration-700 overflow-hidden"
              style={{ 
                backgroundImage: `url("${src}")`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="h-full w-full rounded-[32px] bg-gradient-to-br from-black/40 via-transparent to-black/50" />
            </div>
            );
          })}
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/65 to-black/65" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-elegant bg-background/95 backdrop-blur-xl border-border/40">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">FitAI</h1>
            </div>
          </div>
          <p className="text-center text-muted-foreground mb-6 italic">
            Where your potential meets precision
          </p>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

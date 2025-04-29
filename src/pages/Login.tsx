
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Sparkles } from "lucide-react";
import * as animeJs from 'animejs';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const animationRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate background particles
    if (animationRef.current) {
      const particles = Array.from({ length: 50 }).map(() => {
        const particle = document.createElement("div");
        particle.className = "particle";
        animationRef.current?.appendChild(particle);
        return particle;
      });

      particles.forEach((particle, i) => {
        const size = Math.random() * 8 + 3;
        const position = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = Math.random() * 10 + 10;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${position}%`;
        particle.style.top = `-${size}px`;
        particle.style.opacity = `${Math.random() * 0.6 + 0.2}`;
        particle.style.backgroundColor = [
          "#FFA07A", "#FF7F50", "#FF6347", 
          "#87CEFA", "#B0E0E6", "#ADD8E6",
          "#FFD700", "#FFFFE0", "#FFFACD"
        ][Math.floor(Math.random() * 9)];

        animeJs.default({
          targets: particle,
          top: "100vh",
          rotate: Math.random() * 360,
          delay: delay * 1000,
          duration: duration * 1000,
          easing: "linear",
          loop: true
        });
      });
    }

    // Animate card entrance
    if (cardRef.current) {
      animeJs.default({
        targets: cardRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.95, 1],
        duration: 800,
        easing: "easeOutCubic"
      });
    }

    // Animate logo
    if (logoRef.current) {
      animeJs.default({
        targets: logoRef.current,
        rotate: [0, 360],
        duration: 2000,
        delay: 500,
        easing: "easeInOutQuad"
      });
    }

  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginUser(email, password);
      
      animeJs.default({
        targets: cardRef.current,
        translateY: -30,
        opacity: 0,
        scale: 0.9,
        duration: 400,
        easing: "easeInCubic",
        complete: () => {
          toast({
            title: "Login Successful",
            description: "Welcome back to StockEase!",
          });
          navigate("/dashboard");
        }
      });
      
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Login Failed",
        description: error.message || "Failed to login. Please try again.",
        variant: "destructive",
      });
      
      // Shake animation on error
      animeJs.default({
        targets: cardRef.current,
        translateX: [0, -10, 10, -10, 10, -5, 5, 0],
        duration: 600,
        easing: "easeInOutSine"
      });
      
      setIsLoading(false);
    }
  };

  const handleInputFocus = (el: HTMLInputElement) => {
    animeJs.default({
      targets: el,
      scale: [1, 1.03, 1],
      duration: 300,
      easing: "easeInOutSine"
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      <div ref={animationRef} className="absolute inset-0 overflow-hidden" />
      
      <div className="absolute inset-0 bg-gradient-to-br from-stockease-600/30 via-transparent to-purple-500/20 z-0" />
      
      <div className="w-full max-w-md p-4 z-10 relative">
        <Card className="shadow-xl shadow-blue-900/5 backdrop-blur-sm bg-white/95 border-stockease-200" ref={cardRef}>
          <CardHeader className="space-y-1 flex flex-col items-center pb-2">
            <div 
              ref={logoRef}
              className="flex items-center justify-center rounded-full bg-gradient-to-br from-stockease-600 to-stockease-400 p-3 mb-4 shadow-lg shadow-stockease-400/30"
            >
              <Package className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-br from-stockease-800 to-stockease-600 bg-clip-text text-transparent">
              StockEase
            </CardTitle>
            <CardDescription className="text-center text-stockease-700/70 font-medium">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2 relative">
                <Label htmlFor="email" className="text-stockease-700 font-medium">Email Address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => handleInputFocus(e.target)}
                    className="bg-stockease-50/50 border-stockease-200 focus:border-stockease-400 pl-4 transition-all duration-300 group-hover:border-stockease-300 shadow-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-stockease-700 font-medium">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-stockease-600 hover:text-stockease-500 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={(e) => handleInputFocus(e.target)}
                    className="bg-stockease-50/50 border-stockease-200 focus:border-stockease-400 pl-4 transition-all duration-300 group-hover:border-stockease-300 shadow-sm"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-stockease-600 to-stockease-500 hover:from-stockease-700 hover:to-stockease-600 text-white shadow-lg shadow-stockease-500/20 hover:shadow-stockease-600/30 transition-all duration-300 font-medium text-base" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Sign In
                  </span>
                )}
              </Button>
              <div className="flex items-center gap-4 my-2">
                <div className="h-px bg-stockease-200 flex-grow"></div>
                <span className="text-stockease-400 text-sm">or</span>
                <div className="h-px bg-stockease-200 flex-grow"></div>
              </div>
              <p className="text-sm text-center text-stockease-600">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-stockease-700 hover:text-stockease-800 hover:underline transition-all">
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;


import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Package, 
  ArrowRight,
  Star,
  BarChart3, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  Github,
  Linkedin,
  Twitter,
  Instagram
} from "lucide-react";
import Scene3D from "@/components/Scene3D";
import ErrorBoundary from "@/components/ErrorBoundary";

const Home = () => {
  const { currentUser } = useAuth();

  const features = [
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track stock levels and manage products efficiently"
    },
    {
      icon: BarChart3,
      title: "Sales Analytics",
      description: "Comprehensive sales reports and insights"
    },
    {
      icon: Users,
      title: "Multi-User Support",
      description: "Admin and employee roles with permissions"
    },
    {
      icon: TrendingUp,
      title: "Advanced Reports",
      description: "Detailed business insights and analytics"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security and data protection"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Live synchronization across all devices"
    }
  ];

  const developers = [
    {
      name: "Megharaj Dandgavhal",
      role: "Full Stack Developer",
      image: "/lovable-uploads/6e46d40b-d83d-4d46-bc29-df6b1f071c18.png",
      social: {
        github: "https://github.com/megharaj",
        linkedin: "https://linkedin.com/in/megharaj-dandgavhal",
        twitter: "https://twitter.com/megharaj"
      }
    },
    {
      name: "Samruddhi Gore",
      role: "Frontend Developer",
      image: "/lovable-uploads/6e46d40b-d83d-4d46-bc29-df6b1f071c18.png",
      social: {
        github: "https://github.com/samruddhi",
        linkedin: "https://linkedin.com/in/samruddhi-gore",
        instagram: "https://instagram.com/samruddhi"
      }
    },
    {
      name: "Samyak Hirap",
      role: "Backend Developer",
      image: "/lovable-uploads/6e46d40b-d83d-4d46-bc29-df6b1f071c18.png",
      social: {
        github: "https://github.com/samyak",
        linkedin: "https://linkedin.com/in/samyak-hirap",
        twitter: "https://twitter.com/samyak"
      }
    },
    {
      name: "Tanisha Godha",
      role: "UI/UX Designer",
      image: "/lovable-uploads/6e46d40b-d83d-4d46-bc29-df6b1f071c18.png",
      social: {
        github: "https://github.com/tanisha",
        linkedin: "https://linkedin.com/in/tanisha-godha",
        instagram: "https://instagram.com/tanisha"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stockease-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stockease-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-stockease-600 to-stockease-400 p-2">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-stockease-600 to-stockease-400 bg-clip-text text-transparent">
                StockEase
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <Button asChild className="bg-gradient-to-r from-stockease-600 to-stockease-500 hover:from-stockease-700 hover:to-stockease-600">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="border-stockease-200 hover:bg-stockease-50">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-stockease-600 to-stockease-500 hover:from-stockease-700 hover:to-stockease-600">
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 3D Hero Section */}
      <section className="relative h-screen flex items-center">
        {/* 3D Canvas Background */}
        <ErrorBoundary>
          <Scene3D />
        </ErrorBoundary>
        
        {/* Hero Content Overlay */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-4xl mx-auto border border-white/20">
            <div className="flex items-center justify-center mb-6">
              <Star className="h-4 w-4 mr-2 text-stockease-600" />
              <span className="text-stockease-700 font-medium">Trusted by 10,000+ businesses</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-stockease-800 via-stockease-600 to-stockease-500 bg-clip-text text-transparent leading-tight">
              Smart Inventory
              <br />
              Management
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
              Transform your business with our comprehensive 3D-powered inventory and sales management system. 
              Experience the future of business management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-stockease-600 to-stockease-500 hover:from-stockease-700 hover:to-stockease-600 text-lg px-8 py-6"
                  asChild
                >
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-stockease-600 to-stockease-500 hover:from-stockease-700 hover:to-stockease-600 text-lg px-8 py-6"
                    asChild
                  >
                    <Link to="/register">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-lg px-8 py-6"
                    asChild
                  >
                    <Link to="/login">
                      Sign In
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Everything You Need in 3D
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience inventory management like never before with our interactive 3D interface
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-6 bg-gradient-to-br from-white to-stockease-50/30 rounded-2xl border border-stockease-100 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stockease-500 to-stockease-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Team Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-stockease-50/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Meet Our Development Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The talented individuals behind StockEase
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {developers.map((developer, index) => (
              <div 
                key={index} 
                className="group p-6 bg-white rounded-2xl border border-stockease-100 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="text-center mb-4">
                  <img
                    src={developer.image}
                    alt={developer.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-stockease-100 group-hover:border-stockease-300 transition-colors"
                  />
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{developer.name}</h3>
                  <p className="text-stockease-600 font-medium">{developer.role}</p>
                </div>
                
                <div className="flex justify-center space-x-3">
                  {developer.social.github && (
                    <a
                      href={developer.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-gray-100 hover:bg-stockease-100 transition-colors"
                    >
                      <Github className="h-4 w-4 text-gray-600 hover:text-stockease-600" />
                    </a>
                  )}
                  {developer.social.linkedin && (
                    <a
                      href={developer.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      <Linkedin className="h-4 w-4 text-blue-600" />
                    </a>
                  )}
                  {developer.social.twitter && (
                    <a
                      href={developer.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      <Twitter className="h-4 w-4 text-blue-600" />
                    </a>
                  )}
                  {developer.social.instagram && (
                    <a
                      href={developer.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
                    >
                      <Instagram className="h-4 w-4 text-pink-600" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-stockease-600 to-stockease-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-12 h-12 bg-white rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready for the 3D Revolution?
          </h2>
          <p className="text-xl text-stockease-100 mb-8">
            Join the future of inventory management with our immersive 3D interface
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {currentUser ? (
              <Button 
                size="lg" 
                className="bg-white text-stockease-600 hover:bg-stockease-50 text-lg px-8 py-6"
                asChild
              >
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="bg-white text-stockease-600 hover:bg-stockease-50 text-lg px-8 py-6"
                asChild
              >
                <Link to="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

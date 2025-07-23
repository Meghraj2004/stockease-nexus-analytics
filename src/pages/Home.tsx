
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Smartphone
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const features = [
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track stock levels, manage products, and get real-time alerts for low inventory.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Sales Analytics",
      description: "Comprehensive sales reports with insights and performance metrics.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Multi-User Support",
      description: "Admin and employee roles with granular permissions and access control.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "Advanced Reports",
      description: "Generate detailed reports for inventory, sales, and business insights.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with data backup and recovery options.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Live synchronization across all devices and instant notifications.",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const benefits = [
    "Reduce inventory costs by up to 30%",
    "Automate manual processes",
    "Real-time stock alerts",
    "Comprehensive analytics dashboard",
    "Multi-location support",
    "Export reports in multiple formats"
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
              <Button variant="outline" asChild className="border-stockease-200 hover:bg-stockease-50">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-stockease-600 to-stockease-500 hover:from-stockease-700 hover:to-stockease-600">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-stockease-100 text-stockease-700 hover:bg-stockease-200">
            <Star className="h-3 w-3 mr-1" />
            Trusted by 10,000+ businesses
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-stockease-800 via-stockease-600 to-stockease-500 bg-clip-text text-transparent leading-tight">
            Smart Inventory & Sales Management
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform your business with our comprehensive inventory and sales management system. 
            Track stock, manage sales, and analyze performance all in one powerful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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
              className="border-stockease-200 hover:bg-stockease-50 text-lg px-8 py-6"
              asChild
            >
              <Link to="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Everything You Need to Manage Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your operations and boost productivity
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-stockease-100 group">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-stockease-50 to-indigo-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Why Choose StockEase?
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of businesses that trust StockEase for their inventory management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm border border-stockease-100">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-stockease-600 to-stockease-500">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-stockease-100 mb-8">
            Start your free trial today and see how StockEase can streamline your operations
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-stockease-600 to-stockease-400 p-2">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">StockEase</span>
              </div>
              <p className="text-gray-400">
                The complete inventory and sales management solution for modern businesses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
                <li>API</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Community</li>
                <li>Status</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StockEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

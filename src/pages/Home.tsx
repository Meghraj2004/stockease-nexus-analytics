
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Environment, Float, PerspectiveCamera } from '@react-three/drei';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  Package, 
  ArrowRight,
  Star,
  BarChart3, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap
} from "lucide-react";

// 3D Components
function FloatingBox({ position, color, ...props }: any) {
  return (
    <Float speed={1.4} rotationIntensity={1} floatIntensity={2}>
      <Box position={position} {...props}>
        <meshStandardMaterial color={color} />
      </Box>
    </Float>
  );
}

function FloatingSphere({ position, color, ...props }: any) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <Sphere position={position} {...props}>
        <meshStandardMaterial color={color} />
      </Sphere>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2} />
      
      <Environment preset="city" />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Main central logo/text */}
      <Text
        position={[0, 1, 0]}
        fontSize={1.2}
        color="#0284c7"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        StockEase
      </Text>
      
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.3}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        Inventory Management System
      </Text>
      
      {/* Floating 3D elements */}
      <FloatingBox position={[-3, 2, -1]} color="#0ea5e9" args={[0.8, 0.8, 0.8]} />
      <FloatingSphere position={[3, 2, -1]} color="#8b5cf6" args={[0.5]} />
      <FloatingBox position={[-2, -1.5, -2]} color="#10b981" args={[0.6, 1.2, 0.6]} />
      <FloatingSphere position={[2.5, -1, -1]} color="#f59e0b" args={[0.4]} />
      <FloatingBox position={[0, -2.5, -3]} color="#ef4444" args={[1, 0.4, 1]} />
      <FloatingSphere position={[-3.5, 0, -2]} color="#06b6d4" args={[0.3]} />
      
      {/* Background elements */}
      <FloatingBox position={[4, 3, -4]} color="#0284c7" args={[0.4, 0.4, 0.4]} />
      <FloatingSphere position={[-4, -2, -4]} color="#7c3aed" args={[0.3]} />
    </>
  );
}

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
        <div className="absolute inset-0 z-0">
          <Canvas>
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        </div>
        
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

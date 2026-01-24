import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Clock, 
  Award, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Target,
  TrendingUp,
  Sparkles,
  Rocket,
  Globe,
  Brain,
  Lightbulb,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: "Smart Attendance",
      description: "QR-based attendance system with real-time tracking and automated reports",
      color: "bg-blue-50"
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Student Management",
      description: "Comprehensive student database with performance analytics and progress tracking",
      color: "bg-green-50"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Advanced Analytics",
      description: "Powerful insights and dashboards for data-driven decision making",
      color: "bg-purple-50"
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-600" />,
      title: "Timetable Management",
      description: "Intelligent scheduling system with conflict detection and optimization",
      color: "bg-orange-50"
    },
    {
      icon: <Award className="h-8 w-8 text-red-600" />,
      title: "Performance Tracking",
      description: "Monitor academic progress with detailed reports and achievement badges",
      color: "bg-red-50"
    },
    {
      icon: <Shield className="h-8 w-8 text-indigo-600" />,
      title: "Secure Platform",
      description: "Enterprise-grade security with role-based access control",
      color: "bg-indigo-50"
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Students" },
    { value: "500+", label: "Educational Institutions" },
    { value: "99.9%", label: "Uptime Guaranteed" },
    { value: "24/7", label: "Support Available" }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Principal, Tech Academy",
      content: "This platform has revolutionized how we manage attendance and track student performance. Absolutely game-changing!",
      rating: 5
    },
    {
      name: "Prof. Michael Chen",
      role: "Department Head, Innovation University",
      content: "The analytics features provide insights we never had before. It's transformed our decision-making process.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Academic Coordinator",
      content: "Simple, intuitive, and powerful. Everything we needed in one comprehensive solution.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden relative">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating Gradient Orbs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-full blur-3xl opacity-30 animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-44 h-44 bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 rounded-full blur-3xl opacity-30 animate-float animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-36 h-36 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full blur-3xl opacity-30 animate-float animation-delay-6000"></div>
        
        {/* Animated Particles */}
        <div className="absolute top-10 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-purple-400 rounded-full animate-pulse-slow animation-delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-2/3 left-1/3 w-4 h-4 bg-indigo-400 rounded-full animate-pulse-slow animation-delay-3000"></div>
        <div className="absolute bottom-10 right-1/2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse-slow animation-delay-4000"></div>
        
        {/* Floating Bubbles */}
        <div className="absolute top-1/4 left-1/6 w-8 h-8 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-40 animate-bubble-float animation-delay-500"></div>
        <div className="absolute top-1/2 right-1/6 w-6 h-6 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-30 animate-bubble-float animation-delay-1500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-10 h-10 bg-gradient-to-r from-indigo-300 to-blue-300 rounded-full opacity-35 animate-bubble-float animation-delay-2500"></div>
        <div className="absolute top-3/4 right-1/3 w-7 h-7 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full opacity-30 animate-bubble-float animation-delay-3500"></div>
        <div className="absolute top-1/6 left-1/2 w-5 h-5 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-25 animate-bubble-float animation-delay-4500"></div>
        <div className="absolute bottom-1/6 right-1/5 w-9 h-9 bg-gradient-to-r from-green-300 to-blue-300 rounded-full opacity-35 animate-bubble-float animation-delay-5500"></div>
        <div className="absolute top-2/5 left-1/4 w-4 h-4 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full opacity-20 animate-bubble-float animation-delay-6500"></div>
        <div className="absolute top-3/5 right-1/4 w-6 h-6 bg-gradient-to-r from-red-300 to-pink-300 rounded-full opacity-25 animate-bubble-float animation-delay-7500"></div>
        
        {/* Rotating Shapes */}
        <div className="absolute top-20 right-1/4 w-16 h-16 border-2 border-blue-300/30 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-20 left-1/3 w-12 h-12 border-2 border-purple-300/30 animate-spin-slow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/5 w-20 h-20 border-2 border-pink-300/30 rotate-12 animate-spin-slow animation-delay-4000"></div>
        
        {/* Wave Patterns */}
        <svg className="absolute bottom-0 left-0 w-full h-32 opacity-20" viewBox="0 0 1440 120" fill="none">
          <path d="M0,60 C320,120 420,0 720,60 C1020,120 1120,0 1440,60 L1440,120 L0,120 Z" 
                className="fill-blue-300 animate-wave" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-24 opacity-15" viewBox="0 0 1440 100" fill="none">
          <path d="M0,50 C240,100 360,0 600,50 C840,100 960,0 1200,50 C1320,75 1380,25 1440,50 L1440,100 L0,100 Z" 
                className="fill-purple-300 animate-wave animation-delay-1000" />
        </svg>
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TechnoCrats</span>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">Features</button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">About</button>
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div 
          className="container mx-auto relative"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <div className="text-center max-w-5xl mx-auto">
            {/* Floating Badge */}
            <div className="mb-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200 animate-bounce">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Next-Generation Education Management</span>
              <ChevronRight className="w-4 h-4 text-blue-600" />
            </div>
            
            {/* Main Heading with Animation */}
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
              <span className="block animate-fade-in-down">Transform Your</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient bg-300">
                Educational
              </span>
              <span className="block animate-fade-in-up">Experience</span>
            </h1>
            
            {/* Enhanced Description */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Empower your institution with cutting-edge attendance tracking, 
              comprehensive student management, and powerful analytics - all in one unified platform.
            </p>
            
            {/* CTA Buttons with Enhanced Styling */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="px-10 py-5 text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 group"
                onClick={() => navigate("/login")}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Rocket className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                Get Started Now
                <ArrowRight className={`ml-3 w-6 h-6 transition-all duration-500 ${isHovered ? 'translate-x-2 opacity-100' : 'translate-x-0 opacity-70'}`} />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-5 text-xl font-bold border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
              >
                <Globe className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Watch Demo
              </Button>
            </div>
            
            {/* Animated Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-gray-600 mt-2 group-hover:text-gray-900 transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Enhanced Decorative Elements */}
        <div className="absolute top-40 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-60 right-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-30 animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full blur-3xl opacity-30 animate-float animation-delay-4000"></div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
              <Lightbulb className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                {" "}Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to streamline your educational operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-0 shadow-lg overflow-hidden ${
                  activeFeature === index ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-8 relative">
                  <div className={`w-20 h-20 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Learn more</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 px-3 py-1 text-sm font-medium bg-green-100 text-green-800">
                <Target className="w-4 h-4 mr-2" />
                Why Choose Us
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Elevate Your Educational Standards
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Join thousands of institutions that have transformed their operations 
                with our comprehensive management platform.
              </p>
              
              <div className="space-y-4">
                {[
                  "Increase attendance accuracy by 95%",
                  "Reduce administrative workload by 60%",
                  "Improve student engagement by 40%",
                  "Generate comprehensive reports instantly"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className="mt-8 px-6 py-3 font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300"
                onClick={() => navigate("/login")}
              >
                Start Your Journey
                <TrendingUp className="ml-2 w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl transform rotate-3"></div>
              <Card className="relative bg-white rounded-3xl p-8 shadow-2xl">
                <div className="text-center">
                  <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                    98%
                  </div>
                  <div className="text-xl font-semibold text-gray-900 mb-2">Customer Satisfaction</div>
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600">
                    Based on reviews from 500+ educational institutions worldwide
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}Leaders
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what educators are saying about our platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the revolution in educational management. Start your free trial today.
          </p>
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
            onClick={() => navigate("/login")}
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-blue-100 mt-4">No credit card required • Setup in minutes</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

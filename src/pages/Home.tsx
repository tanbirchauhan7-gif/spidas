import { Shield, Cpu, Radio, Lock, Brain, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Home = () => {
  const features = [
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "Arduino-Based Detection",
      description: "PIR & vibration sensors for perimeter monitoring"
    },
    {
      icon: <Radio className="w-8 h-8" />,
      title: "Bluetooth Communication",
      description: "HC-05 module for wireless data transmission"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "AES Encryption",
      description: "Secure communication with 128-bit encryption"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "ML Classification",
      description: "Human vs animal detection using machine learning"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Cloud Logging",
      description: "Google Sheets integration for data storage"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Real-Time Alerts",
      description: "Instant intrusion notifications on dashboard"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Smart Perimeter Intrusion Detection</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            SPIDAS Project
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            An intelligent security system combining Arduino hardware, Bluetooth communication, 
            AES encryption, and machine learning for advanced perimeter protection.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="shadow-glow">
                View Live Dashboard
              </Button>
            </Link>
            <Link to="/system">
              <Button size="lg" variant="outline">
                Explore System
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="p-8 bg-gradient-card">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">2</div>
              <div className="text-muted-foreground">Sensors Used</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">128-bit</div>
              <div className="text-muted-foreground">AES Encryption</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5</div>
              <div className="text-muted-foreground">Project Parts</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4</div>
              <div className="text-muted-foreground">Team Members</div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Home;

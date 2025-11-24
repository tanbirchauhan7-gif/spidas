import { Shield, Cpu, Radio, Lock, Brain, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";

const Home = () => {
  const features = [
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "Arduino-Based Detection",
      description: "PIR & vibration sensors for perimeter monitoring",
      details: "Our system uses Arduino microcontrollers with PIR (Passive Infrared) motion sensors and vibration sensors to create a comprehensive perimeter monitoring solution. The PIR sensors detect heat signatures from moving objects, while vibration sensors identify physical disturbances along the perimeter fence or walls."
    },
    {
      icon: <Radio className="w-8 h-8" />,
      title: "Bluetooth Communication",
      description: "HC-05 module for wireless data transmission",
      details: "The HC-05 Bluetooth module enables seamless wireless communication between the Arduino sensors and your smartphone. This allows you to receive alerts, control the LED indicators, and monitor system status remotely from your phone within Bluetooth range."
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "AES Encryption",
      description: "Secure communication with 128-bit encryption",
      details: "All data transmitted between the sensors, server, and dashboard is protected using AES (Advanced Encryption Standard) 128-bit encryption. This military-grade encryption ensures that your security data cannot be intercepted or tampered with by unauthorized parties."
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "ML Classification",
      description: "Human vs animal detection using machine learning",
      details: "Our machine learning algorithms analyze sensor patterns to distinguish between human intruders and animals, significantly reducing false alarms. The ML model is trained on various movement patterns and can achieve high accuracy in classification."
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Cloud Logging",
      description: "Google Sheets integration for data storage",
      details: "Every intrusion event is automatically logged to Google Sheets via our edge functions, creating a persistent audit trail. This allows you to review historical data, analyze patterns, and generate reports on security incidents over time."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Real-Time Alerts",
      description: "Instant intrusion notifications on dashboard",
      details: "The dashboard receives real-time alerts via WebSocket connections the moment an intrusion is detected. You'll see instant notifications with sensor information, timestamps, and alert types. The LED indicator also activates automatically with configurable auto-off timers."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 animate-fade-in hover-scale">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Smart Perimeter Intrusion Detection</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
            SPIDAS Project
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            An intelligent security system combining Arduino hardware, Bluetooth communication, 
            AES encryption, and machine learning for advanced perimeter protection.
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-fade-in">
            <Link to="/dashboard">
              <Button size="lg" className="shadow-glow hover-scale">
                View Live Dashboard
              </Button>
            </Link>
            <Link to="/system">
              <Button size="lg" variant="outline" className="hover-scale">
                Explore System
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Popover key={index}>
              <PopoverTrigger asChild>
                <Card className="p-6 hover:shadow-glow transition-all duration-500 hover:-translate-y-2 cursor-pointer animate-fade-in hover-scale">
                  <div className="bg-gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white transition-transform duration-300 group-hover:rotate-12">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-card/95 backdrop-blur-sm border-primary/20 shadow-glow animate-scale-in">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-primary w-10 h-10 rounded-lg flex items-center justify-center text-white">
                      {feature.icon}
                    </div>
                    <h4 className="font-bold text-lg">{feature.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.details}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="p-8 bg-gradient-card animate-fade-in hover:shadow-glow transition-all duration-500">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in hover-scale transition-transform duration-300">
              <div className="text-4xl font-bold text-primary mb-2">2</div>
              <div className="text-muted-foreground">Sensors Used</div>
            </div>
            <div className="animate-fade-in hover-scale transition-transform duration-300">
              <div className="text-4xl font-bold text-primary mb-2">128-bit</div>
              <div className="text-muted-foreground">AES Encryption</div>
            </div>
            <div className="animate-fade-in hover-scale transition-transform duration-300">
              <div className="text-4xl font-bold text-primary mb-2">5</div>
              <div className="text-muted-foreground">Project Parts</div>
            </div>
            <div className="animate-fade-in hover-scale transition-transform duration-300">
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

import { Card } from "@/components/ui/card";
import { Shield, Radio, Zap, Cpu, Smartphone } from "lucide-react";

const SystemOverview = () => {
  const components = [
    {
      icon: <Cpu className="w-8 h-8" />,
      name: "Arduino UNO",
      description: "Main microcontroller for processing sensor data and controlling the system",
      specs: ["ATmega328P", "5V Operating", "16MHz Clock"]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      name: "PIR Sensor",
      description: "Passive Infrared sensor for detecting motion and heat signatures",
      specs: ["Detection Range: 7m", "120° Detection Angle", "Digital Output"]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      name: "Vibration Sensor",
      description: "SW-420 module for detecting physical disturbances",
      specs: ["High Sensitivity", "Adjustable Threshold", "Digital Output"]
    },
    {
      icon: <Radio className="w-8 h-8" />,
      name: "HC-05 Bluetooth",
      description: "Wireless communication module for data transmission",
      specs: ["Bluetooth 2.0", "10m Range", "9600 Baud Rate"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            System Overview
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete hardware architecture and component specifications
          </p>
        </div>

        {/* Working Principle */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Working Principle
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <strong className="text-foreground">1. Detection Phase:</strong> PIR sensor continuously monitors for 
              motion while vibration sensor detects physical disturbances along the perimeter.
            </p>
            <p>
              <strong className="text-foreground">2. Processing:</strong> Arduino UNO processes sensor inputs 
              and determines if an intrusion event has occurred based on predefined thresholds.
            </p>
            <p>
              <strong className="text-foreground">3. Encryption:</strong> Alert data is encrypted using AES-128 
              algorithm to ensure secure transmission.
            </p>
            <p>
              <strong className="text-foreground">4. Transmission:</strong> HC-05 Bluetooth module wirelessly 
              transmits encrypted data to receiving device.
            </p>
            <p>
              <strong className="text-foreground">5. Alert Display:</strong> Website dashboard displays real-time 
              alerts with timestamps and event logs.
            </p>
          </div>
        </Card>

        {/* Components Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {components.map((component, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="bg-gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white">
                {component.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{component.name}</h3>
              <p className="text-muted-foreground mb-4">{component.description}</p>
              <div className="space-y-1">
                {component.specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{spec}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* System Flow Diagram */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">System Flow</h2>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {[
              { icon: Zap, label: "Sensors Detect" },
              { icon: Cpu, label: "Arduino Processes" },
              { icon: Shield, label: "AES Encrypts" },
              { icon: Radio, label: "BT Transmits" },
              { icon: Smartphone, label: "Dashboard Displays" }
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="text-center">
                  <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mb-2 text-white mx-auto">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium">{step.label}</p>
                </div>
                {index < 4 && (
                  <div className="hidden md:block w-8 h-0.5 bg-gradient-to-r from-primary to-accent" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SystemOverview;

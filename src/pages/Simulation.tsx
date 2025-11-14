import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, CircuitBoard } from "lucide-react";

const Simulation = () => {
  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Tinkercad Simulation
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Virtual circuit design and testing before physical implementation
          </p>
        </div>

        {/* Main Simulation Card */}
        <Card className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <CircuitBoard className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">Circuit Design</h2>
          </div>
          
          <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
            <div className="text-center">
              <CircuitBoard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Tinkercad simulation screenshot placeholder
              </p>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                View on Tinkercad
              </Button>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-3">Simulation Features</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Complete circuit diagram with all components</li>
              <li>PIR sensor behavior simulation</li>
              <li>Vibration sensor trigger testing</li>
              <li>Arduino code testing and debugging</li>
              <li>Serial monitor output verification</li>
            </ul>
          </div>
        </Card>

        {/* Sensor Behavior Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">PIR Sensor Behavior</h3>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Idle State:</strong> No motion detected, output LOW</p>
              <p><strong className="text-foreground">Detection:</strong> Motion detected, output HIGH for 2-3 seconds</p>
              <p><strong className="text-foreground">Reset Time:</strong> 2 seconds before next detection</p>
              <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                <code className="text-sm text-success">
                  digitalRead(PIR_PIN) == HIGH → Intrusion Detected
                </code>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Vibration Sensor Behavior</h3>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Idle State:</strong> No vibration, output LOW</p>
              <p><strong className="text-foreground">Detection:</strong> Vibration detected, output HIGH</p>
              <p><strong className="text-foreground">Sensitivity:</strong> Adjustable via potentiometer</p>
              <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                <code className="text-sm text-success">
                  digitalRead(VIB_PIN) == HIGH → Disturbance Detected
                </code>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Simulation;

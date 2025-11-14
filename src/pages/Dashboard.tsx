import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Radio, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: number;
  timestamp: string;
  type: "intrusion" | "safe";
  message: string;
  sensor: string;
}

const Dashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"safe" | "alert">("safe");
  const { toast } = useToast();

  // Simulate Bluetooth data feed
  const simulateAlert = () => {
    const types: Array<"intrusion" | "safe"> = ["intrusion", "intrusion", "safe"];
    const sensors = ["PIR Sensor", "Vibration Sensor", "Both Sensors"];
    const messages = [
      "Motion detected in Zone A",
      "Perimeter breach detected",
      "All systems normal",
      "Vibration detected at fence line",
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const newAlert: Alert = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      type,
      message: type === "intrusion" ? messages[Math.floor(Math.random() * 2)] : messages[2],
      sensor: sensors[Math.floor(Math.random() * sensors.length)],
    };

    setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
    setCurrentStatus(type === "intrusion" ? "alert" : "safe");

    if (type === "intrusion") {
      toast({
        title: "⚠️ Intrusion Detected!",
        description: newAlert.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMonitoring) {
      interval = setInterval(simulateAlert, 5000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    toast({
      title: "Monitoring Started",
      description: "Real-time alert system is now active",
    });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setCurrentStatus("safe");
    toast({
      title: "Monitoring Stopped",
      description: "Alert system has been paused",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Real-Time Alert Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Live intrusion detection and monitoring system
          </p>
        </div>

        {/* Status Card */}
        <Card className="p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${currentStatus === "alert" ? "bg-destructive animate-pulse" : "bg-success"}`} />
              <div>
                <h2 className="text-2xl font-bold">System Status</h2>
                <p className="text-muted-foreground">
                  {currentStatus === "alert" ? "⚠️ INTRUSION DETECTED" : "✓ All Systems Normal"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {!isMonitoring ? (
                <Button onClick={startMonitoring} size="lg" className="shadow-glow">
                  <Radio className="w-4 h-4 mr-2" />
                  Start Monitoring
                </Button>
              ) : (
                <Button onClick={stopMonitoring} size="lg" variant="destructive">
                  Stop Monitoring
                </Button>
              )}
            </div>
          </div>

          {isMonitoring && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary">{alerts.filter(a => a.type === "intrusion").length}</div>
                <div className="text-sm text-muted-foreground">Total Alerts</div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-2xl font-bold text-success">{alerts.filter(a => a.type === "safe").length}</div>
                <div className="text-sm text-muted-foreground">Normal Status</div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{alerts.length}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </div>
            </div>
          )}
        </Card>

        {/* Alert Console */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Alert Console</h2>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No alerts yet. Start monitoring to see real-time events.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.type === "intrusion"
                      ? "bg-destructive/10 border-destructive/20"
                      : "bg-success/10 border-success/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {alert.type === "intrusion" ? (
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sensor: {alert.sensor}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={alert.type === "intrusion" ? "destructive" : "default"}>
                        {alert.type === "intrusion" ? "ALERT" : "SAFE"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">{alert.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

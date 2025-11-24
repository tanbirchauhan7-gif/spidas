import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Radio, Clock, Wifi, WifiOff, Lightbulb, LightbulbOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [wsUrl, setWsUrl] = useState("wss://unhurtful-drawn-tish.ngrok-free.dev");
  const [isConnected, setIsConnected] = useState(false);
  const [ledStatus, setLedStatus] = useState(false);
  const [autoOffTime, setAutoOffTime] = useState("30");
  const wsRef = useRef<WebSocket | null>(null);
  const ledTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Log alert to Google Sheets (optional)
  const logAlertToSheets = async (alert: Alert) => {
    try {
      const { error } = await supabase.functions.invoke('log-alert', {
        body: {
          timestamp: alert.timestamp,
          type: alert.type,
          message: alert.message,
          sensor: alert.sensor,
        },
      });

      if (error) {
        console.warn('Failed to log alert to Google Sheets:', error);
      } else {
        console.log('Alert logged to Google Sheets successfully');
      }
    } catch (err) {
      console.warn('Google Sheets logging unavailable:', err);
    }
  };

  // Parse incoming WebSocket message
  const parseIncomingMessage = (data: any) => {
    try {
      let parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      console.log('Received WebSocket data:', parsedData);

      // Determine alert type
      let type: "intrusion" | "safe" = "safe";
      let message = parsedData.raw || "Unknown event";
      
      if (parsedData.alert === "INTRUSION DETECTED" || parsedData.raw?.toUpperCase().includes("INTRUSION")) {
        type = "intrusion";
        message = parsedData.raw || "Intrusion detected";
      }

      // Extract sensor info
      let sensor = "Unknown Sensor";
      if (parsedData.pir && parsedData.vibration) {
        sensor = "Both Sensors";
      } else if (parsedData.pir) {
        sensor = "PIR Sensor";
      } else if (parsedData.vibration) {
        sensor = "Vibration Sensor";
      }

      const newAlert: Alert = {
        id: Date.now() + Math.random(),
        timestamp: parsedData.timestamp || new Date().toLocaleString(),
        type,
        message,
        sensor,
      };

      setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
      setCurrentStatus(type === "intrusion" ? "alert" : "safe");

      // Log to Google Sheets
      logAlertToSheets(newAlert);

      if (type === "intrusion") {
        setLedStatus(true);
        
        // Auto-off timer for LED
        if (ledTimerRef.current) {
          clearTimeout(ledTimerRef.current);
        }
        ledTimerRef.current = setTimeout(() => {
          turnOffLed();
        }, parseInt(autoOffTime) * 1000);

        toast({
          title: "⚠️ Intrusion Detected!",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  // Connect to WebSocket
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Successfully connected to sensor system",
        });
      };

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        parseIncomingMessage(event.data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to sensor system",
          variant: "destructive",
        });
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsMonitoring(false);
        toast({
          title: "Disconnected",
          description: "Connection to sensor system closed",
        });
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Could not establish connection",
        variant: "destructive",
      });
    }
  };

  // Turn off LED
  const turnOffLed = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const command = { command: "LED_OFF" };
      wsRef.current.send(JSON.stringify(command));
      console.log('[Dashboard] Sent LED OFF command');
    }
    setLedStatus(false);
    if (ledTimerRef.current) {
      clearTimeout(ledTimerRef.current);
      ledTimerRef.current = null;
    }
    toast({
      title: "LED Turned Off",
      description: "Alert LED has been deactivated",
    });
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      setIsMonitoring(false);
    }
  };

  useEffect(() => {
    return () => {
      disconnectWebSocket();
      if (ledTimerRef.current) {
        clearTimeout(ledTimerRef.current);
      }
    };
  }, []);

  const startMonitoring = () => {
    if (!isConnected) {
      connectWebSocket();
    }
    setIsMonitoring(true);
    toast({
      title: "Monitoring Started",
      description: "Real-time alert system is now active",
    });
  };

  const stopMonitoring = () => {
    disconnectWebSocket();
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

        {/* WebSocket Configuration */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-success" />
            ) : (
              <WifiOff className="w-5 h-5 text-muted-foreground" />
            )}
            <h2 className="text-xl font-bold">WebSocket Connection</h2>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div className="flex gap-3">
            <Input
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              placeholder="wss://your-ngrok-url.ngrok-free.dev"
              disabled={isConnected}
              className="flex-1"
            />
            {!isConnected && (
              <Button onClick={connectWebSocket} variant="outline">
                Connect
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your ngrok WebSocket URL (e.g., wss://unhurtful-drawn-tish.ngrok-free.dev)
          </p>
        </Card>

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
                <Button onClick={startMonitoring} size="lg" className="shadow-glow" disabled={!wsUrl}>
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

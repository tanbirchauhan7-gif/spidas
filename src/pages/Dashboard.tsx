import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Radio, Clock, Wifi, WifiOff, Lightbulb, LightbulbOff, Camera, CameraOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { YOLOv8Detector, Detection, mapToThreeClasses } from "@/utils/yolov8";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [lastClassification, setLastClassification] = useState<string>("");
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [usingYOLOv8, setUsingYOLOv8] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const ledTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const detectorRef = useRef<YOLOv8Detector>(new YOLOv8Detector());
  const cocoModelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const { toast } = useToast();

  // Load models on mount (try YOLOv8, fallback to COCO-SSD)
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        console.log("[Dashboard] Attempting to load YOLOv8n model...");
        
        await detectorRef.current.loadModel('/yolov8n.onnx');
        
        console.log("[Dashboard] YOLOv8n loaded successfully");
        setUsingYOLOv8(true);
        toast({
          title: "Model Loaded",
          description: "YOLOv8n detection active",
        });
      } catch (error) {
        console.log("[Dashboard] YOLOv8 unavailable, loading COCO-SSD fallback...");
        
        try {
          const cocoModel = await cocoSsd.load();
          cocoModelRef.current = cocoModel;
          console.log("[Dashboard] COCO-SSD loaded successfully");
          toast({
            title: "Model Loaded",
            description: "COCO-SSD detection active (add yolov8n.onnx for YOLOv8)",
          });
        } catch (cocoError) {
          console.error("[Dashboard] Failed to load any model:", cocoError);
          toast({
            title: "Model Load Error",
            description: "Failed to load detection models",
            variant: "destructive",
          });
        }
      } finally {
        setIsModelLoading(false);
      }
    };
    loadModel();
  }, []);

  // Start camera and detection
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          detectObjects();
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Access Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsCameraActive(false);
    setDetections([]);
  };

  // Detect objects in video feed (YOLOv8 or COCO-SSD)
  const detectObjects = async () => {
    const hasModel = usingYOLOv8 ? detectorRef.current.isLoaded() : cocoModelRef.current !== null;
    
    if (!hasModel || !videoRef.current || !canvasRef.current || !isCameraActive) {
      animationFrameRef.current = requestAnimationFrame(detectObjects);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectObjects);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      let predictions: Detection[];

      if (usingYOLOv8) {
        // Use YOLOv8 (your custom model logic)
        predictions = await detectorRef.current.detect(video, 0.3, 0.45);
      } else {
        // Use COCO-SSD fallback
        const cocoResults = await cocoModelRef.current!.detect(video);
        predictions = cocoResults.map(pred => ({
          class: pred.class,
          confidence: pred.score,
          bbox: [pred.bbox[0], pred.bbox[1], pred.bbox[0] + pred.bbox[2], pred.bbox[1] + pred.bbox[3]] as [number, number, number, number],
          label: mapToThreeClasses(pred.class)
        }));
      }

      setDetections(predictions);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bounding boxes
      predictions.forEach((detection) => {
        const [x1, y1, x2, y2] = detection.bbox;
        const width = x2 - x1;
        const height = y2 - y1;
        
        // Color based on classification
        let color = "#00ff00"; // Object = Green
        if (detection.label === "Human") color = "#ff0000"; // Human = Red
        else if (detection.label === "Animal") color = "#ff9900"; // Animal = Orange

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, width, height);

        // Draw label background
        ctx.fillStyle = color;
        const label = detection.label;
        ctx.font = "18px Arial";
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(x1, y1 - 25, textWidth + 10, 25);

        // Draw label text
        ctx.fillStyle = "#000000";
        ctx.fillText(label, x1 + 5, y1 - 7);
      });

      // Classify detection type
      const hasHuman = predictions.some(p => p.label === "Human");
      const hasAnimal = predictions.some(p => p.label === "Animal");
      
      let classification = "Unknown";
      if (hasHuman) classification = "Human";
      else if (hasAnimal) classification = "Animal";
      else if (predictions.length > 0) classification = "Object";
      
      setLastClassification(classification);

    } catch (error) {
      console.error("[Dashboard] Detection error:", error);
    }

    animationFrameRef.current = requestAnimationFrame(detectObjects);
  };

  // Capture snapshot and send to logging
  const captureAndLogSnapshot = async (alert: Alert) => {
    if (!canvasRef.current) return;

    try {
      // Capture snapshot as base64
      const snapshot = canvasRef.current.toDataURL("image/jpeg", 0.8);
      
      // Send to logging with classification
      const { error } = await supabase.functions.invoke('log-alert', {
        body: {
          timestamp: alert.timestamp,
          type: alert.type,
          message: alert.message,
          sensor: alert.sensor,
          classification: lastClassification,
          detections: detections.map(d => ({
            class: d.class,
            score: d.confidence,
          })),
          snapshot: snapshot,
        },
      });

      if (error) {
        console.warn('Failed to log alert with snapshot:', error);
      } else {
        console.log('Alert with snapshot logged successfully');
      }
    } catch (err) {
      console.warn('Snapshot logging error:', err);
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

      if (type === "intrusion") {
        // Start camera for intrusion detection
        const hasModel = usingYOLOv8 ? detectorRef.current.isLoaded() : cocoModelRef.current !== null;
        if (!isCameraActive && hasModel) {
          startCamera();
        }
        
        // Wait a moment for detection, then capture and log
        setTimeout(() => {
          captureAndLogSnapshot(newAlert);
        }, 2000);
        
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
      stopCamera();
      disconnectWebSocket();
      if (ledTimerRef.current) {
        clearTimeout(ledTimerRef.current);
      }
    };
  }, []);

  // Update detection loop when camera state changes
  useEffect(() => {
    const hasModel = usingYOLOv8 ? detectorRef.current.isLoaded() : cocoModelRef.current !== null;
    if (isCameraActive && hasModel) {
      detectObjects();
    }
  }, [isCameraActive, usingYOLOv8]);

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


        {/* Camera Detection */}
        {isMonitoring && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Camera className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Live Detection</h2>
                {lastClassification && (
                  <Badge variant={lastClassification === "Human" ? "destructive" : "default"}>
                    {lastClassification} Detected
                  </Badge>
                )}
              </div>
              <Button 
                onClick={isCameraActive ? stopCamera : startCamera}
                variant={isCameraActive ? "destructive" : "default"}
                disabled={isModelLoading}
              >
                {isCameraActive ? (
                  <>
                    <CameraOff className="w-4 h-4 mr-2" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </>
                )}
              </Button>
            </div>

            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Model:</span>
              <Badge variant="outline">{usingYOLOv8 ? "YOLOv8n" : "COCO-SSD"}</Badge>
              {lastClassification && (
                <>
                  <span className="ml-2">Last:</span>
                  <Badge variant={lastClassification === "Human" ? "destructive" : "secondary"}>
                    {lastClassification}
                  </Badge>
                </>
              )}
            </div>

            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "4/3" }}>
              <video
                ref={videoRef}
                className="w-full h-full"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Camera inactive</p>
                  </div>
                </div>
              )}
            </div>

            {detections.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold">Detected Objects:</h3>
                <div className="flex flex-wrap gap-2">
                  {detections.map((det, idx) => (
                    <Badge 
                      key={idx} 
                      variant={det.label === "Human" ? "destructive" : "outline"}
                    >
                      {det.label}: {det.class} ({Math.round(det.confidence * 100)}%)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

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

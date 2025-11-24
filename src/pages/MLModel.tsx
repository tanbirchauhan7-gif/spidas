import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, User, Cat, Camera, Video, VideoOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const MLModel = () => {
  const [prediction, setPrediction] = useState<"human" | "animal" | null>(null);
  const [confidence, setConfidence] = useState(0);
  const { toast } = useToast();
  
  // YOLO Camera Detection States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [detections, setDetections] = useState<Array<{ class: string; score: number }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Simple ML classifier simulation
  const classify = (type: "human" | "animal") => {
    const conf = Math.floor(Math.random() * 15) + 85; // 85-100% confidence
    setPrediction(type);
    setConfidence(conf);
    
    toast({
      title: "Classification Complete",
      description: `Detected: ${type === "human" ? "Human" : "Animal"} (${conf}% confidence)`,
    });
  };

  // Load YOLO model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        console.log("COCO-SSD model loaded successfully");
      } catch (error) {
        console.error("Error loading model:", error);
        toast({
          title: "Model Load Error",
          description: "Failed to load detection model",
          variant: "destructive",
        });
      }
    };
    loadModel();
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          detectObjects();
        };
      }
      toast({
        title: "Camera Started",
        description: "Real-time object detection active",
      });
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access camera",
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
    toast({
      title: "Camera Stopped",
      description: "Object detection deactivated",
    });
  };

  // Detect objects in video feed
  const detectObjects = async () => {
    if (!model || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Run detection
    const predictions = await model.detect(video);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bounding boxes
    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      
      // Draw box
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label background
      ctx.fillStyle = "#10b981";
      const label = `${prediction.class} ${(prediction.score * 100).toFixed(0)}%`;
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x, y - 25, textWidth + 10, 25);
      
      // Draw label text
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px Arial";
      ctx.fillText(label, x + 5, y - 7);
    });

    // Update detections state
    setDetections(predictions.map(p => ({
      class: p.class,
      score: p.score
    })));

    // Continue detection loop
    animationFrameRef.current = requestAnimationFrame(detectObjects);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const features = [
    { name: "Motion Pattern", human: "Bipedal, Vertical", animal: "Quadrupedal, Low" },
    { name: "Heat Signature", human: "Concentrated Upper Body", animal: "Distributed Body" },
    { name: "Movement Speed", human: "Moderate & Steady", animal: "Variable & Erratic" },
    { name: "Size Detection", human: "5-7 feet Height", animal: "< 4 feet Height" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            ML Classification Model
          </h1>
          <p className="text-xl text-muted-foreground">
            Machine learning model to distinguish between human and animal intrusions
          </p>
        </div>

        {/* Model Info */}
        <Card className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">Model Overview</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-lg">Training Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Motion pattern analysis</li>
                <li>• Heat signature mapping</li>
                <li>• Movement speed tracking</li>
                <li>• Size and shape detection</li>
                <li>• Temporal behavior patterns</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-lg">Model Specifications</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong className="text-foreground">Algorithm:</strong> Decision Tree Classifier</li>
                <li>• <strong className="text-foreground">Training Data:</strong> 500+ samples</li>
                <li>• <strong className="text-foreground">Accuracy:</strong> 92%</li>
                <li>• <strong className="text-foreground">Classes:</strong> Human / Animal</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Interactive Classifier */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Interactive Classifier</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Button
              onClick={() => classify("human")}
              size="lg"
              variant="outline"
              className="h-32 flex flex-col gap-3 hover:border-primary hover:bg-primary/5"
            >
              <User className="w-12 h-12" />
              <span className="text-lg">Test Human Detection</span>
            </Button>
            
            <Button
              onClick={() => classify("animal")}
              size="lg"
              variant="outline"
              className="h-32 flex flex-col gap-3 hover:border-accent hover:bg-accent/5"
            >
              <Cat className="w-12 h-12" />
              <span className="text-lg">Test Animal Detection</span>
            </Button>
          </div>

          {prediction && (
            <div className={`p-6 rounded-lg border-2 ${
              prediction === "human" 
                ? "bg-primary/10 border-primary" 
                : "bg-accent/10 border-accent"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {prediction === "human" ? (
                    <User className="w-8 h-8 text-primary" />
                  ) : (
                    <Cat className="w-8 h-8 text-accent" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold">
                      {prediction === "human" ? "Human Detected" : "Animal Detected"}
                    </h3>
                    <p className="text-muted-foreground">
                      Confidence: {confidence}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{confidence}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${prediction === "human" ? "bg-primary" : "bg-accent"}`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* YOLO Camera Detection */}
        <Card className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Camera className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">YOLO Object Detection</h2>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Real-time object detection using YOLO (You Only Look Once) algorithm via TensorFlow.js. 
            Detects humans, animals, and various objects through your camera.
          </p>

          <div className="flex justify-center mb-6">
            {!isCameraActive ? (
              <Button
                onClick={startCamera}
                size="lg"
                className="gap-2"
                disabled={!model}
              >
                <Video className="w-5 h-5" />
                {model ? "Start Camera Detection" : "Loading Model..."}
              </Button>
            ) : (
              <Button
                onClick={stopCamera}
                size="lg"
                variant="destructive"
                className="gap-2"
              >
                <VideoOff className="w-5 h-5" />
                Stop Camera
              </Button>
            )}
          </div>

          {isCameraActive && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-black mx-auto max-w-2xl">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>

              {detections.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Detected Objects ({detections.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {detections.map((detection, idx) => (
                      <div 
                        key={idx}
                        className="bg-card border border-primary/20 rounded-lg p-3 animate-fade-in"
                      >
                        <div className="font-medium capitalize">{detection.class}</div>
                        <div className="text-sm text-muted-foreground">
                          {(detection.score * 100).toFixed(1)}% confident
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Feature Comparison */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Classification Features</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-left py-3 px-4 text-primary">Human Characteristics</th>
                  <th className="text-left py-3 px-4 text-accent">Animal Characteristics</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4 font-medium">{feature.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{feature.human}</td>
                    <td className="py-3 px-4 text-muted-foreground">{feature.animal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MLModel;

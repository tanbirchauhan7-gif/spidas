import * as ort from 'onnxruntime-web';

// Animal classes from COCO dataset (matching your Python code)
const ANIMAL_CLASSES = new Set([
  "bird", "cat", "dog", "horse", "sheep", "cow", 
  "elephant", "bear", "zebra", "giraffe"
]);

// COCO class names (80 classes) - YOLOv8 order
const COCO_CLASSES = [
  "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
  "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
  "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack",
  "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball",
  "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
  "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
  "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair",
  "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse",
  "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator",
  "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"
];

export interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  label: "Human" | "Animal" | "Object";
}

/**
 * Map COCO class to Human/Animal/Object (matching your Python logic)
 */
export function mapToThreeClasses(className: string): "Human" | "Animal" | "Object" {
  if (className === "person") return "Human";
  if (ANIMAL_CLASSES.has(className)) return "Animal";
  return "Object";
}

export class YOLOv8Detector {
  private session: ort.InferenceSession | null = null;
  private modelLoaded = false;

  async loadModel(modelPath: string = '/yolov8n.onnx') {
    try {
      console.log('[YOLOv8] Loading model from:', modelPath);
      
      // Configure ONNX Runtime for WebGL backend (faster than WASM)
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = true;
      
      this.session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ['webgl', 'wasm'],
        graphOptimizationLevel: 'all'
      });
      
      this.modelLoaded = true;
      console.log('[YOLOv8] Model loaded successfully');
    } catch (error) {
      console.error('[YOLOv8] Failed to load model:', error);
      throw error;
    }
  }

  async detect(
    imageElement: HTMLImageElement | HTMLVideoElement,
    confThreshold: number = 0.3,
    iouThreshold: number = 0.45
  ): Promise<Detection[]> {
    if (!this.session || !this.modelLoaded) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    // Preprocess image to 640x640 (YOLOv8 input size)
    const [input, imgWidth, imgHeight] = await this.preprocessImage(imageElement);
    
    // Run inference
    const feeds = { images: input };
    const results = await this.session.run(feeds);
    
    // Post-process results
    const output = results.output0.data as Float32Array;
    const detections = this.postprocess(output, imgWidth, imgHeight, confThreshold, iouThreshold);
    
    return detections;
  }

  private async preprocessImage(
    imageElement: HTMLImageElement | HTMLVideoElement
  ): Promise<[ort.Tensor, number, number]> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Get original dimensions
    const imgWidth = imageElement instanceof HTMLVideoElement 
      ? imageElement.videoWidth 
      : imageElement.naturalWidth;
    const imgHeight = imageElement instanceof HTMLVideoElement 
      ? imageElement.videoHeight 
      : imageElement.naturalHeight;

    // YOLOv8 expects 640x640 input
    const modelWidth = 640;
    const modelHeight = 640;
    
    canvas.width = modelWidth;
    canvas.height = modelHeight;
    
    // Draw image scaled to 640x640 (letterbox padding would be more accurate)
    ctx.drawImage(imageElement, 0, 0, modelWidth, modelHeight);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, modelWidth, modelHeight);
    
    // Convert to RGB float32 array normalized to [0, 1] and transposed to CHW format
    const float32Data = new Float32Array(3 * modelWidth * modelHeight);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixelIndex = i / 4;
      // Normalize to [0, 1] and separate channels (CHW format)
      float32Data[pixelIndex] = imageData.data[i] / 255.0; // R
      float32Data[modelWidth * modelHeight + pixelIndex] = imageData.data[i + 1] / 255.0; // G
      float32Data[modelWidth * modelHeight * 2 + pixelIndex] = imageData.data[i + 2] / 255.0; // B
    }
    
    const tensor = new ort.Tensor('float32', float32Data, [1, 3, modelHeight, modelWidth]);
    
    return [tensor, imgWidth, imgHeight];
  }

  private postprocess(
    output: Float32Array,
    imgWidth: number,
    imgHeight: number,
    confThreshold: number,
    iouThreshold: number
  ): Detection[] {
    const detections: Detection[] = [];
    
    // YOLOv8 output format: [1, 84, 8400]
    // 84 = 4 (bbox) + 80 (classes)
    const numDetections = 8400;
    const numClasses = 80;
    
    // Scale factors
    const xScale = imgWidth / 640;
    const yScale = imgHeight / 640;
    
    for (let i = 0; i < numDetections; i++) {
      // Get class scores
      let maxScore = 0;
      let maxClassId = 0;
      
      for (let j = 0; j < numClasses; j++) {
        const score = output[i + (4 + j) * numDetections];
        if (score > maxScore) {
          maxScore = score;
          maxClassId = j;
        }
      }
      
      // Filter by confidence threshold
      if (maxScore < confThreshold) continue;
      
      // Get bbox (center_x, center_y, width, height)
      const cx = output[i] * xScale;
      const cy = output[i + numDetections] * yScale;
      const w = output[i + numDetections * 2] * xScale;
      const h = output[i + numDetections * 3] * yScale;
      
      // Convert to [x1, y1, x2, y2]
      const x1 = cx - w / 2;
      const y1 = cy - h / 2;
      const x2 = cx + w / 2;
      const y2 = cy + h / 2;
      
      const className = COCO_CLASSES[maxClassId];
      const label = mapToThreeClasses(className);
      
      detections.push({
        class: className,
        confidence: maxScore,
        bbox: [x1, y1, x2, y2],
        label
      });
    }
    
    // Apply Non-Maximum Suppression (NMS)
    return this.nms(detections, iouThreshold);
  }

  private nms(detections: Detection[], iouThreshold: number): Detection[] {
    // Sort by confidence (descending)
    detections.sort((a, b) => b.confidence - a.confidence);
    
    const keep: Detection[] = [];
    
    while (detections.length > 0) {
      const current = detections[0];
      keep.push(current);
      
      detections = detections.slice(1).filter(det => {
        const iou = this.calculateIoU(current.bbox, det.bbox);
        return iou < iouThreshold;
      });
    }
    
    return keep;
  }

  private calculateIoU(box1: number[], box2: number[]): number {
    const [x1_1, y1_1, x2_1, y2_1] = box1;
    const [x1_2, y1_2, x2_2, y2_2] = box2;
    
    const x1 = Math.max(x1_1, x1_2);
    const y1 = Math.max(y1_1, y1_2);
    const x2 = Math.min(x2_1, x2_2);
    const y2 = Math.min(y2_1, y2_2);
    
    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const area1 = (x2_1 - x1_1) * (y2_1 - y1_1);
    const area2 = (x2_2 - x1_2) * (y2_2 - y1_2);
    const union = area1 + area2 - intersection;
    
    return union > 0 ? intersection / union : 0;
  }

  isLoaded(): boolean {
    return this.modelLoaded;
  }
}

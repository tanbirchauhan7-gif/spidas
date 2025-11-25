# YOLOv8 Model Setup Guide

This project uses your custom YOLOv8n model for real-time intrusion classification (Human/Animal/Object).

## Model Architecture

**YOLOv8n (Nano)** - Lightweight, fast object detection model
- Input: 640x640 RGB images
- Output: 80 COCO classes with bounding boxes
- Format: ONNX (optimized for browser inference)

## Setup Instructions

### 1. Download YOLOv8n ONNX Model

You need to place the YOLOv8n ONNX model in the `public` folder:

**Option A: Download Pre-converted Model**
```bash
# Download from Ultralytics official release
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx -O public/yolov8n.onnx
```

**Option B: Convert from PyTorch (.pt) to ONNX**
```bash
# If you have the yolov8n.pt file from your Python script
pip install ultralytics
yolo export model=yolov8n.pt format=onnx

# Then move it to public folder
mv yolov8n.onnx public/
```

### 2. Verify File Location

After setup, your file structure should look like:
```
project-root/
├── public/
│   ├── yolov8n.onnx   ← Model file must be here
│   └── robots.txt
├── src/
└── ...
```

### 3. Model Loading

The model will automatically load when the Dashboard page loads. Check browser console for:
```
[Dashboard] Loading YOLOv8n model...
[YOLOv8] Loading model from: /yolov8n.onnx
[YOLOv8] Model loaded successfully
```

## How It Works

### Class Mapping (Same as Your Python Code)

```python
# Your original mapping logic
ANIMAL_CLASSES = {
    "bird", "cat", "dog", "horse", "sheep", "cow", 
    "elephant", "bear", "zebra", "giraffe"
}

def map_to_three_classes(class_name):
    if class_name == "person":
        return "Human"
    elif class_name in ANIMAL_CLASSES:
        return "Animal"
    else:
        return "Object"
```

### Detection Pipeline

1. **Intrusion Event** → WebSocket triggers camera activation
2. **Video Capture** → Browser accesses webcam (user permission required)
3. **YOLOv8 Inference** → Real-time object detection at ~640x640 resolution
4. **Classification** → Map COCO classes to Human/Animal/Object
5. **Visualization** → Draw bounding boxes with labels
6. **Logging** → Capture snapshot + classification data → Google Sheets/Database

### Color Coding (Matches Your Python Script)

- **Red**: Human detected
- **Orange**: Animal detected
- **Green**: Other objects

### Confidence Threshold

Default: **0.3** (30% confidence)
- Adjustable in code: `src/utils/yolov8.ts`
- Same as your Python `--conf 0.3` parameter

### Non-Maximum Suppression (NMS)

IoU Threshold: **0.45**
- Removes duplicate/overlapping boxes
- Same logic as your Python implementation

## Troubleshooting

### Model Not Loading
- Check browser console for error messages
- Verify `yolov8n.onnx` is in the `public` folder
- Check file size (should be ~6-8 MB)
- Clear browser cache and reload

### Slow Performance
- YOLOv8n is optimized for speed, but browser inference is slower than native Python
- Uses WebGL acceleration when available
- Consider reducing video resolution or frame rate if needed

### Camera Not Starting
- Check browser permissions (allow camera access)
- Verify you're on HTTPS (required for camera API in production)
- Check console for camera-related errors

## Performance Notes

**Browser (ONNX Runtime Web)**
- Inference: ~100-300ms per frame (varies by device)
- Uses WebGL backend for GPU acceleration
- Fallback to WebAssembly (WASM) if WebGL unavailable

**Python (Ultralytics)** - Your original implementation
- Inference: ~20-50ms per frame on GPU
- Faster but requires backend server

The browser implementation prioritizes **convenience** (no server required) over pure speed.

## Model File Size

- **yolov8n.onnx**: ~6-8 MB (smallest YOLOv8 variant)
- Downloads once, cached by browser
- Initial load may take 5-10 seconds on slow connections

## Supported Browsers

- Chrome/Edge (recommended - best WebGL support)
- Firefox
- Safari (may have reduced performance)

## Next Steps

If you need **faster inference** or **custom-trained models**, consider:
1. Setting up a backend API endpoint with your Python script
2. Using edge functions to run Python inference server-side
3. Upgrading to YOLOv8s or YOLOv8m for better accuracy (but larger file size)

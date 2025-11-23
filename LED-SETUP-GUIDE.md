# LED Control Setup Guide

## Overview
Your intrusion detection system now includes LED control that:
- ✅ Turns ON automatically when intrusion is detected
- ✅ Can be turned OFF manually from the dashboard
- ✅ Can be turned OFF from your phone via Bluetooth
- ✅ Auto-turns OFF after a configurable timeout (30s, 1min, 2min, 5min)

## Hardware Setup

### Option 1: Simple LED (Recommended for Testing)
1. Connect LED to Arduino Pin 13 (built-in LED works too)
2. Upload `arduino-led-control.ino` to your Arduino
3. No additional wiring needed if using built-in LED

### Option 2: RGB LED (For Color Alerts)
1. Connect RGB LED:
   - Red pin → Arduino Pin 9
   - Green pin → Arduino Pin 10
   - Blue pin → Arduino Pin 11
   - Common cathode → GND
2. Uncomment the RGB section in `arduino-led-control.ino`
3. Upload to Arduino

## Software Setup

### Step 1: Update Python Server
1. Stop your current Python server (Ctrl+C)
2. Use the new `python-server-with-led.py` script
3. Run: `python python-server-with-led.py`

### Step 2: Setup ngrok
```bash
ngrok http 8765
```
Copy the WebSocket URL (e.g., `wss://your-url.ngrok-free.dev`)

### Step 3: Connect Dashboard
1. Open your website dashboard
2. Paste the ngrok URL in the WebSocket field
3. Click "Connect"
4. Click "Start Monitoring"

## How It Works

### When Intrusion Detected:
1. Arduino sensors detect intrusion
2. Python script reads serial data
3. Python sends `'1'` to Arduino → LED turns ON
4. Dashboard receives alert and starts auto-off timer
5. Dashboard displays LED status as "ON"

### Manual Turn Off (Dashboard):
1. Click "Turn Off LED Manually" button
2. Dashboard sends `{"command": "LED_OFF"}` via WebSocket
3. Python script receives command
4. Python sends `'0'` to Arduino → LED turns OFF
5. Dashboard updates LED status to "OFF"

### Manual Turn Off (Phone Bluetooth):
1. Connect phone to Bluetooth module (HC-05/HC-06)
2. Send character `'0'` from Bluetooth app
3. Arduino receives and turns LED OFF
4. Works independently of dashboard

### Auto Turn Off:
1. Dashboard starts countdown when intrusion detected
2. After configured time (default 30s), dashboard sends OFF command
3. LED automatically turns off

## Testing

### Test 1: LED Control
1. In Serial Monitor, send `'1'` → LED should turn ON
2. Send `'0'` → LED should turn OFF

### Test 2: Full System
1. Trigger intrusion sensor
2. Verify LED turns ON
3. Wait for auto-off or click manual button
4. Verify LED turns OFF

### Test 3: Bluetooth Control
1. Connect phone to Bluetooth module
2. Use a Bluetooth terminal app
3. Send `'0'` → LED should turn OFF
4. Send `'1'` → LED should turn ON

## Configuration

### Change Auto-off Timer:
- Dashboard → LED Control Card → Select desired time
- Options: 10s, 30s, 1min, 2min, 5min

### Arduino Backup Timer:
- Edit `arduino-led-control.ino`
- Change: `unsigned long LED_TIMEOUT = 300000;` (milliseconds)
- Default: 5 minutes (300000ms)

## Troubleshooting

### LED Not Turning On:
- Check serial connection (COM18)
- Verify Arduino code uploaded
- Check LED wiring/pin number
- Open Serial Monitor to see debug messages

### Dashboard Not Controlling LED:
- Verify WebSocket connected
- Check Python script is running
- Ensure ngrok tunnel is active
- Look for "[Arduino] Sent: 0" in Python console

### Bluetooth Not Working:
- Pair Bluetooth module with phone first
- Use correct Bluetooth terminal app
- Ensure module TX/RX connected to Arduino properly
- Baud rate must match (9600)

## Serial Communication Reference

| Command | Source | Action |
|---------|--------|--------|
| `'1'` | Python → Arduino | Turn LED ON |
| `'0'` | Python → Arduino | Turn LED OFF |
| `'0'` | Phone Bluetooth → Arduino | Turn LED OFF |
| `INTRUSION,...` | Arduino → Python | Intrusion data |

## Next Steps

1. ✅ Test LED control from dashboard
2. ✅ Test Bluetooth control from phone
3. ✅ Configure auto-off timer to your preference
4. ✅ Deploy to production

## Support

If you encounter issues:
1. Check Serial Monitor for Arduino messages
2. Check Python console for WebSocket messages
3. Check browser console for dashboard errors
4. Verify all connections (USB, Bluetooth, ngrok)

import asyncio
import json
import threading
import time
import serial
import serial.threaded
import websockets
from websockets.exceptions import ConnectionClosed, ConnectionClosedError, ConnectionClosedOK
from datetime import datetime

# ======================================
# CONFIG
# ======================================
SERIAL_PORT = "COM18"
BAUDRATE = 9600
WS_HOST = "0.0.0.0"
WS_PORT = 8765

clients = set()
LOOP = None
serial_writer = None  # Global serial port for writing


# ======================================
# BROADCAST TO ALL CLIENTS
# ======================================
async def broadcast(message):
    if not clients:
        return
    print("[BROADCAST] ->", message)
    await asyncio.gather(*[c.send(message) for c in clients], return_exceptions=True)


# ======================================
# SEND COMMAND TO ARDUINO
# ======================================
def send_to_arduino(command):
    """Send command to Arduino via serial"""
    global serial_writer
    if serial_writer and serial_writer.is_open:
        try:
            serial_writer.write(command.encode())
            print(f"[Arduino] Sent: {command}")
        except Exception as e:
            print(f"[Arduino ERROR] Failed to send command: {e}")
    else:
        print("[Arduino ERROR] Serial port not available")


# ======================================
# WEBSOCKET HANDLER
# ======================================
async def ws_handler(*args):
    websocket = args[0]
    path = args[1] if len(args) > 1 else None

    clients.add(websocket)
    print("[WS] Client connected")

    try:
        async for message in websocket:
            print("[WS RECEIVED FROM CLIENT]", message)
            
            # Parse incoming command from dashboard
            try:
                data = json.loads(message)
                if data.get("command") == "LED_OFF":
                    print("[WS] Received LED OFF command from dashboard")
                    # Send '0' to Arduino to turn off LED
                    send_to_arduino('0')
                    
                    # Broadcast LED status to all clients
                    status_message = json.dumps({
                        "type": "led_status",
                        "status": "off",
                        "timestamp": datetime.now().isoformat(timespec='seconds')
                    })
                    await broadcast(status_message)
            except json.JSONDecodeError:
                pass
            
            # Relay WS→WS for simulator compatibility
            await broadcast(message)

    except (ConnectionClosed, ConnectionClosedError, ConnectionClosedOK):
        print("[WS] Client disconnected cleanly")

    except Exception as e:
        print("[WS ERROR]", e)

    finally:
        if websocket in clients:
            clients.remove(websocket)
        print("[WS] Cleanup done")


# ======================================
# SERIAL → WEBSOCKET RELAY
# ======================================
class SerialReader(serial.threaded.LineReader):
    def connection_made(self, transport):
        print("[Serial] Connected")

    def handle_line(self, line):
        line = line.strip()
        if not line:
            return
        print("[Serial READ]", line)

        # Build JSON packet
        payload = {
            "timestamp": datetime.now().isoformat(timespec='seconds'),
            "raw": line
        }

        # Parse intrusion line
        try:
            parts = line.split(',')
            if parts[0].upper() == "INTRUSION":
                payload["alert"] = "INTRUSION DETECTED"
                
                # Turn on LED when intrusion detected
                send_to_arduino('1')
                
                for p in parts[1:]:
                    if ":" in p:
                        k, v = p.split(":")
                        payload[k.lower()] = v
        except:
            pass

        if LOOP:
            LOOP.call_soon_threadsafe(
                lambda: asyncio.create_task(broadcast(json.dumps(payload)))
            )


def serial_thread():
    """Handle serial communication in separate thread"""
    global serial_writer
    try:
        serial_writer = serial.Serial(SERIAL_PORT, BAUDRATE, timeout=1)
        print("[Serial] Port opened:", SERIAL_PORT)
        
        with serial.threaded.ReaderThread(serial_writer, SerialReader):
            print("[Serial] Listening for intrusion data...")
            while True:
                time.sleep(1)
    except Exception as e:
        print("[Serial ERROR]", e)
        serial_writer = None


# ======================================
# MAIN SERVER
# ======================================
async def main():
    global LOOP
    LOOP = asyncio.get_running_loop()

    # WebSocket server
    ws_server = await websockets.serve(ws_handler, WS_HOST, WS_PORT)
    print(f"[WebSocket] Server started at ws://{WS_HOST}:{WS_PORT}")
    print("[Info] Dashboard can connect via ngrok tunnel")
    print("[Info] LED will turn ON on intrusion, OFF via dashboard or phone Bluetooth")

    # Serial thread
    threading.Thread(target=serial_thread, daemon=True).start()

    await asyncio.Future()  # keep running


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[Shutdown] Closing server...")
        if serial_writer and serial_writer.is_open:
            serial_writer.close()

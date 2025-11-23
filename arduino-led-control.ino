// ======================================
// INTRUSION DETECTION + LED CONTROL
// ======================================
// This Arduino code handles:
// 1. LED turns ON when Python script sends '1' (intrusion detected)
// 2. LED turns OFF when Python script sends '0' (manual off from dashboard/phone)
// 3. LED auto-off after timeout (handled by dashboard, but can add backup here)

#define LED_PIN 13  // Built-in LED or connect external LED to pin 13

int state = 0;
unsigned long ledOnTime = 0;
unsigned long LED_TIMEOUT = 300000;  // 5 minutes backup timeout (in milliseconds)
bool ledActive = false;

void setup() {
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);
    Serial.begin(9600);
    Serial.println("Arduino LED Control Ready");
}

void loop() {
    // Check for serial commands from Python
    if (Serial.available() > 0) {
        state = Serial.read();
        
        if (state == '0') {
            // Turn LED OFF
            digitalWrite(LED_PIN, LOW);
            ledActive = false;
            Serial.println("LED: OFF");
        }
        else if (state == '1') {
            // Turn LED ON
            digitalWrite(LED_PIN, HIGH);
            ledActive = true;
            ledOnTime = millis();  // Record when LED was turned on
            Serial.println("LED: ON (Intrusion Alert)");
        }
    }
    
    // Backup auto-off: Turn off LED after timeout (in case dashboard fails)
    if (ledActive && (millis() - ledOnTime > LED_TIMEOUT)) {
        digitalWrite(LED_PIN, LOW);
        ledActive = false;
        Serial.println("LED: AUTO-OFF (Timeout)");
    }
}


// ======================================
// ALTERNATIVE: RGB LED VERSION
// ======================================
// Uncomment below if you want to use RGB LED instead

/*
#define RED_PIN 9
#define GREEN_PIN 10
#define BLUE_PIN 11

void setup() {
    pinMode(RED_PIN, OUTPUT);
    pinMode(GREEN_PIN, OUTPUT);
    pinMode(BLUE_PIN, OUTPUT);
    
    // Default: Green (Safe)
    setColor(0, 255, 0);
    
    Serial.begin(9600);
    Serial.println("RGB LED Control Ready");
}

void loop() {
    if (Serial.available() > 0) {
        char state = Serial.read();
        
        if (state == '0') {
            // Safe: Green
            setColor(0, 255, 0);
            Serial.println("LED: GREEN (Safe)");
        }
        else if (state == '1') {
            // Alert: Red
            setColor(255, 0, 0);
            Serial.println("LED: RED (Alert)");
        }
    }
}

void setColor(int red, int green, int blue) {
    analogWrite(RED_PIN, red);
    analogWrite(GREEN_PIN, green);
    analogWrite(BLUE_PIN, blue);
}
*/

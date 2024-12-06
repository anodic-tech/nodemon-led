#include <Adafruit_NeoPixel.h>
#include <ArduinoSTL.h> 

#define LED_PIN 6
#define LED_COUNT 16

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRBW + NEO_KHZ800);

bool newData = false;
volatile uint8_t ledMap[LED_COUNT*3];

void updateLEDs() {

  for(int i = 0; i<LED_COUNT; i++){

    strip.setPixelColor(i, 
      ledMap[i*3], 
      ledMap[i*3+1], 
      ledMap[i*3+2]
    );
  }
  
  strip.show();
}

void setup() {
  Serial.begin(115200);
  strip.begin();           // INITIALIZE NeoPixel strip object (REQUIRED)
  strip.show();            // Turn OFF all pixels ASAP
  strip.setBrightness(50); // Set BRIGHTNESS
}

void loop() {

  static boolean recvInProgress = false;
  int idx = 0;

  while (Serial.available() > 0 && newData == false && idx < 49) {
    uint8_t received = Serial.read();
    Serial.println(received); //Very important does not work without this...
    if (recvInProgress == true) {
      if (received == 255 && idx == 48) {
        recvInProgress = false;
        idx = 0;
        newData = true;
      }
      else {
        ledMap[idx] = received;
        idx++;
      }
    }
    if (received == 254) {
      recvInProgress = true;
      idx = 0;
    }
  }

  if(newData){
    updateLEDs();
    newData = false;
  }

}

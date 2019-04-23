#include <Arduino.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>

static const uint8_t TRANSMITER_PIN = 5;
static const uint8_t SENSOR_PIN = 34;

static const uint8_t LED_TRANSMITER_PIN = 2;
static const uint8_t LED_READ_SENSOR = 10;
static const uint8_t LED_SET_POINT = 11;

static const char *DEVICE_ID = "S1";

int setPoint = -1; //default(not defined)
unsigned int sampleTime = 1000; //default(1 sec)
uint16_t ADCValue;
bool ADCTransmitted = true;
unsigned long timeNow = 0;

HardwareSerial RS485(1);

void transmitter(StaticJsonDocument<200> doc);

void setup(){
	Serial.begin(115200);
	RS485.begin(1000000, SERIAL_8N1, 16, 17);

	pinMode(TRANSMITER_PIN, OUTPUT);
	pinMode(LED_TRANSMITER_PIN, OUTPUT);

	digitalWrite(TRANSMITER_PIN, LOW);
	digitalWrite(LED_TRANSMITER_PIN, LOW);
}

void loop(){

	if(millis() - timeNow >= sampleTime){
		ADCValue = analogRead(SENSOR_PIN);
		ADCTransmitted = false;

		timeNow = millis();
	}

	if(RS485.available() > 0){
		StaticJsonDocument<200> doc;
		DeserializationError error = deserializeJson(doc, RS485);

		if(error){
			Serial.println(error.c_str());
		}else{
			if (doc.containsKey("function")) {

			}else{
				const char* addressee = doc["addressee"];
				const uint8_t action = doc["action"];

				if(strcmp(addressee,DEVICE_ID) == 0){

					StaticJsonDocument<200> doc;
					doc["id"] = DEVICE_ID;

					switch (action){
						case 1:
							{
								if(!ADCTransmitted){
									doc["sensor"] = ADCValue;
									ADCTransmitted = true;
								}
								transmitter(doc);
							}
							break;
						
						default:
							{
								JsonArray configs = doc.createNestedArray("configs");
								configs.add(sampleTime);
								configs.add(setPoint);

								transmitter(doc);
							}
							break;
					}
				}
			}
			
			//Serial.print("Receveid: ");
			//serializeJson(doc, Serial);
			//Serial.println();
			
		}
	}
}

void transmitter(StaticJsonDocument<200> doc){
	digitalWrite(LED_TRANSMITER_PIN, HIGH);
	digitalWrite(TRANSMITER_PIN, HIGH);

	serializeJson(doc, RS485);
	RS485.flush();
	
	/*
	Serial.print("Send: ");
	serializeJson(doc, Serial);
	Serial.println();
	*/

	digitalWrite(LED_TRANSMITER_PIN, LOW);
	digitalWrite(TRANSMITER_PIN, LOW);	
}

/*
* ERROR CODE:
* - 1 : Failed to receive
*/
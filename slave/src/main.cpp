#include <Arduino.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>

const uint8_t TRANSMITER_PIN = 5;
const uint8_t SENSOR_PIN = 34;
const uint8_t LED_RECEIVED_PIN = 2;

const char *DEVICE_ID = "S1";
HardwareSerial RS485(1);

void transmitter(uint8_t action);

void setup(){
	Serial.begin(115200);
	RS485.begin(1000000, SERIAL_8N1, 16, 17);

	pinMode(TRANSMITER_PIN, OUTPUT);
	pinMode(LED_RECEIVED_PIN, OUTPUT);

	digitalWrite(TRANSMITER_PIN, LOW);
	digitalWrite(LED_RECEIVED_PIN, LOW);
}

void loop(){
	if(RS485.available() > 0){
		digitalWrite(LED_RECEIVED_PIN, HIGH);

		StaticJsonDocument<200> doc;
		DeserializationError error = deserializeJson(doc, RS485);

		if(error){
			Serial.println(error.c_str());
		}else{
			const char* addressee = doc["addressee"];
			const uint8_t action = doc["action"];

			if(strcmp(addressee,DEVICE_ID) == 0){
				transmitter(action);
			}
			/*
			Serial.print("Receveid: ");
			serializeJson(doc, Serial);
			Serial.println();
			*/
		}
	
		digitalWrite(LED_RECEIVED_PIN, LOW);
	}
}

void transmitter(uint8_t action){
	digitalWrite(TRANSMITER_PIN, HIGH);

	StaticJsonDocument<200> doc;
	doc["id"] = DEVICE_ID;

	switch (action){
		case 1:
			doc["sensor"] = analogRead(SENSOR_PIN);
			break;
		
		default:
			break;
	}

	serializeJson(doc, RS485);
	RS485.flush();
	
	/*
	Serial.print("Send: ");
	serializeJson(doc, Serial);
	Serial.println();
	*/

	digitalWrite(TRANSMITER_PIN, LOW);	
}

/*
* ERROR CODE:
* - 1 : Failed to receive
*/
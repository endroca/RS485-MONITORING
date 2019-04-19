#include <Arduino.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>

uint8_t TRANSMITER_PIN = 5;
uint8_t SENSOR_PIN = 34;
uint8_t LED_RECEIVED_PIN = 2;

const char* DEVICE_ID = "S1";
HardwareSerial RS485(1);

bool transmiter = false;

void setup(){
	Serial.begin(9600);
	RS485.begin(115200, SERIAL_8N1, 16, 17);

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

			if(strcmp(addressee,DEVICE_ID) == 0){
				delay(500);
				transmiter = true;
			}

			Serial.print("Receveid: ");
			serializeJson(doc, Serial);
			Serial.println();
		}
	
		digitalWrite(LED_RECEIVED_PIN, LOW);
	}

	if(transmiter){
		digitalWrite(TRANSMITER_PIN, HIGH);

		StaticJsonDocument<200> doc;
		doc["id"] = DEVICE_ID;
		doc["sensor"] = analogRead(SENSOR_PIN);
		serializeJson(doc, RS485);
		
		Serial.print("Send: ");
		serializeJson(doc, Serial);
		Serial.println();

		transmiter = false;
		
		delay(10);
		digitalWrite(TRANSMITER_PIN, LOW);
	}
}

/*
* ERROR CODE:
* - 1 : Failed to receive
*/
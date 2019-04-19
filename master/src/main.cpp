#include <Arduino.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>

const uint8_t MAX_NUMBER_OF_SLAVES = 2;

const uint8_t TRANSMITER_PIN = 5;
const uint8_t SENSOR_PIN = 34;
const uint8_t LED_RECEIVED_PIN = 2;

const char *DEVICE_ID = "M1";
HardwareSerial RS485(1);

char *DEVICES[MAX_NUMBER_OF_SLAVES] = {};

bool firstOperation = true;
bool transmiter = false;
bool waitingReceipt = false;
unsigned long timeNow = 0;

unsigned int timeOut = 100;
unsigned int attempts = 0;


void transmitter(char* addressee, uint8_t action);
void scanDevices();

void setup(){
	Serial.begin(115200);
	RS485.begin(4000000, SERIAL_8N1, 16, 17);

	pinMode(TRANSMITER_PIN, OUTPUT);
	pinMode(LED_RECEIVED_PIN, OUTPUT);

	digitalWrite(TRANSMITER_PIN, LOW);
	digitalWrite(LED_RECEIVED_PIN, LOW);
}

void loop(){
	/*
	if(firstOperation){
		scanDevices();

		firstOperation = false;
		Serial.println("FInalizado");
	}
	*/
	
	if (RS485.available() > 0){
		digitalWrite(LED_RECEIVED_PIN, HIGH);

		StaticJsonDocument<200> doc;
		DeserializationError error = deserializeJson(doc, RS485);

		if (error){
			Serial.println(error.c_str());
		}
		else{
			const char *slaveID = doc["id"];
			uint16_t sensor = doc["sensor"];

			Serial.print("ID: ");
			Serial.println(slaveID);
			Serial.print("sensor: ");
			Serial.println(sensor);
		}

		waitingReceipt = false;
		delay(10);
		digitalWrite(LED_RECEIVED_PIN, LOW);
	}

	/*if (millis() - timeNow > 1000){
		if (waitingReceipt == false){
			transmitter("S1",1);
		}
		else{
			Serial.println("Waiting...");
		}

		timeNow = millis();
	}*/
	
	//if (waitingReceipt == false){
		delay(50);
		transmitter("S1",1);
	//}
	//else{
	//	Serial.println("Waiting...");
	//}
}
/*
void scanDevices(){
	Serial.println("Scan:");

	uint8_t index = 0;

	for(uint8_t i = 1; i <= MAX_NUMBER_OF_SLAVES; i++){
		String addresseeTMP = "S";
		addresseeTMP = addresseeTMP + i;

		char addressee[addresseeTMP.length() + 1];

		addresseeTMP.toCharArray(addressee, addresseeTMP.length() + 1);
		
		delay(2);
		transmitter(addressee, 0);

		bool received = true;
		timeNow = millis();
		while(RS485.available() == 0){
			if(millis() - timeNow > 100){
				received = false;
				break;
			}
		}

		if(received){
			StaticJsonDocument<200> doc;
			DeserializationError error = deserializeJson(doc, RS485);

			if (error){
				Serial.println(error.c_str());
			}
			else{
				const char* id = doc["id"];
				//strcpy(DEVICES[index], id);

				index++;

				Serial.print("ID: ");
				Serial.println(id);
			}			
		}

	}

}*/

void transmitter(char* addressee, uint8_t action){
	digitalWrite(TRANSMITER_PIN, HIGH);

	StaticJsonDocument<200> doc;
	doc["addressee"] = addressee;
	doc["action"] = action;
	serializeJson(doc, RS485);

	Serial.print("Send: ");
	serializeJson(doc, Serial);
	Serial.println();

	transmiter = false;
	waitingReceipt = true;

	delay(1);
	digitalWrite(TRANSMITER_PIN, LOW);
}

/*
* Structure
* {
		addressee: S1 ... S32
		action: [0 = 'ping',1 = 'read']
	}
*/
/*
* ERROR CODE:
* - 1 : Failed to receive
*/
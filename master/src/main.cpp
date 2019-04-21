#include <Arduino.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>

static const unsigned int TIME_OUT = 3;

static const uint8_t MAX_NUMBER_OF_SLAVES = 2;
static const uint8_t TRANSMITER_PIN = 5;

static const uint8_t LED_TRANSMITER_PIN = 2;
static const uint8_t LED_READ_SENSOR = 10;
static const uint8_t LED_SET_POINT = 11;

static const char *DEVICE_ID = "M1";

HardwareSerial RS485(1);

char *DEVICES[MAX_NUMBER_OF_SLAVES];
uint8_t DEVICES_ONLINE = 0;

unsigned long timeNow = 0;
unsigned long timeTransmiter = 0;



void transmitter(StaticJsonDocument<200> doc);
void transmitter(char* addressee, uint8_t action);
void scanDevices();
void readRS485();
void masterReset();

void setup(){
	Serial.begin(500000);
	RS485.begin(1000000, SERIAL_8N1, 16, 17);

	pinMode(TRANSMITER_PIN, OUTPUT);
	pinMode(LED_TRANSMITER_PIN, OUTPUT);

	digitalWrite(TRANSMITER_PIN, LOW);
	digitalWrite(LED_TRANSMITER_PIN, LOW);
}

void loop(){
	
	if(Serial.available() > 0){
		StaticJsonDocument<200> doc;
		DeserializationError error = deserializeJson(doc, Serial);

		if(error){
			Serial.println(error.c_str());
		}else{
			const uint8_t function = doc["function"]; //function
			
			switch (function){
				//set configuration in slave
				case 1:
					transmitter(doc);
					break;

				
				//get slaves online
				case 2:
					{
						StaticJsonDocument<200> online;
						JsonArray array = online.to<JsonArray>();
						for(uint8_t i = 0; i < DEVICES_ONLINE;i++){
							array.add(DEVICES[i]);
						}
						serializeJson(online, Serial);
						Serial.write('\n');
						Serial.flush();
					}
					break;
				
				//Master reset
				case 3:
					masterReset();
					break;

				default:
					break;
			}
		}
	}
	
	/*
	*	Routine operation
	*/
	if(DEVICES_ONLINE == 0){
		scanDevices();
	}else{
		for(uint8_t i = 0; i < DEVICES_ONLINE;i++){
			transmitter(DEVICES[i], 1);

			bool received = true;
			timeNow = millis();
			while(RS485.available() == 0){
				if(millis() - timeNow >= TIME_OUT){
					received = false;
					break;
				}
			}

			if(received){
				readRS485();
			}
		}
	}
}

void readRS485(){
	
	StaticJsonDocument<200> doc;
	DeserializationError error = deserializeJson(doc, RS485);	
	if (error){
		Serial.println(error.c_str());
	}
	else{
		unsigned long PING = millis() - timeTransmiter;	
		const char *slaveID = doc["id"];
		uint16_t sensor = doc["sensor"];	

		StaticJsonDocument<200> doc;
		doc["id"] = slaveID;
		doc["sensor"] = sensor;
		doc["ping"] = PING;

		serializeJson(doc, Serial);
		Serial.write('\n');
		Serial.flush();
	}	
}

void scanDevices(){
	uint8_t index = 0;
	DEVICES_ONLINE = 0;

	for(uint8_t i = 1; i <= MAX_NUMBER_OF_SLAVES; i++){
		String addresseeTMP = "S";
		addresseeTMP = addresseeTMP + i;

		char addressee[addresseeTMP.length() + 1];

		addresseeTMP.toCharArray(addressee, addresseeTMP.length() + 1);
		
		transmitter(addressee, 0);

		bool received = true;
		timeNow = millis();
		while(RS485.available() == 0){
			if(millis() - timeNow >= TIME_OUT){
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
				DEVICES[index] = strdup(id);

				index++;
				DEVICES_ONLINE++;
			}			
		}

	}

}

void transmitter(char* addressee, uint8_t action){
	StaticJsonDocument<200> doc;
	doc["addressee"] = addressee;
	doc["action"] = action;

	transmitter(doc);
}

void transmitter(StaticJsonDocument<200> doc){
	digitalWrite(LED_TRANSMITER_PIN, HIGH);	
	digitalWrite(TRANSMITER_PIN, HIGH);

	serializeJson(doc, RS485);
	RS485.flush();
	timeTransmiter = millis();

	/*
	Serial.print("Send: ");
	serializeJson(doc, Serial);
	Serial.println();
	*/

	digitalWrite(LED_TRANSMITER_PIN, LOW);
	digitalWrite(TRANSMITER_PIN, LOW);
}

void masterReset(){
	ESP.restart();
/*	
	Hard reset
	esp_task_wdt_init(1,true);
	esp_task_wdt_add(NULL);
*/
}

/*
* Structure
* {
		addressee: S1 ... S32
		action: [0 = 'ping',1 = 'read',2 = 'configs']
	}
*/
/*
* ERROR CODE:
* - 1 : Failed to receive
*/
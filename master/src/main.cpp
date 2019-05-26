#include <Arduino.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WiFiClient.h>

// Requests controller
static const uint8_t TIME_OUT = 3;
static const uint8_t MAX_ATTEMPTS = 3;
static const uint8_t MAX_NUMBER_OF_SLAVES = 2;

// Pin definition
static const uint8_t TRANSMITER_PIN = 21;
	
static const uint8_t LED_TRANSMITER_PIN = 12;
static const uint8_t LED_READ_SENSOR = 26;
static const uint8_t LED_SET_POINT = 25;
static const uint8_t LED_ON_OFF = 32;

// Device ID
const char* DEVICE_ID = "M1";
const char* PASSWORD = "ifes";

//WebServer
WiFiServer server(80);
WiFiClient client;

//Serial HardwareSerial
HardwareSerial RS485(1);

// Slaves controller
char *DEVICES[MAX_NUMBER_OF_SLAVES];
uint8_t DEVICES_ONLINE = 0;
uint8_t attempts = 0;

unsigned long timeNow = 0; // time for timeout
unsigned long timeTransmiter = 0; // time for PING


// Function definition
void transmitter(StaticJsonDocument<200> doc);
void transmitter(char* addressee, uint8_t action);

template <class T>
void scanDevices(T protocol);

template <class T>
void readRS485(T protocol);

bool waitReceiveRS485(bool attemptsController, uint8_t timeOut);
void masterReset();

template <class T>
void process(T protocol);

void setup(){
	Serial.begin(115200);
	WiFi.softAP(DEVICE_ID, PASSWORD);
	server.begin();
	RS485.begin(1000000, SERIAL_8N1, 16, 17);

	pinMode(TRANSMITER_PIN, OUTPUT);
	pinMode(LED_TRANSMITER_PIN, OUTPUT);

	digitalWrite(TRANSMITER_PIN, LOW);
	digitalWrite(LED_TRANSMITER_PIN, LOW);
	
}

void loop(){
	client = server.available();

	if(client){
		/*
		* Operation mode: Wifi (TCP)
		*/
		while(client.connected()){
			if(client.available() > 0){

			}
			/*
			*	Routine operation
			*/
			process(client);
		}
	}else{
		/*
		* Operation mode : Serial
		*/
		if(Serial.available() > 0){
			StaticJsonDocument<200> doc;
			DeserializationError error = deserializeJson(doc, Serial);

			if(error){
				Serial.println(error.c_str());
			}else{
				const uint8_t action = doc["action"]; //action
				
				switch (action){
					//set configuration in slave
					case 1:
						{
							doc["action"] = 2;
							transmitter(doc);
							
							if(waitReceiveRS485(false, 50)){
								readRS485(Serial);
							}
						}
						break;

					//get slaves online
					case 2:
						scanDevices(Serial);
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
		process(Serial);
	}	
}

template <class T>
void process(T protocol){
	if(DEVICES_ONLINE == 0){
		scanDevices(protocol);

		delay(1000);
	}else{
		for(uint8_t i = 0; i < DEVICES_ONLINE;i++){
			//opening channel
			transmitter(DEVICES[i], 1);

			if(waitReceiveRS485(true, TIME_OUT)){
				//reading the slaves' data
				readRS485(Serial);
			}else{
				if(attempts >= MAX_ATTEMPTS){
					scanDevices(protocol);
				}
			}
		}
	}
}

template <class T>
void readRS485(T protocol){
	
	StaticJsonDocument<200> doc;
	DeserializationError error = deserializeJson(doc, RS485);	
	if (error){
		protocol.println(error.c_str());
	}
	else{
		unsigned long PING = millis() - timeTransmiter;

		if(doc.containsKey("sensor")){
			const char *slaveID = doc["id"];
			uint16_t sensor = doc["sensor"];	

			StaticJsonDocument<200> doc;
			doc["id"] = slaveID;
			doc["sensor"] = sensor;
			doc["ping"] = PING;

			serializeJson(doc, protocol);
			protocol.write('\n');
			protocol.flush();
		}
	}	
}

bool waitReceiveRS485(bool attemptsController, uint8_t timeOut){
	bool received = true;
	timeNow = millis();
	while(RS485.available() == 0){
		if(millis() - timeNow >= timeOut){
			received = false;
			if(attemptsController) attempts++;
			break;
		}
	}
	return received;
}

template <class T>
void scanDevices(T protocol){
	uint8_t index = 0;
	
	DEVICES_ONLINE = 0;
	attempts = 0;

	DynamicJsonDocument response(512);
	response["action"] = 2; // action to ping (serial pc->master)
	JsonArray sensors = response.createNestedArray("response");

	for(uint8_t i = 1; i <= MAX_NUMBER_OF_SLAVES; i++){
		String addresseeTMP = "S";
		addresseeTMP = addresseeTMP + i;

		char addressee[addresseeTMP.length() + 1];

		addresseeTMP.toCharArray(addressee, addresseeTMP.length() + 1);
		
		transmitter(addressee, 0);

		if(waitReceiveRS485(false, TIME_OUT)){
			StaticJsonDocument<200> doc;
			DeserializationError error = deserializeJson(doc, RS485);

			if (error){
				protocol.println(error.c_str());
			}
			else{
				JsonObject obj = doc.as<JsonObject>();
				sensors.add(obj);

				const char* id = doc["id"];
				DEVICES[index] = strdup(id);

				index++;
				DEVICES_ONLINE++;
			}			
		}

	}

	serializeJson(response, protocol);
	protocol.write('\n');
	protocol.flush();
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
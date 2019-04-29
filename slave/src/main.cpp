#include <Arduino.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

static const uint8_t TRANSMITER_PIN = 5;
static const uint8_t SENSOR_PIN = 34;

static const uint8_t LED_TRANSMITER_PIN = 2;
static const uint8_t LED_READ_SENSOR = 10;
static const uint8_t LED_SET_POINT = 11;

static const int16_t SETPOINT = -1;
static const unsigned int SAMPLETIME = 1000;

static const size_t EEPROM_SIZE = 6; // 2 - SETPOINT + 4 - SAMPLETIME (in byte)

static const char *DEVICE_ID = "S1";

//Setting
int16_t setPoint;
unsigned int sampleTime;

//ADC controller
uint16_t ADCValue;
bool ADCTransmitted = true;
unsigned long timeNow = 0;

//Serial HardwareSerial
HardwareSerial RS485(1);

void transmitter(StaticJsonDocument<200> doc);
void readEEPROM();
void writeEEPROM(int16_t setPoint, unsigned int sampleTime);

void setup(){
	Serial.begin(115200);
	RS485.begin(1000000, SERIAL_8N1, 16, 17);
	
	readEEPROM();

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
			if(doc.containsKey("addressee")){
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
							}
							break;

						case 2:
							{
								writeEEPROM(doc["configs"][1], doc["configs"][0]);
								timeNow = millis(); //reset
							}
							break;
						
						default:
							{
								JsonArray configs = doc.createNestedArray("configs");
								configs.add(sampleTime);
								configs.add(setPoint);
							}
							break;
					}

					transmitter(doc);
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


void readEEPROM(){
	EEPROM.begin(EEPROM_SIZE);

	bool firstOperationInEEPROM = true;
	for(uint8_t i = 0; i < EEPROM_SIZE; i++){
		if(EEPROM.read(i) != 255){
			firstOperationInEEPROM = false;
			break;
		}
	}
	
	if(firstOperationInEEPROM){
		writeEEPROM(SETPOINT, SAMPLETIME);
	}else{
		setPoint = EEPROM.readInt(0);
		sampleTime = EEPROM.readUInt(2);
	}

	/*
	setPoint = (EEPROM.read(1) << 8) + (EEPROM.read(0) << 0);
	sampleTime = (EEPROM.read(5) << 24) + (EEPROM.read(4) << 16) + (EEPROM.read(3) << 8) + (EEPROM.read(2) << 0);
	*/
	EEPROM.end();
}

void writeEEPROM(int16_t _setPoint, unsigned int _sampleTime){
	EEPROM.begin(EEPROM_SIZE);

	EEPROM.writeInt(0, _setPoint);
	EEPROM.writeUInt(2, _sampleTime);
	/*
	EEPROM.write(0, (byte) (_setPoint & 0xFF));
	EEPROM.write(1, (byte) ((_setPoint >> 8) & 0xFF));

	EEPROM.write(2, (byte) (_sampleTime & 0xFF));
	EEPROM.write(3, (byte) ((_sampleTime >> 8) & 0xFF));
	EEPROM.write(4, (byte) ((_sampleTime >> 16) & 0xFF));
	EEPROM.write(5, (byte) ((_sampleTime >> 24) & 0xFF));
	*/
	setPoint = _setPoint;
	sampleTime = _sampleTime;

	EEPROM.end();
}
/*
* ERROR CODE:
* - 1 : Failed to receive
*/
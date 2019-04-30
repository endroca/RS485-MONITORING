#include <Arduino.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

// Pin definition
static const uint8_t TRANSMITER_PIN = 5;
static const uint8_t SENSOR_PIN = 34;
static const uint8_t LED_TRANSMITER_PIN = 2;
static const uint8_t LED_READ_SENSOR = 10;
static const uint8_t LED_SET_POINT = 11;

// Const operation (default)
static const int16_t SETPOINT = -1; // 2 bytes
static const uint8_t TOLERANCE = 5; // 1 byte
static const unsigned int SAMPLETIME = 1000; // 4 bytes

// Size memory 
static const size_t EEPROM_SIZE = 7;

// Device ID
static const char *DEVICE_ID = "S1";

//Setting
int16_t setPoint;
uint8_t tolerance;
unsigned int sampleTime;

//ADC controller
uint16_t ADCValue;
bool ADCTransmitted = true;
unsigned long timeNow = 0;

//Serial HardwareSerial
HardwareSerial RS485(1);

void transmitter(StaticJsonDocument<200> doc);
void readEEPROM();
void writeEEPROM(int16_t setPoint, unsigned int sampleTime, uint8_t _tolerance);
void resetEEPROM();

void setup(){
	Serial.begin(115200);
	RS485.begin(1000000, SERIAL_8N1, 16, 17);
	//resetEEPROM();
	//delay(1000);
	readEEPROM();

	pinMode(TRANSMITER_PIN, OUTPUT);
	digitalWrite(TRANSMITER_PIN, LOW);

	pinMode(LED_TRANSMITER_PIN, OUTPUT);
	digitalWrite(LED_TRANSMITER_PIN, LOW);

	pinMode(LED_READ_SENSOR, OUTPUT);
	digitalWrite(LED_READ_SENSOR, LOW);

	pinMode(LED_SET_POINT, OUTPUT);
	digitalWrite(LED_SET_POINT, LOW);
}

void loop(){

	if(millis() - timeNow >= sampleTime){
		ADCValue = analogRead(SENSOR_PIN);
		ADCTransmitted = false;

		timeNow = millis();
	}

	if(RS485.available() > 0){
		StaticJsonDocument<200> receiveDOC;
		DeserializationError error = deserializeJson(receiveDOC, RS485);

		if(error){
			Serial.println(error.c_str());
		}else{
			if(receiveDOC.containsKey("addressee")){
				const char* addressee = receiveDOC["addressee"];
				const uint8_t action = receiveDOC["action"];

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
								const unsigned int _sampleTime = receiveDOC["configs"][0];
								const int16_t _setPoint = receiveDOC["configs"][1];
								const uint8_t _tolerance = receiveDOC["configs"][2];
								writeEEPROM(_setPoint, _sampleTime, _tolerance);
								timeNow = millis(); //reset
							}
							break;
						
						default:
							{
								JsonArray configs = doc.createNestedArray("configs");
								configs.add(sampleTime);
								configs.add(setPoint);
								configs.add(tolerance);
							}
							break;
					}

					transmitter(doc);
				}
			}
			/*
			Serial.print("Receveid: ");
			serializeJson(doc, Serial);
			Serial.println();
			*/
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
		writeEEPROM(SETPOINT, SAMPLETIME, TOLERANCE);
	}else{
		setPoint = EEPROM.readShort(0);
		sampleTime = EEPROM.readUInt(2);
		tolerance = EEPROM.readByte(6);
	}

	/*
	setPoint = (EEPROM.read(1) << 8) + (EEPROM.read(0) << 0);
	sampleTime = (EEPROM.read(5) << 24) + (EEPROM.read(4) << 16) + (EEPROM.read(3) << 8) + (EEPROM.read(2) << 0);
	*/
	EEPROM.end();
}

void writeEEPROM(int16_t _setPoint, unsigned int _sampleTime, uint8_t _tolerance){
	EEPROM.begin(EEPROM_SIZE);

	EEPROM.writeShort(0, _setPoint);
	EEPROM.writeUInt(2, _sampleTime);
	EEPROM.writeByte(6, _tolerance);
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
	tolerance = _tolerance;

	EEPROM.end();
}

void resetEEPROM(){
	EEPROM.begin(EEPROM_SIZE);
	
	for(uint16_t i = 0; i < EEPROM_SIZE; i++){
		EEPROM.write(i, 0xFF);
	}

	EEPROM.end();
}
/*
* ERROR CODE:
* - 1 : Failed to receive
*/
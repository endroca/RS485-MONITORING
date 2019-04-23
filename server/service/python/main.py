
import settings
import os
import time
from serial import Serial


ser = Serial(os.getenv('USB_PORT'), baudrate=os.getenv('USB_RATE'))
writeMode = True


def functionHeader(id):
    return {
        1: "".encode(),  # transmiter setting to salves
        2: "{function:2}".encode(),  # get slaves online,
        3: "{function:3}".encode(),  # reset master
    }[id]


if __name__ == '__main__':
    while(True):
        # ser.write("{function:2}".encode())
        # time.sleep(1)

        if writeMode:
            ser.write(functionHeader(2))
            time.sleep(1)

        json = ser.readline().decode("ascii").strip()

        print(json)


import zmq
import random
import sys
import time
import json

port = "7777"

context = zmq.Context()
socket = context.socket(zmq.PUB)
socket.bind("ws://*:%s" % port)

i = 0
while True:
    i += 1
    messagedata = {'event': 'hello', 'data': i}
    print(f"update, {messagedata}")
    socket.send_string(json.dumps(messagedata))
    time.sleep(1)

import zmq
import time
import sys
import json

context = zmq.Context()
socket = context.socket(zmq.REP)
socket.bind("ws://*:6767")

while True:
    #  Wait for next request from client
    try:
        message = json.loads(socket.recv())
        print("Received request: ", message)
    except:
        time.sleep(1)  
    try:
        socket.send(b"OK")
    except:
        time.sleep(1)  

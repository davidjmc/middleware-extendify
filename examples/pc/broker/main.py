from agent import AmotAgent

configs ={
    'THING_ID': 'Broker', # thing_id, get from thing
    'AMOT_HOST': '192.168.0.7',
    'AMOT_PORT': 60010
    }

AmotAgent._env = configs
AmotAgent.thingStart()

import socket
ip = ''
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    # doesn't even have to be reachable
    s.connect(('10.255.255.255', 1))
    ip = s.getsockname()[0]
except:
    ip = '127.0.0.1'
finally:
    s.close()

from app import App
from mex import AmotEngine

AmotEngine.setInstanceWith(ip, AmotAgent, configs)
AmotEngine.getInstance().run(App())
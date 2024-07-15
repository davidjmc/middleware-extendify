from mex import Amot
import configurations
import time
import requests
import json
from random import randrange
import os

class App:
  def __init__(self):
    super().__init__()

  def setup(self):
    try:
      Amot.proxy().subscribe(configurations.configurations['application']['subscribe_to'])
    except OSError as e:
      print('Error < {0} > Subscriber not subscribe on the Broker'.format(str(e))) 
    pass

  def map(self, v, in_min, in_max, out_min, out_max):
    return int((v - in_min) * (out_max - out_min) / (in_max - in_min) + out_min)


  def map_float(slef, v, in_min, in_max, out_min, out_max):
    return float((v - in_min) * (out_max - out_min) / (in_max - in_min) + out_min)

  def get_battery(self, raw):
    ratioFactor = 1.27 
    voltage_pinA0 = (raw / 1023) * 3.3
    voltage_battery = voltage_pinA0 * ratioFactor
    percent_battery = self.map(voltage_battery, 2.8, 4.2, 0, 100)
    return percent_battery


  def loop(self):
    try:
      data = Amot.proxy().checkMsg(configurations.configurations['application']['subscribe_to'])
      if data:
        if len(data['MSG']) > 0:
          print(data['MSG'])
          txt = data['MSG']
          raw = int(data['MSG']['d4:6a:6a:fe:23:df']['battery'])

          battery = self.get_battery(raw)

          timestamp = data['MSG']['d4:6a:6a:fe:23:df']['timer']
          # print('{} | {}'.format(timestamp, battery))
          # with open(self.output_file, "a") as f:
          #   f.write(str(txt) + "\n")
          #   print("Message written to file.")
    except OSError as e:
      print('Error < {0} > Subscriber cannot check messages on the Broker'.format(str(e))) 

    time.sleep(configurations.configurations['application']['loop_interval'])
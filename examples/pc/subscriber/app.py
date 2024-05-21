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

  def loop(self):
    try:
      data = Amot.proxy().checkMsg(configurations.configurations['application']['subscribe_to'])
      if data:
        if len(data['MSG']) > 0:
          print(data['MSG'])
          txt = data['MSG']
          # with open(self.output_file, "a") as f:
          #   f.write(str(txt) + "\n")
          #   print("Message written to file.")
    except OSError as e:
      print('Error < {0} > Subscriber cannot check messages on the Broker'.format(str(e))) 

    time.sleep(configurations.configurations['application']['loop_interval'])
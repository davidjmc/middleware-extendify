from mex import Amot
import configurations
import time
import random as r
from datetime import datetime, timezone, timedelta

RECTANGLE = True
CYLINDER = False

DEEP_HEIGHT = 100 # [cm]

# RECTANGLE_HEIGHT = 1 
RECTANGLE_LENGTH = 100
RECTANGLE_WIDTH = 100

# CYLINDER_DIAMETER = 1
CYLINDER_RADIUS = 100
# CYLINDER_HEIGHT = 1
PI = 3.1415927

MINIMUM_SENSOR_RANGE = 2 # [cm]
MAXIMUM_SENSOR_RANGE = 400 # [cm]

# capacity of reservoir in Liters
def reservoirCapacity(DEEP_HEIGHT, reservoirArea):
  reservoir_capacity = (DEEP_HEIGHT * reservoirArea) / 1000
  return reservoir_capacity

def reservoirProfileArea():
  if RECTANGLE:
    reservoirArea = RECTANGLE_WIDTH * RECTANGLE_LENGTH
  else:
    reservoirArea = PI * CYLINDER_RADIUS * CYLINDER_RADIUS
  return reservoirArea

class App:
  def __init__(self):
    super().__init__()
    self.counter = 1
    self.reservoirArea = 0
    self.topic = None
    self.thing = None

  def setup(self):
    try:
      # Amot.proxy().connect()
      print('setting things up')
    except OSError as e:
      print("Error < {0} > Application not configure the setup".format(str(e)))
    pass

  def loop(self):

    self.reservoirProfile = reservoirProfileArea()
    self.topic = configurations.configurations['application']['publish_in']
    self.thing_id = configurations.configurations['device']['id']

    capacity = reservoirCapacity(DEEP_HEIGHT, self.reservoirProfile)
    volume = self.reservoirVolume(DEEP_HEIGHT, self.reservoirProfile)

    # msg = {
    #   'thing_id': self.thing_id,
    #   'counter': self.counter,
    #   'volume': volume,
    #   'capacity': capacity
    # }

     # Obter a data e hora atuais
    data_hora_atual = datetime.now(timezone.utc)
    # data_hora_brasil = data_hora_atual.replace(hour=data_hora_atual.hour + (-3))
    data_hora_brasil = data_hora_atual - timedelta(hours=3)

    # Formatar a data e hora como uma string no formato especificado
    data = data_hora_brasil.strftime("%Y-%m-%dT%H:%M:%SZ")

    altura = r.randint(0, 100)

    battery = r.randint(684, 1023)

    # Imprimir a saída formatada  
    # rint(saida_formatada)

    # msg = {
    #   'thing_id': self.thing_id,
    #   'counter': self.counter,
    #   'volume': volume,
    #   'capacity': capacity,
    #   'timer': 1
    # }

    msg = {
      'distance': altura,
      'battery' : battery,
      'timer': data
    }

    ## topics = configurations.configurations['application']['publish_in']

    ## temp, hum = self.temp_hum_sensor()
    # msg = 'Temperature: %s and Humidity: %s @ %s' % (temp, hum, 'lalala')
    # msg = [temp, hum, ['test', 'oi,virgula']]
    ## msg = [temp, hum]

    ##print('Publishing on topic [{0}]: {1}'.format(topics, msg))
    print('Publishing on topic [{0}]: {1}'.format(self.topic, msg))
    Amot.proxy().publish(self.topic, msg)
    time.sleep(configurations.configurations['application']['loop_interval'])

    string_volume = str(volume)
    string_capacity = str(capacity)
    string_data = str(data.replace(":", "."))

    Amot.agent().app_context['fluid_volume'] = b'' + string_volume.encode("utf-8") + b'' 
    Amot.agent().app_context['reservoir_capacity'] = b'' + string_capacity.encode("utf-8") + b''
    Amot.agent().app_context['timestamp'] = b'' + string_data.encode("utf-8") + b''

    self.counter += 1

  # def temp_hum_sensor(self):
  #   try:
  #     temp = 30.0 * r.random()
  #     hum = 30.0 * r.random()
  #     if (isinstance(temp, float) and isinstance(hum, float)) or (isinstance(temp, int) and isinstance(hum, int)):
  #       temp = b'%3.1f' % temp
  #       hum = b'%.1f' % hum
  #       return temp, hum
  #     else:
  #       return 'Invalid sensor reading'
  #   except OSError as e:
  #     return 'Failed to read sensor.'
    
  # get distance in [cm]
  def _distance_cm(self):
    try:
      distance = r.randint(1, 100)
      if (isinstance(distance, float) or isinstance(distance, int)):
        distance = distance
        return distance
      else:
        return 'Invalid sensor reading'
    except OSError as e:
      return 'Failed to read sensor.'
    
  def reservoirVolume(self, DEEP_HEIGHT, reservoirArea):
    distance = self._distance_cm()
    currentDistance = DEEP_HEIGHT - (distance - MINIMUM_SENSOR_RANGE) # currente tank range in [cm]
    currentVolumeCM = (reservoirArea * currentDistance) # valume of tank in [cm^3]
    currentVolumeLiters = currentVolumeCM / 1000.0
    return currentVolumeLiters
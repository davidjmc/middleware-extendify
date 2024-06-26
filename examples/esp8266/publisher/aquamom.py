from amot import Amot
from agent import AmotAgent
from machine import Pin, ADC, RTC
import configurations
import machine
import time

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

def deep_sleep(msecs):
    # configure RTC.ALARM0 to be able to wake the device
    rtc = machine.RTC()
    rtc.irq(trigger=rtc.ALARM0, wake=machine.DEEPSLEEP)
    # set RTC.ALARM0 to fire after X milliseconds (waking the device)
    rtc.alarm(rtc.ALARM0, msecs)
    # put the device to sleep
    machine.deepsleep()    
    
def reservoirProfileArea():
    if RECTANGLE:
        reservoirArea = RECTANGLE_WIDTH * RECTANGLE_LENGTH
    else:
        reservoirArea = PI * CYLINDER_RADIUS * CYLINDER_RADIUS
    return reservoirArea

class Aquamom:
    
    def __init__(self):
        super().__init__()
        self.echo_timeout_us = 500*2*30
        self.trig = Pin(12, mode=Pin.OUT, pull=None)
        self.trig.value(0)
        self.echo = Pin(14, mode=Pin.IN, pull=None)
        self.start = 1
        self.reservoirProfile = 0
        self.topic = "channels/water-level"
        self.counter = 1
        self.timer = 0
        
    def setup(self):
        print('setting things up')    
    
    def loop(self):
        
        # topic = configurations.configurations['application']['publish_in']
        #Amot.proxy().checkMsg()
        
        #message = b'Hello #%d' % self.counter
        self.reservoirProfile = reservoirProfileArea()
        self.topic = configurations.configurations['application']['publish_in']
        self.thing_id = configurations.configurations['device']['id']
        
        #print('Publishing on topic {0} the message: {1}'.format(Amot.configApp('publish_in'), message))
                 
        capacity = reservoirCapacity(DEEP_HEIGHT, self.reservoirProfile)
        volume = self.reservoirVolume(DEEP_HEIGHT, self.reservoirProfile)

        # msg = b'[' + str(self.counter) + '] Water Level Monitoring: [' + str(volume) + '] Capacity: [' + str(capacity) + '] rtc-memory: [' + str(Amot.instance().rtc.memory()) + ']'
        # msg = 'Counter:' + str(self.counter) + '&Volume:' +str(volume)+ '&Capacity:' + str(capacity)
        ## msg = b'[' + str(self.counter) + '] Water Level Monitoring: [' + str(volume) + '] Capacity: [' + str(capacity) + '] Time: [' + str(time.time()) + ']'

        # msg = {
        #    'thing_id': '1-new',
        #    'counter': self.counter,
        #    'volume': volume,
        #    'capacity': capacity,
        #    'timer': self.timer
        #}
        
        distance = self._distance_cm()
        
        battery = self._battery()
    
        data_hora_brasil = time.time() -10800  # 1 hora = 3600 segundos

        # Formatar a data e hora como uma string no formato especificado
        data_formatada = time.localtime(data_hora_brasil)
        data = "{:04d}-{:02d}-{:02d}T{:02d}:{:02d}:{:02d}Z".format(
            data_formatada[0], data_formatada[1], data_formatada[2],
            data_formatada[3], data_formatada[4], data_formatada[5]
        )
        
        msg = {
            'distance': distance,
            'battery': battery,
            'timer': data
            }

        try:
            print('Publishing on topic [{0}]: [{1}]'.format(self.topic, msg))
            ###start_ticks = time.ticks_us()
            Amot.proxy().publish(self.topic, msg, {'fluid_volume': volume, 'reservoir_capacity': capacity})
            ###end_ticks = time.ticks_us()
            ###time_ticks = time.ticks_diff(end_ticks, start_ticks)
            ###time_ms = time_ticks // 1000
            
            ##print('Publishing on topic [{0}]: {1}'.format(self.topic, msg))
            ##start_time = time.ticks_us()
            ##self.client.publish(self.topic, msg)
            ##end_time = time.ticks_us()
            ##self.timer = end_time - start_time
        except OSError as e:
            restart_and_reconnect()
         
        ###with open('framot-chatgpt-5s.txt', "a") as f:
            ###f.write("Microsegundos: {0}".format(time_ms) + "\n")
            
        Amot.agent().app_context['fluid_volume'] = b'' + str(volume) + '' 
        Amot.agent().app_context['reservoir_capacity'] = b'' + str(capacity) + ''
        
        self.counter += 1
        
        # print('Sleep time in app = {0}'.format(configurations.configurations['application']['loop_interval']))
        # time.sleep(1)
        # time.sleep(configurations.configurations['application']['loop_interval'])
        #Amot.deep_sleep((configurations.configurations['application']['loop_interval'])*1000)
        # self.deep_sleep(10000)

    # send pulse and wait    
    def _send_pulse_and_wait(self):
        self.trig.value(0) # estabiliza o sensor
        time.sleep_us(10)
        self.trig.value(1)

        # envia um pulso de10us.
        time.sleep_us(10)
        self.trig.value(0)

        try:
          pulse_time = machine.time_pulse_us(self.echo, 1, self.echo_timeout_us)
          return pulse_time

        except OSError as ex:
          if ex.args[0] == 110: # 110 = ETIMEDOUT
            raise OSError('Out of range')
          raise ex
    
    # get distance in [cm]
    def _distance_cm(self):
        pulse_time = self._send_pulse_and_wait()
        cms = (pulse_time / 2) / 29.1
        return cms
    
    def reservoirVolume(self, DEEP_HEIGHT, reservoirArea):
        distance = self._distance_cm()
        #print("Distance = {}".format(distance))
        currentDistance = DEEP_HEIGHT - (distance - MINIMUM_SENSOR_RANGE) # currente tank range in [cm]
        currentVolumeCM = (reservoirArea * currentDistance) # valume of tank in [cm^3]
        currentVolumeLiters = currentVolumeCM / 1000.0
        return currentVolumeLiters
    
    # capacity of reservoir in Liters
    def reservoirCapacity(self, DEEP_HEIGHT, reservoirArea):
        reservoir_capacity = (DEEP_HEIGHT * reservoirArea) / 1000
        return reservoir_capacity
    
    def _battery(self):
        pot = ADC(0)
        raw = pot.read()
        return raw
    
        

    

        





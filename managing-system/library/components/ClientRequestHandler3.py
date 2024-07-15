from mex import Amot
import socket
import time

class ClientRequestHandler():

    def __init__(self):
        super().__init__()

    def run(self, invData):
        data = invData['DATA']
        host = Amot.configEnv('broker_host')
        port = int(Amot.configEnv('broker_port'))

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        if port == 0:
            port = 60000
        try:
            sock.connect(socket.getaddrinfo(host, port)[0][-1])
            if Amot.configEnv('await_broker_response') == 1:
                sock.setblocking(True)
            else:
                sock.setblocking(False)
        except OSError as e:
            print('Error: ' + str(e) + ' Couldnt connect with socket-server')
            sock.close()
            return False

        try:
            self.send(sock, data)
            response = self.receive(sock)
        finally:
            sock.close()
        return response

    def send(self, sock, data):
        try:
            l = bytes(('0' * 10 + str(len(data)))[-10:], 'ascii')
            sock.sendall(l + data)
        except OSError as e:
            print('Error: ' + str(e) + ' Couldnt send data in CRH')
            sock.close()
            return False

    def receive(self, sock):
        buffer_size = 536
        response = b''
        try:
            while True:
                part = sock.recv(buffer_size)
                if not part:
                    break
                response += part
                if len(part) < buffer_size:
                    break
            if response == b'0':
                return True
            elif response == b'':
                return False
        except OSError as e:
            print('Error: ' + str(e) + ' Couldnt receive data in CRH')
            return False
        return {'DATA': response}

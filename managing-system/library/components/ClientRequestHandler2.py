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
            sock.setblocking(Amot.configEnv('await_broker_response') == 1)
        except OSError as e:
            print(f'Error: {e} - Could not connect to socket server')
            sock.close()
            return False

        if not self.send(sock, data):
            sock.close()
            return False

        response = self.receive(sock)
        sock.close()
        return response

    def send(self, sock, data):
        try:
            length_prefix = bytes(f'{len(data):010}', 'ascii')
            sock.sendall(length_prefix + data)
            return True
        except Exception as e:
            print(f'Error: {e} - Could not send data in ClientRequestHandler')
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
        except Exception as e:
            print(f'Error: {e} - Could not receive data in ClientRequestHandler')
            return False
        return {'DATA': response}

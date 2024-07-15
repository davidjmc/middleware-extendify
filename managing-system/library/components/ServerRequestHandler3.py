import socket
import selectors
from mex import Amot

class ServerRequestHandler():
    def __init__(self):
        super().__init__()
        self.server_sock = None
        self.address = None
        self.connection = None
        self.message = None
        self.selector = selectors.DefaultSelector()
        self.ip = None

    def run(self):
        try:
            if self.server_sock is None:
                self.server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                self.server_sock.settimeout(None)
                self.address = socket.getaddrinfo(Amot.configEnv('broker_host'), Amot.configEnv('broker_port'))[0][-1]

                try:
                    self.server_sock.bind(self.address)
                    print('[ Starting up on {} port {} ] >'.format(*self.address))
                    self.server_sock.listen(5)
                    self.server_sock.setblocking(False)
                    self.selector.register(self.server_sock, selectors.EVENT_READ, self.accept)

                except OSError as e:
                    print('ServerRequestHandler Bind Error: ', e)

        except OSError as e:
            print('ServerRequestHandler Socket Error: ', e)

        while True:
            events = self.selector.select(timeout=None)
            for key, mask in events:
                callback = key.data
                callback(key.fileobj)

    def accept(self, sock):
        try:
            connection, device = sock.accept()
            # print(f'Accepted connection from {device}')
            connection.setblocking(False)
            self.selector.register(connection, selectors.EVENT_READ, self.read)
        except OSError as e:
            print('Error when receiving data on the ServerRequestHandler: ', e)

    def read(self, conn):
        buffer_size = 536
        data = b''
        try:
            l = conn.recv(10)
            # print('Received length:', l)
            if l == b'':
                self.selector.unregister(conn)
                conn.close()
                return
            l = int(l)
            while l > 0:
                part = conn.recv(min(l, buffer_size))
                data += part
                l -= len(part)
                if len(part) < buffer_size:
                    break
            # print('Received data:', data)
        except OSError as e:
            print('LOG = {0}'.format(e))
            self.selector.unregister(conn)
            conn.close()
            return

        if data:
            response = Amot.attached(self).run({
                'DATA': data
            })
            if not response:
                response = {'DATA': b'0'}  # response = b'0'
            try:
                conn.sendall(response['DATA'])  # response['DATA']
            except:
                pass
        else:
            self.selector.unregister(conn)
            conn.close()

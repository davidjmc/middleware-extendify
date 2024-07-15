import socket
import select
from mex import Amot
import errno

class ServerRequestHandler():
    def __init__(self):
        super().__init__()
        self.server_sock = None
        self.address = None
        self.sources = []

    def run(self):
        try:
            if self.server_sock is None:
                self.server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                self.address = socket.getaddrinfo(Amot.configEnv('broker_host'), Amot.configEnv('broker_port'))[0][-1]
                self.server_sock.bind(self.address)
                print('[ Starting up on {} port {} ] >'.format(*self.address))
                self.server_sock.listen(5)
                self.sources.append(self.server_sock)
        except OSError as e:
            print('ServerRequestHandler Initialization Error: ', e)
            return

        while True:
            try:
                readable, _, exceptional = select.select(self.sources, [], self.sources)

                for s in readable:
                    if s is self.server_sock:
                        self._accept_new_connection()
                    else:
                        self._handle_existing_connection(s)

                for s in exceptional:
                    self._remove_connection(s)
            except Exception as e:
                print('ServerRequestHandler Runtime Error: ', e)

    def _accept_new_connection(self):
        try:
            connection, device = self.server_sock.accept()
            print(f'Accepted new connection from {device}')
            connection.setblocking(False)
            self.sources.append(connection)
            readable.append(connection)
        except OSError as e:
            print('Error when accepting new connection: ', e)

    def _handle_existing_connection(self, s):
        buffer_size = 536
        data = b''
        try:
            l = s.recv(10)
            if l == b'':
                self._remove_connection(s)
                return
            try:
                l = int(l)
            except ValueError as e:
                print(f'Error converting length to int: {e}, received data: {l}')
                self._remove_connection(s)
                return

            while l > 0:
                try:
                    part = s.recv(min(l, buffer_size))
                    if not part:
                        break
                    data += part
                    l -= len(part)
                except OSError as e:
                    if e.errno == errno.EAGAIN or e.errno == errno.EWOULDBLOCK:
                        continue
                    else:
                        raise
        except OSError as e:
            print('Error when receiving data: ', e)
            self._remove_connection(s)
            return

        if data:
            response = Amot.attached(self).run({'DATA': data})
            response = response or {'DATA': b'0'}
            try:
                s.sendall(response['DATA'])
            except OSError as e:
                print('Error when sending data: ', e)
                self._remove_connection(s)
        else:
            self._remove_connection(s)

    def _remove_connection(self, s):
        if s in self.sources:
            self.sources.remove(s)
        s.close()

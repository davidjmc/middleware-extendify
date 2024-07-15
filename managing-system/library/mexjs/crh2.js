import * as net from 'net';

export default class ClientRequestHandler {
  async run(invData) {
    const data = invData['DATA'];
    const host = '192.168.0.9';
    let port = 60000;

    const socket = new net.Socket();

    try {
      await this.connect(socket, port, host);
    } catch (e) {
      console.error('Error: ' + e + " Couldn't connect with socket-server");
      return false;
    }

    try {
      await this.send(socket, data);
      const response = await this.receive(socket);
      socket.destroy();
      return response;
    } catch (e) {
      console.error('Error during send/receive: ' + e);
      socket.destroy();
      return false;
    }
  }

  connect(socket, port, host) {
    return new Promise((resolve, reject) => {
      socket.connect(port, host, () => {
        resolve();
      });
      socket.on('error', reject);
    });
  }

  send(socket, data) {
    return new Promise((resolve, reject) => {
      try {
        const l = Buffer.from(('0'.repeat(10) + data.length).slice(-10), 'ascii');
        //console.log('Sending length:', l.toString());
        //socket.write(l);
        //console.log('Sending data:', data.toString());
        socket.write(l + data, (err) => {
          if (err) {
            reject("Couldn't send data in CRH");
          } else {
            resolve();
          }
        });
      } catch (e) {
        reject("Couldn't send data in CRH: " + e);
      }
    });
  }

  receive(socket) {
    return new Promise((resolve, reject) => {
      const buffer_size = 536;
      let response = Buffer.alloc(0);

      socket.on('data', (chunk) => {
        console.log('Received chunk:', chunk.toString());
        response = Buffer.concat([response, chunk]);
        if (chunk.length < buffer_size) {
          if (response.equals(Buffer.from('0'))) {
            resolve(true);
          } else if (response.length === 0) {
            resolve(false);
          } else {
            resolve({ DATA: response });
          }
        }
      });

      socket.on('end', () => {
        if (response.length === 0) {
          resolve(false);
        }
      });

      socket.on('error', (err) => {
        reject("Couldn't receive data in CRH: " + err);
      });
    });
  }
}

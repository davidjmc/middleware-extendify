import { Injectable } from '@nestjs/common';
import { QueueProxy } from './mexjs/proxy';

@Injectable()
export class MexService {
  async subcribe(topic: string, callback: (message: string) => void) {
    // console.log('TOPIC ', topic)
    console.log('Connecting to mex broker...');
    const proxy = new QueueProxy();
    proxy.subscribe(topic);
    // Teste checando uma mensagem para o servidor a cada 3 segundos
    setInterval(() => {
      // Checar mensagens
      // console.log('Checking message from water-level');
      // proxy.checkMessage('d4:6a:6a:fe:23:df').then((result) => {
      //   // Verificando se os campos de result não são vazios
      //   if (result && Object.keys(result).length > 0) {
      //     // Convertendo o resultado para string JSON e chamando o callback
      //     callback(JSON.stringify(result));
      //   }
      // }).catch((error) => {
      //   // Tratando erros na verificação de mensagens
      //   console.error('Error checking message:', error);
      // });
      proxy.checkMessage('d4:6a:6a:fe:23:df').then((result) => {
        //console.log(result)
        callback(JSON.stringify(result));
      });
    }, 2000);
  }
}

import { Logger } from '@nestjs/common';
import { QueueProxy } from './proxy';

const proxy = new QueueProxy();

//proxy.subscribe('water-level');

// Teste checando uma mensagem para o servidor a cada 3 segundos
setInterval(() => {
  // Checar mensagens
  console.log('Checking message from 1-new');
  proxy.checkMessage('d4:6a:6a:fe:23:df').then((result) => {
    Logger.log(result);
  });
}, 3000);

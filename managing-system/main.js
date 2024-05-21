import net from 'net';

const self_port = 60010

// load classes
import Request from './classes/Request.js';
//const Response = require('./classes/Response')
import ThingController from './classes/ThingController.js';

// (async () => {
//     // let request = new Request('START\nThing:1')
//     let request = new Request('ADAPT\nThing:1')
//     let response = await ThingController.getResponseFor(request)
//     console.log(response.toString())
//     process.exit()
// })()

// process.exit()

const server = new net.Server()
server.listen(self_port, '0.0.0.0', 5, () => {
    console.log(`listening on ${self_port}`)
})


server.on('connection', socket => {
    console.log('connected')

    socket.on('data', async data => {
        console.log(`data received: ${data}`)
        console.log(new Date())

        console.log('REQUEST: ' + data.toString('ascii'))
        let request = new Request(data.toString('ascii'))
        let response = await ThingController.getResponseFor(request)

        socket.write(response.toString())
        socket.destroy()

    })
})

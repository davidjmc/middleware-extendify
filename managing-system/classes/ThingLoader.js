// const Thing = require('./Thing')
import Thing from './Thing.js';

export default class ThingLoader {
    static async load(thingId) {
        if (thingId === false) {
            // thing cant be loaded
            return new Response('0')
        }
        try {
            return await Thing.load(thingId)
        } catch (e) {
            console.dir(e)
        }
    }
}

// module.exports = ThingLoader
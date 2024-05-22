import EvolutiveAdapter from './EvolutiveAdapter.js';
import ParametricAdapter from './ParametricAdapter.js';
import BODSCAdapter from './BODSCAdapter.js';
import BAFCMAdapter from './BAFCMAdapter.js';

export default class AdapterFactory {
    static for(thing, type) {
        if (type == 'evolutive') {
            return new EvolutiveAdapter(thing)
        }
        if (type == 'dcam') {
            return new ParametricAdapter(thing)
        }
        if (type == 'bodsc') {
            return new BODSCAdapter(thing)
        }
        if (type == 'bafcm') {
            return new BAFCMAdapter(thing)
        }       
        return null
    }
}

//module.exports = AdapterFactory
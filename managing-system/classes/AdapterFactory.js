import EvolutiveAdapter from './EvolutiveAdapter.js';
import ParametricAdapter from './ParametricAdapter.js';
import PIAdapter from './PIAdapter.js';

export default class AdapterFactory {
    static for(thing, type) {
        if (type == 'evolutive') {
            return new EvolutiveAdapter(thing)
        }
        if (type == 'parametric') {
            return new ParametricAdapter(thing)
        }
        if (type == 'piadapter') {
            return new PIAdapter(thing)
        }      
        return null
    }
}

//module.exports = AdapterFactory
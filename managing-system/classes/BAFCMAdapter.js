import Adapter from './Adapter.js'
import Adaptation from './Adaptation.js';
import axios from 'axios';

export default class BAFCMAdapter extends Adapter {
    constructor(thing) {
        super(thing)
        // Armazenar o erro acumulado (integral) entre as chamadas
        this.maxDeepSleep = 60;
        this.minDeepSleep = 5;        
    }

    async adaptFor(request) {
        let variables = await this.monitor(request)
        //console.log(variables)
    
        let changes = await this.analyzer(variables)
        //console.log(changes)

        let adaptation = this.planner(changes)
        return adaptation
    }

    // return variables used in condition from request
    // TODO - be generic
    async monitor(request) {
        try {
            const res = await axios.get(`http://localhost:3001/devices/battery/d4:6a:6a:fe:23:df`);
            //console.log(res.data);     
            return res.data;
        } catch (error) {
            console.error("Error:", error);
            // Lançar novamente o erro para que o chamador possa lidar com ele
            throw error;
        }

    }

    // return the "command" for the correct condition based on variables
    // TODO - be generic
    async analyzer(variables) {
        const setpoint = 1
        
        const feedback = parseFloat(variables.after) - parseFloat(variables.before);
        console.log("Feedback: ", feedback)
    
        // Saída do controlador (sinal de controle)
        let controlSignal = this.controllerFuzzy(setpoint, feedback);
        console.log("controlSignal: ", controlSignal)
    
        let deepsleep = parseInt(Math.max(this.minDeepSleep, Math.min(this.maxDeepSleep, controlSignal)));
        console.log("deepsleep: ", deepsleep)
    
        return {
            loop_interval: deepsleep
        }
    }
    

    planner(changes) {

        let adaptation = new Adaptation()
        //console.log(adaptation)
        adaptation.configurations = changes

        return adaptation
    }

    controllerFuzzy(goal, feedback) {

        const e = goal - feedback;
        console.log("error = ", e)
        const fuzzyError = this.fuzzyInput(e);
        console.log("fuzzy error = ", fuzzyError)

        const output = this.applyRules(fuzzyError);
        console.log("output = ", output)

        const result = this.deffuzification(output);
        console.log("result = ", result)

        return result;
    }

    fuzzyInput(e) {
        const fuzzyError = {
            //extremelyNegative: this.gaussmf(e, -3, 1.5), // Mais negativo, mais próximo da meta
            largeNegative: this.gaussmf(e, -2, 1), // Menos negativo, menos próximo da meta
            zero: this.gaussmf(e, 0, 1), // Próximo da meta
            largePositive: this.gaussmf(e, 2, 1), // Menos positivo, menos próximo da meta
            //extremelyPositive: this.gaussmf(e, 3, 1.5) // Mais positivo, mais distante da meta
        };
        return fuzzyError;
    }

    gaussmf(x, mean, sigma) {
        return Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(sigma, 2)));
    }

    applyRules(e) {
        const output = {
            decrease: 0, // Diminuir o deep sleep
            maintain: 0, // Manter o deep sleep
            increase: 0 // Aumentar o deep sleep
        };
    
        // Regra 1: IF e = ZERO THEN output = MAINTAIN
        output.maintain = e.zero;
    
        // Regra 2: IF e = LARGENEGATIVE THEN output = INCREASE
        output.increase = Math.max(output.increase, e.largeNegative);
    
        // Regra 3: IF e = LARGEPOSITIVE THEN output = DECREASE
        output.decrease = e.largePositive;
    
        // Regra 4: IF e = EXTREMELYNEGATIVE THEN output = INCREASE
        // output.increase = e.extremelyNegative;
    
        // Regra 5: IF e = EXTREMELYPOSITIVE THEN output = DECREASE
        // output.decrease = Math.max(output.decrease, e.extremelyPositive);
    
        return output;
    }

    deffuzification(output) {
        const weights = {
            decrease: 60,
            maintain: 10,
            increase: 60
        };
    
        let numerator = 0;
        let denominator = 0;
    
        for (const key in output) {
            numerator += output[key] * weights[key];
            denominator += output[key];
        }
    
        if (denominator === 0) {
            return 0; // Evitar divisão por zero
        }

        return numerator / denominator;
    } 
}

//module.exports = DCBatteryAdapter
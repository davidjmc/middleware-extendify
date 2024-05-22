import Adapter from './Adapter.js'
import Adaptation from './Adaptation.js';
import axios from 'axios';

export default class BODSCAdapter extends Adapter {
    constructor(thing) {
        super(thing)
        // Armazenar o erro acumulado (integral) entre as chamadas
        this.integralError = 0;
        this.setpoint = 1;
        this.minDeepSleep = 5;
        this.maxDeepSleep = 60;
        
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
        // Parâmetros do controlador PI (ajuste conforme necessário)
        const kp = 10; // Ganho proporcional
        const ki = 2; // Ganho integral
        // const setpoint = 1; // Valor desejado (setpoint)

        //console.log(variables)
    
        // Valor atual do processo (feedback)
        const feedback = parseFloat(variables.after) - parseFloat(variables.before);
        console.log("Feedback: ", feedback)
    
        // Erro atual (diferença entre o setpoint e o feedback)
        const error = this.setpoint - feedback;
        console.log("Error: ", error)
    
        // Cálculo do termo proporcional
        const proportionalTerm = kp * error;
    
        // Atualizar o erro acumulado
        this.integralError += error;
        // Cálculo do termo integral
        const integralTerm = ki * this.integralError;
    
        // Saída do controlador (sinal de controle)
        let controlSignal = proportionalTerm + integralTerm;
        console.log("controlSignal: ", controlSignal)
    
        // Resto do código
        // Pode ser necessário limitar o sinal de controle ou fazer outras manipulações antes de retorná-lo
        //const minDeepSleep = 5; // minutos
        //const maxDeepSleep = 60; // minutos
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
}

//module.exports = DCBatteryAdapter
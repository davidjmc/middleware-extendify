import Adapter from './Adapter.js'
import Adaptation from './Adaptation.js';

export default class FeedbackAdapter extends Adapter {
    constructor(thing) {
        super(thing)
        // Armazenar o erro acumulado (integral) entre as chamadas        
    }

    async adaptFor(request) {
        let variables = await this.monitor(request)

        console.log('variaveis = ', variables)

        let changes = await this.analyzer(variables)
        
        let adaptation = this.planner(changes)
        return adaptation
    }

    // return variables used in condition from request
    // TODO - be generic
    async monitor(request) {
        const timestamp = request.headers['timestamp']
        const dateTimeISO = timestamp.replace(/\./g, ":");
        return dateTimeISO
    }

    // return the "command" for the correct condition based on variables
    // TODO - be generic
    async analyzer(request) {
        const dataHora = new Date(request);
        const horas = dataHora.getUTCHours();

        if (horas >= 0 && horas < 8) {
            let deep_sleep = 60 * 60; // 30 minutos em segundos
            return {
                loop_interval: deep_sleep
            }
        } else if (horas >= 8 && horas < 13) {
            let deep_sleep =  30 * 60; // 15 minutos em segundos
            return {
                loop_interval: deep_sleep
            }
        } else if (horas >= 13 && horas <= 23) {
            let deep_sleep = 60; // 60 segundos
            return {
                loop_interval: deep_sleep
            }
        } else {
            // Caso a hora não se encaixe em nenhuma das faixas
            return null;
        }
    }
        // Valor atual do processo (feedback)
        //const feedback = parseFloat(variables.after) - parseFloat(variables.before);
        //console.log("Feedback: ", feedback)
    
        // Erro atual (diferença entre o setpoint e o feedback)
        //const error = this.setpoint - feedback;
        //console.log("Error: ", error)
    
        // Cálculo do termo proporcional
        //const proportionalTerm = kp * error;
    
        // Atualizar o erro acumulado
        //this.integralError += error;
        // Cálculo do termo integral
        //const integralTerm = ki * this.integralError;
    
        // Saída do controlador (sinal de controle)
        //let controlSignal = proportionalTerm + integralTerm;
        //console.log("controlSignal: ", controlSignal)
    
        // Resto do código
        // Pode ser necessário limitar o sinal de controle ou fazer outras manipulações antes de retorná-lo
        //const minDeepSleep = 5; // minutos
        //const maxDeepSleep = 60; // minutos
        //let deepsleep = parseInt(Math.max(this.minDeepSleep, Math.min(this.maxDeepSleep, controlSignal)));
        //console.log("deepsleep: ", deepsleep)
    
        //return {
            //loop_interval: deepsleep
        //}

    planner(changes) {

        let adaptation = new Adaptation()
        //console.log(adaptation)
        adaptation.configurations = changes

        return adaptation
    }
}

//module.exports = DCBatteryAdapter
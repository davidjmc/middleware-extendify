import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { MexService } from '../../mex/mex.service';
import { MqttService } from '../../mqtt/mqtt.service';
import { CreateUpdateDeviceDTO } from '../controller/device.controller';
import { DeviceHistory } from '../entity/device-history.entity';
import { Device } from '../entity/device.entity';
import { DeviceHistoryService } from './device-history.service';

interface AggregatedDeviceHistory {
  date: string;
  volume: number;
  battery: number;
}

interface DeviceWithAggregatedHistory extends Device {
  aggregatedHistory: AggregatedDeviceHistory[];
  remainingDays: number;
  dailyConsumption: number;
}

// Função auxiliar para formatar a data no formato 'DD/MM/YY'
function formatDate(dateString: string): string {
  const date = DateTime.fromISO(dateString);
  return date.toFormat('dd/LL/yy');
}

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    private readonly mqttService: MqttService,
    private readonly mexService: MexService,
    private readonly deviceHistoryService: DeviceHistoryService,
  ) {
    // TODO - Subscribe to MQTT topic of each one devices
    this.findAll().then((res) =>
      res.forEach((device) => {
        this.subscribeMex(device);
        //this.subscribeMqtt(device);
        //this.getBatteryVariation('00:1B:44:11:3A:B7');
      }),
    );
  }

  async create(dto: CreateUpdateDeviceDTO): Promise<Device> {
    await this.verifyMac(dto.mac);

    const newDevice = await this.deviceRepository.save({ ...dto });

    this.subscribeMqtt(newDevice);

    return newDevice;
  }

  async update(dto: CreateUpdateDeviceDTO, id: string) {
    const oldDevice = await this.deviceRepository.findOneOrFail({
      where: { id },
    });

    if (oldDevice.mac !== dto.mac) {
      await this.verifyMac(dto.mac);
      await this.deviceRepository.update(id, dto);
      const updateddevice = await this.findOne(id);
      this.unsubscribeMqtt(oldDevice);
      this.subscribeMqtt(updateddevice);
    } else {
      await this.deviceRepository.update(id, dto);
    }
  }

  async delete(id: string): Promise<void> {
    const device = await this.deviceRepository.findOneOrFail({
      where: { id },
    });

    await this.deviceRepository.delete(id);

    this.unsubscribeMqtt(device);
  }

  async findByMac(mac: string): Promise<Device> {
    return await this.deviceRepository.findOne({ where: { mac } });
  }

  async findAll(): Promise<Device[]> {
    const devices = await this.deviceRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.devicesHistory', 'history')
      .orderBy('history.timestamp', 'ASC')
      .getMany();

    return devices.map((device) => this.mapDeviceToAggregatedHistory(device));
  }

  async findOne(id: string): Promise<Device> {
    return this.deviceRepository.findOne({
      where: { id },
      relations: ['devicesHistory'],
    });
  }

  async verifyMac(mac: string): Promise<void> {
    const deviceAlreadyExists = await this.findByMac(mac);

    if (deviceAlreadyExists) {
      throw new ConflictException('Device already exists');
    }
  }

  async createHistory(
    dto: { distance: number; battery: number; timestamp: Date },
    deviceMac: string,
  ) {
    const device = await this.findByMac(deviceMac);

    const currentVolume = this.calcCurrentVolume(dto.distance, device);

    const currentPercentage = (
      (currentVolume * 100) /
      device.maxCapacity
    ).toFixed(2);

    Logger.log(
      `Receiving update from ${device.mac} - currentVolume: ${currentVolume} - currentPercentage: ${currentPercentage}`,
    );

    this.deviceHistoryService.create({
      water: Number(currentVolume),
      battery: Number(dto.battery),
      timestamp: new Date(dto.timestamp),
      device,
    });
    this.deviceRepository.update(device.id, {
      percentage: Number(currentPercentage),
      battery: Number(dto.battery),
      water: Number(currentVolume),
    });
  }

  async getBatteryVariation(mac: string) {
    const device = await this.deviceRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.devicesHistory', 'history')
      .where('device.mac = :mac', { mac })
      .orderBy('history.timestamp', 'DESC')
      .limit(2)
      .getOne();

    const t = {
      before: device?.devicesHistory[1]?.battery || null,
      after: device?.devicesHistory[0]?.battery || null,
    };

    // console.log(t);
    return t;
  }

  calcCurrentVolume(distance: number, device: Device): number {
    const { height, baseRadius } = device;
    const errorConsidered = 1.59794;

    //console.log("Device's distance: ", distance, "Real distance: ", )

    const realDistance = distance - errorConsidered;

    //console.log("Distance real na regua = ",realDistance)

    console.log("Device's distance: ", distance, "Real distance: ", realDistance)

    // const currentHeight = height - distance / 100;

    const reservourDistance = realDistance * 0.0112

    const RADIUS = 1.6821; // meters
    const MAX_HEIGHT = 1.80;

    // console.log("Distance converted = ", reservourDistance)

    const reservourHeight = 1.8 - (reservourDistance / 100);

    // console.log("currentHeight = ", reservourHeight)

    //const currentVolume = Math.PI * Math.pow(baseRadius, 2) * currentHeight;
    const currentVolume = Math.PI * Math.pow(RADIUS, 2) * reservourHeight;

    // console.log(currentVolume)

    return Number((currentVolume * 1000).toFixed(2));
  }

  mapping(v: number, in_min: number, in_max: number, out_min: number, out_max: number) {
    const result = Math.round((v - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
    return result;
  }
  
  calcPercentBattery(voltage: number) {
    // Fator de ajuste para a relação entre as resistências do divisor de tensão
    const ratioFactor = 1.27;
    // console.log("Voltage = ", voltage)

    const vinMin = 2.8;
    const vinMax = 4.2;

    // console.log("voltage = ", voltage)

    // Convert Voltage in 3.3v factor
    const rVoltage = (voltage / 1024.0) * 3.3;
    // console.log("rVoltage = ", rVoltage)

    const fVoltage = rVoltage * ratioFactor;
    // console.log("fVoltage = ", fVoltage)

    // Limitar a voltagem medida aos limites dados
    const measureVoltage = this.mapping(fVoltage, vinMin, vinMax, 0, 100);
    // console.log("measureVoltage = ", measureVoltage)

    // Calcular a diferença total
    //const totalDiff = vinMax - vinMin;

    // Calcular o percentual usando a fórmula de interpolação linear
    // let percent = (measureVoltage * 100) / vinMax;
    //let percent = ((measureVoltage - vinMin) / totalDiff) * 100
    //console.log("percent = ", percent)

    // Garantir que o percentual está dentro do intervalo [0, 100]
    //let result = Math.min(Math.max(percent, 0.0), 100.0);
    //console.log("percent after= ", result)

    return measureVoltage;
  }

  mapDeviceToAggregatedHistory(device: Device): DeviceWithAggregatedHistory {
    const aggregatedHistory: AggregatedDeviceHistory[] = [];

    // Agrupa o histórico por dia
    const groupedHistory = device.devicesHistory.reduce((acc, history) => {
      const date = DateTime.fromJSDate(history.timestamp).toISODate(); // Obtém a data em formato 'YYYY-MM-DD'
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(history);
      return acc;
    }, {} as { [date: string]: DeviceHistory[] });

    let dailyConsumption = 0;

    // Calcula o volume máximo de água e nível de bateria por dia
    for (const date in groupedHistory) {
      
      const historyList = groupedHistory[date];

      const formattedDate = formatDate(date);

      aggregatedHistory.push({
        date: formattedDate,
        volume: historyList[historyList.length - 1].water,
        battery: historyList[historyList.length - 1].battery,
      });

      if (formattedDate === DateTime.now().toFormat('dd/LL/yy')) {
        for (let i = 1; i < historyList.length; i++) {
          const previousWaterLevel = parseFloat(
            historyList[i-1].water.toString(),
          );
          const currentWaterLevel = parseFloat(historyList[i].water.toString());

          if (currentWaterLevel < previousWaterLevel) {
            dailyConsumption += previousWaterLevel - currentWaterLevel;
          }
        }
      }
    }

    const remainingDays = () => {
      // Verifica se o consumo diário é válido
      if (device.water <= 0) {
        return 0;
      }
      // Calcula o número de dias restantes
      return Math.floor(device.water / 100);
    };

    const deviceWithAggregatedHistory: DeviceWithAggregatedHistory = {
      ...device,
      aggregatedHistory,
      remainingDays: remainingDays(),
      dailyConsumption: +dailyConsumption.toFixed(2),
    };

    return deviceWithAggregatedHistory;
  }

  subscribeMqtt(device: Device): void {
    Logger.log(`Subscribing to ${device.mac}`);
    this.mqttService.subscribe(device.mac, (msg) => {
      const dto = JSON.parse(msg);

      const currentVolume = this.calcCurrentVolume(dto.distance, device);

      const currentBattery = this.calcPercentBattery(dto.voltage);

      const currentPercentage = (currentVolume * 100) / device.maxCapacity;

      // Logger.log(
      //   `Receiving update from ${device.mac} - currentVolume: ${currentVolume} - currentPercentage: ${currentPercentage}`,
      // );

      this.deviceHistoryService.create({
        water: Number(currentVolume),
        battery: Number(currentBattery),
        timestamp: new Date(dto.timestamp * 1000),
        device,
      });
      this.deviceRepository.update(device.id, {
        percentage: Number(currentPercentage),
        battery: Number(currentBattery),
        water: Number(currentVolume),
      });
    });
  }

  unsubscribeMqtt(device: Device): void {
    Logger.log(`Unsubscribing to ${device.mac}`);
    this.mqttService.unsubscribe(device.mac);
  }

  async subscribeMex(device: Device): Promise<void> {
    this.mexService.subcribe(device.mac, (msg) => {
      const dto = JSON.parse(msg);

      console.log(dto);

      if (dto.MSG) {
        const string = JSON.stringify(dto).replace(/'(\{.*?\})'/g, '"$1"');

        const json = JSON.parse(string);

        const MSG = json.MSG;

        const MSGstring = MSG.replace(/'(\{.*?\})'/g, '"$1"');

        const waterLevel = JSON.parse(JSON.stringify(MSGstring));

        // Substituir as aspas simples por aspas duplas para obter um formato JSON válido
        const jsonCorrigido = waterLevel.replace(/'/g, '"');

        // Analisar a string JSON para obter um objeto
        const objeto = JSON.parse(jsonCorrigido);

        const msg = objeto['d4:6a:6a:fe:23:df'];

        if (msg) {
          const currentVolume = this.calcCurrentVolume(msg.distance, device);
          console.log("Aqui: ", msg.distance)
          // const currentBattery = this.calcPercentBattery(4.2);
          // const currentBattery = msg.battery;
          const currentBattery = this.calcPercentBattery(msg.battery).toFixed(0);

          const timestamp = new Date(msg.timer);

          const currentPercentage = (
            (currentVolume * 100) /
            device.maxCapacity
          ).toFixed(2);

          // Logger.log(
          //   `Receiving update from ${device.mac} - currentVolume: ${currentVolume} - currentPercentage: ${currentPercentage} - currentBattery: ${currentBattery}`,
          // );

          this.deviceHistoryService.create({
            water: Number(currentVolume),
            battery: Number(currentBattery),
            timestamp,
            device,
          });
          this.deviceRepository.update(device.id, {
            percentage: Number(currentPercentage),
            battery: Number(currentBattery),
            water: Number(currentVolume),
          });
        }
      }
    });
  }
}

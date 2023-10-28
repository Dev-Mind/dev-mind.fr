export type WindowStatus = 'OPENED' | 'CLOSED' | undefined;
export type HeaterStatus = 'ON' | 'OFF' | undefined;

export interface Windows {
  id: number,
  roomId: number,
  roomName: string,
  name: string,
  status: WindowStatus
}

export interface Heater {
  id: number,
  roomId: number,
  roomName: string,
  name: string,
  status: HeaterStatus
}

export interface Room {
  id: number,
  name: string,
  type: string,
  floor: number,
  currentTemperature?: number,
  targetTemperature?: number,
  windows: Array<Windows>,
  heaters: Array<Heater>,
}

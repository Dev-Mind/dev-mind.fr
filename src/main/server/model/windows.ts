export type Status = 'OPEN' | 'CLOSED' | undefined;

export interface Room {
  id: number,
  name: String,
  type: String,
  level: number,
  currentTemperature?: number,
  targetTemperature?: number
}

export interface Windows {
  id: number,
  room: Room,
  name: String,
  status: Status
}

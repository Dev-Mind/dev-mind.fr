import {Request, Response} from 'express';
import {BaseRoute} from './base.route';
import {Router} from 'express-serve-static-core';
import {Room} from '../model/windows';

const ROOMS: Array<Room> = [
  {
    'id': 1,
    'name': 'Hall',
    'type': 'Reception',
    'floor': 0,
    'currentTemperature': undefined,
    'targetTemperature': undefined,
    'heaters': [
      {
        'id': 1,
        'name': 'Heater 1',
        'status': 'OFF',
        'roomId': 1,
        'roomName': 'Hall'
      },
      {
        'id': 2,
        'name': 'Heater 2',
        'status': 'OFF',
        'roomId': 1,
        'roomName': 'Hall'
      }
    ],
    'windows': [
      {
        'id': 1,
        'name': 'Fixed window 1',
        'status': 'CLOSED',

        'roomId': 1,
        'roomName': 'Hall'
      },
      {
        'id': 2,
        'name': 'Sliding window 2',
        'status': 'OPENED',
        'roomId': 1,
        'roomName': 'Hall'
      },
      {
        'id': 3,
        'name': 'Sliding window 3',
        'status': 'OPENED',
        'roomId': 1,
        'roomName': 'Hall'
      }
    ]
  },
  {
    'id': 2,
    'name': 'Amphi A',
    'type': 'Amphitheater',
    'floor': 0,
    'currentTemperature': 22.3,
    'targetTemperature': 20,
    'heaters': [
      {
        'id': 3,
        'name': 'Heater 1',
        'status': 'OFF',
        'roomId': 2,
        'roomName': 'Amphi A'
      },
      {
        'id': 4,
        'name': 'Heater 2',
        'status': 'OFF',
        'roomId': 2,
        'roomName': 'Amphi A'
      }
    ],
    'windows': [
      {
        'id': 4,
        'name': 'Sliding window 1',
        'status': 'CLOSED',
        'roomId': 2,
        'roomName': 'Amphi A'
      },
      {
        'id': 5,
        'name': 'Sliding window 2',
        'status': 'OPENED',
        'roomId': 2,
        'roomName': 'Amphi A'
      },
      {
        'id': 6,
        'name': 'Sliding window 3',
        'status': 'CLOSED',
        'roomId': 2,
        'roomName': 'Amphi A'
      },
      {
        'id': 7,
        'name': 'Sliding window 4',
        'status': 'OPENED',
        'roomId': 2,
        'roomName': 'Amphi A'
      },
      {
        'id': 8,
        'name': 'Sliding window 5',
        'status': 'OPENED',
        'roomId': 2,
        'roomName': 'Amphi A'
      },
    ]
  },
  {
    'id': 3,
    'name': 'Amphi B',
    'type': 'Amphitheater',
    'floor': 1,
    'currentTemperature': 24.6,
    'targetTemperature': 20,
    'heaters': [
      {
        'id': 5,
        'name': 'Heater 1',
        'status': 'OFF',
        'roomId': 3,
        'roomName': 'Amphi B'
      },
      {
        'id': 6,
        'name': 'Heater 2',
        'status': 'OFF',
        'roomId': 3,
        'roomName': 'Amphi B'
      }
    ],
    'windows': [
      {
        'id': 9,
        'name': 'Fixed window 1',
        'status': 'CLOSED',
        'roomId': 3,
        'roomName': 'Amphi B'
      },
      {
        'id': 10,
        'name': 'Sliding window 2',
        'status': 'CLOSED',
        'roomId': 3,
        'roomName': 'Amphi B'
      },
      {
        'id': 11,
        'name': 'Sliding window 3',
        'status': 'CLOSED',
        'roomId': 3,
        'roomName': 'Amphi B'
      },
      {
        'id': 12,
        'name': 'Sliding window 4',
        'status': 'OPENED',
        'roomId': 3,
        'roomName': 'Amphi B'
      },
      {
        'id': 13,
        'name': 'Fixed window 5',
        'status': 'CLOSED',
        'roomId': 3,
        'roomName': 'Amphi B'
      },
    ]
  },
  {
    'id': 4,
    'name': 'Amphi C',
    'type': 'Amphitheater',
    'floor': 2,
    'currentTemperature': 18.3,
    'targetTemperature': 20,
    'heaters': [
      {
        'id': 7,
        'name': 'Heater 1',
        'status': 'OFF',
        'roomId': 4,
        'roomName': 'Amphi C'
      },
      {
        'id': 8,
        'name': 'Heater 2',
        'status': 'OFF',
        'roomId': 4,
        'roomName': 'Amphi C'
      }
    ],
    'windows': [
      {
        'id': 14,
        'name': 'Fixed window 1',
        'status': 'CLOSED',
        'roomId': 4,
        'roomName': 'Amphi C'
      },
      {
        'id': 15,
        'name': 'Fixed window 2',
        'status': 'CLOSED',
        'roomId': 4,
        'roomName': 'Amphi C'
      },
      {
        'id': 16,
        'name': 'Sliding window 3',
        'status': 'CLOSED',
        'roomId': 4,
        'roomName': 'Amphi C'
      },
      {
        'id': 17,
        'name': 'Sliding window 4',
        'status': 'CLOSED',
        'roomId': 4,
        'roomName': 'Amphi C'
      },
      {
        'id': 18,
        'name': 'Sliding window 5',
        'status': 'CLOSED',
        'roomId': 4,
        'roomName': 'Amphi C'
      },
    ]
  },
  {
    'id': 5,
    'name': 'Amphi D',
    'type': 'Amphitheater',
    'floor': 1,
    'currentTemperature': 19.6,
    'targetTemperature': 20,
    'heaters': [
      {
        'id': 9,
        'name': 'Heater 1',
        'status': 'OFF',
        'roomId': 5,
        'roomName': 'Amphi D'
      },
      {
        'id': 10,
        'name': 'Heater 2',
        'status': 'OFF',
        'roomId': 5,
        'roomName': 'Amphi D'
      }
    ],
    'windows': [
      {
        'id': 19,
        'name': 'Fixed window 1',
        'status': 'CLOSED',
        'roomId': 5,
        'roomName': 'Amphi D'
      },
      {
        'id': 20,
        'name': 'Fixed window 2',
        'status': 'CLOSED',
        'roomId': 5,
        'roomName': 'Amphi D'
      },
      {
        'id': 21,
        'name': 'Sliding window 3',
        'status': 'CLOSED',
        'roomId': 5,
        'roomName': 'Amphi D'
      },
      {
        'id': 22,
        'name': 'Sliding window 4',
        'status': 'OPENED',
        'roomId': 5,
        'roomName': 'Amphi D'
      },
      {
        'id': 23,
        'name': 'Sliding window 5',
        'status': 'CLOSED',
        'roomId': 5,
        'roomName': 'Amphi D'
      },
    ]
  },
  {
    'id': 6,
    'name': 'Amphi E',
    'type': 'Amphitheater',
    'floor': 2,
    'currentTemperature': 21.4,
    'targetTemperature': 20,
    'heaters': [
      {
        'id': 11,
        'name': 'Heater 1',
        'status': 'OFF',
        'roomId': 6,
        'roomName': 'Amphi E'
      },
      {
        'id': 12,
        'name': 'Heater 2',
        'status': 'OFF',
        'roomId': 6,
        'roomName': 'Amphi E'
      }
    ],
    'windows': [
      {
        'id': 24,
        'name': 'Sliding window 1',
        'status': 'CLOSED',
        'roomId': 6,
        'roomName': 'Amphi E'
      },
      {
        'id': 25,
        'name': 'Fixed window 2',
        'status': 'CLOSED',
        'roomId': 6,
        'roomName': 'Amphi E'
      },
      {
        'id': 26,
        'name': 'Fixed window 3',
        'status': 'CLOSED',
        'roomId': 6,
        'roomName': 'Amphi E'
      },
      {
        'id': 27,
        'name': 'Sliding window 4',
        'status': 'CLOSED',
        'roomId': 6,
        'roomName': 'Amphi E'
      },
      {
        'id': 28,
        'name': 'Sliding window 5',
        'status': 'CLOSED',
        'roomId': 6,
        'roomName': 'Amphi E'
      },
    ]
  },
  {
    'id': 7,
    'name': 'Amphi F',
    'type': 'Amphitheater',
    'floor': 0,
    'currentTemperature': 20.3,
    'targetTemperature': 20,
    'heaters': [
      {
        'id': 13,
        'name': 'Heater 1',
        'status': 'OFF',
        'roomId': 7,
        'roomName': 'Amphi F'
      },
      {
        'id': 14,
        'name': 'Heater 2',
        'status': 'OFF',
        'roomId': 7,
        'roomName': 'Amphi F'
      }
    ],
    'windows': [
      {
        'id': 29,
        'name': 'Sliding window 1',
        'status': 'CLOSED',
        'roomId': 7,
        'roomName': 'Amphi F'
      },
      {
        'id': 30,
        'name': 'Fixed window 2',
        'status': 'CLOSED',
        'roomId': 7,
        'roomName': 'Amphi F'
      },
      {
        'id': 31,
        'name': 'Sliding window 3',
        'status': 'CLOSED',
        'roomId': 7,
        'roomName': 'Amphi F'
      },
      {
        'id': 32,
        'name': 'Sliding window 4',
        'status': 'OPENED',
        'roomId': 7,
        'roomName': 'Amphi F'
      },
      {
        'id': 33,
        'name': 'Fixed window 5',
        'status': 'CLOSED',
        'roomId': 7,
        'roomName': 'Amphi F'
      }
    ]
  },
  {
    'id': 8,
    'name': 'Amphi G',
    'type': 'Amphitheater',
    'floor': 0,
    'currentTemperature': 16.7,
    'targetTemperature': 20,
    'heaters': [
      {
        'id': 15,
        'name': 'Heater 1',
        'status': 'OFF',
        'roomId': 8,
        'roomName': 'Amphi G'
      },
      {
        'id': 16,
        'name': 'Heater 2',
        'status': 'OFF',
        'roomId': 8,
        'roomName': 'Amphi G'
      }
    ],
    'windows': [
      {
        'id': 34,
        'name': 'Sliding window 1',
        'status': 'CLOSED',
        'roomId': 8,
        'roomName': 'Amphi G'
      },
      {
        'id': 35,
        'name': 'Sliding window 2',
        'status': 'CLOSED',
        'roomId': 8,
        'roomName': 'Amphi G'
      },
      {
        'id': 36,
        'name': 'Sliding window 3',
        'status': 'CLOSED',
        'roomId': 8,
        'roomName': 'Amphi G'
      },
      {
        'id': 37,
        'name': 'Sliding window 4',
        'status': 'CLOSED',
        'roomId': 8,
        'roomName': 'Amphi G'
      },
      {
        'id': 38,
        'name': 'Fixed window 5',
        'status': 'CLOSED',
        'roomId': 8,
        'roomName': 'Amphi G'
      }
    ]
  },
  {
    'id': 9,
    'name': 'Amphi H',
    'type': 'Amphitheater',
    'floor': 2,
    'currentTemperature': 19.8,
    'targetTemperature': 20,
    'heaters': [
      {
      'id': 17,
      'name': 'Heater 1',
      'status': 'OFF',
      'roomId': 9,
      'roomName': 'Amphi H'
    },
      {
        'id': 18,
        'name': 'Heater 2',
        'status': 'OFF',
        'roomId': 9,
        'roomName': 'Amphi H'
      }],
    'windows': [
      {
        'id': 39,
        'name': 'Sliding window 1',
        'status': 'CLOSED',
        'roomId': 9,
        'roomName': 'Amphi H'
      },
      {
        'id': 40,
        'name': 'Sliding window 2',
        'status': 'OPENED',
        'roomId': 9,
        'roomName': 'Amphi H'
      },
      {
        'id': 41,
        'name': 'Sliding window 3',
        'status': 'CLOSED',
        'roomId': 9,
        'roomName': 'Amphi H'
      },
      {
        'id': 42,
        'name': 'Fixed window 4',
        'status': 'CLOSED',
        'roomId': 9,
        'roomName': 'Amphi H'
      },
      {
        'id': 43,
        'name': 'Sliding window 5',
        'status': 'CLOSED',
        'roomId': 9,
        'roomName': 'Amphi H'
      },
    ]
  },
  {
    'id': 10,
    'name': 'Library',
    'type': 'Library',
    'floor': 0,
    'currentTemperature': 21.8,
    'targetTemperature': 20,
    'heaters': [
      {
        'id': 19,
        'name': 'Heater 1',
        'status': 'OFF',
        'roomId': 10,
        'roomName': 'Library'
      },
      {
        'id': 20,
        'name': 'Heater 2',
        'status': 'OFF',
        'roomId': 10,
        'roomName': 'Library'
      }
    ],
    'windows': [
      {
        'id': 39,
        'name': 'Sliding window 1',
        'status': 'CLOSED',
        'roomId': 10,
        'roomName': 'Library'
      },
      {
        'id': 40,
        'name': 'Sliding window 2',
        'status': 'OPENED',
        'roomId': 10,
        'roomName': 'Library'
      },
      {
        'id': 41,
        'name': 'Sliding window 3',
        'status': 'CLOSED',
        'roomId': 10,
        'roomName': 'Library'
      },
      {
        'id': 42,
        'name': 'Fixed window 4',
        'status': 'CLOSED',
        'roomId': 10,
        'roomName': 'Library'
      },
      {
        'id': 43,
        'name': 'Sliding window 5',
        'status': 'CLOSED',
        'roomId': 10,
        'roomName': 'Library'
      },
    ]
  }
];

export class WindowsRoute extends BaseRoute {

  public static create(router: Router) {
    const route = new WindowsRoute();
    router.get('/training/android/rooms', (req: Request, res: Response) => {
      route.findAllRooms(req, res);
    });
    router.get('/training/android/windows', (req: Request, res: Response) => {
      route.findAllWindows(req, res);
    });
    router.get('/training/android/heaters', (req: Request, res: Response) => {
      route.findAllHeaters(req, res);
    });
    router.get('/training/android/rooms/:roomId', (req: Request, res: Response) => {
      route.findByRoomId(req, res, +req.params.windowsId);
    });
    router.get('/training/android/windows/:windowsId', (req: Request, res: Response) => {
      route.findByWindowId(req, res, +req.params.windowsId);
    });
    router.get('/training/android/heaters/:heaterId', (req: Request, res: Response) => {
      route.findByHeaterId(req, res, +req.params.windowsId);
    });
    return route;
  }

  private findAllRooms(req: Request, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ROOMS));
  }

  private findByRoomId(req: Request, res: Response, id: number) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ROOMS.find(it => it.id === id)));
  }


  private findAllWindows(req: Request, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    const windows = ROOMS.flatMap(it => it.windows);
    res.end(JSON.stringify(windows));
  }

  private findByWindowId(req: Request, res: Response, id: number) {
    res.setHeader('Content-Type', 'application/json');
    const windows = ROOMS.flatMap(it => it.windows).find(it => it.id === id);
    res.end(JSON.stringify(windows));
  }


  private findAllHeaters(req: Request, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    const heaters = ROOMS.flatMap(it => it.heaters);
    res.end(JSON.stringify(heaters));
  }

  private findByHeaterId(req: Request, res: Response, id: number) {
    res.setHeader('Content-Type', 'application/json');
    const heaters = ROOMS.flatMap(it => it.heaters).find(it => it.id === id);
    res.end(JSON.stringify(heaters));
  }
}

import {Request, Response} from 'express';
import {BaseRoute} from './base.route';
import {Router} from 'express-serve-static-core';
import {Windows} from '../model/windows';

const WINDOWS: Array<Windows> = [
  {'id':1,'name':'Fixed window 1','status':'CLOSED','room':{'id':1,'name':'Hall','type':'Reception','level':0,'currentTemperature':null,'targetTemperature':null}},
  {'id':2,'name':'Sliding window 2','status':'OPEN','room':{'id':1,'name':'Hall','type':'Reception','level':0,'currentTemperature':null,'targetTemperature':null}},
  {'id':3,'name':'Sliding window 3','status':'OPEN','room':{'id':1,'name':'Hall','type':'Reception','level':0,'currentTemperature':null,'targetTemperature':null}},
  {'id':4,'name':'Sliding window 1','status':'CLOSED','room':{'id':2,'name':'Amphi A','type':'Amphitheater','level':0,'currentTemperature':22.3,'targetTemperature':20}},
  {'id':5,'name':'Sliding window 2','status':'OPEN','room':{'id':2,'name':'Amphi A','type':'Amphitheater','level':0,'currentTemperature':22.3,'targetTemperature':20}},
  {'id':6,'name':'Sliding window 3','status':'CLOSED','room':{'id':2,'name':'Amphi A','type':'Amphitheater','level':0,'currentTemperature':22.3,'targetTemperature':20}},
  {'id':7,'name':'Sliding window 4','status':'OPEN','room':{'id':2,'name':'Amphi A','type':'Amphitheater','level':0,'currentTemperature':22.3,'targetTemperature':20}},
  {'id':8,'name':'Sliding window 5','status':'OPEN','room':{'id':2,'name':'Amphi A','type':'Amphitheater','level':0,'currentTemperature':22.3,'targetTemperature':20}},
  {'id':9,'name':'Fixed window 1','status':'CLOSED','room':{'id':3,'name':'Amphi B','type':'Amphitheater','level':1,'currentTemperature':24.6,'targetTemperature':20}},
  {'id':10,'name':'Sliding window 2','status':'CLOSED','room':{'id':3,'name':'Amphi B','type':'Amphitheater','level':1,'currentTemperature':24.6,'targetTemperature':20}},
  {'id':11,'name':'Sliding window 3','status':'CLOSED','room':{'id':3,'name':'Amphi B','type':'Amphitheater','level':1,'currentTemperature':24.6,'targetTemperature':20}},
  {'id':12,'name':'Sliding window 4','status':'OPEN','room':{'id':3,'name':'Amphi B','type':'Amphitheater','level':1,'currentTemperature':24.6,'targetTemperature':20}},
  {'id':13,'name':'Fixed window 5','status':'CLOSED','room':{'id':3,'name':'Amphi B','type':'Amphitheater','level':1,'currentTemperature':24.6,'targetTemperature':20}},
  {'id':14,'name':'Fixed window 1','status':'CLOSED','room':{'id':4,'name':'Amphi C','type':'Amphitheater','level':2,'currentTemperature':18.3,'targetTemperature':20}},
  {'id':15,'name':'Fixed window 2','status':'CLOSED','room':{'id':4,'name':'Amphi C','type':'Amphitheater','level':2,'currentTemperature':18.3,'targetTemperature':20}},
  {'id':16,'name':'Sliding window 3','status':'CLOSED','room':{'id':4,'name':'Amphi C','type':'Amphitheater','level':2,'currentTemperature':18.3,'targetTemperature':20}},
  {'id':17,'name':'Sliding window 4','status':'CLOSED','room':{'id':4,'name':'Amphi C','type':'Amphitheater','level':2,'currentTemperature':18.3,'targetTemperature':20}},
  {'id':18,'name':'Sliding window 5','status':'CLOSED','room':{'id':4,'name':'Amphi C','type':'Amphitheater','level':2,'currentTemperature':18.3,'targetTemperature':20}},
  {'id':19,'name':'Fixed window 1','status':'CLOSED','room':{'id':5,'name':'Amphi D','type':'Amphitheater','level':1,'currentTemperature':19.6,'targetTemperature':20}},
  {'id':20,'name':'Fixed window 2','status':'CLOSED','room':{'id':5,'name':'Amphi D','type':'Amphitheater','level':1,'currentTemperature':19.6,'targetTemperature':20}},
  {'id':21,'name':'Sliding window 3','status':'CLOSED','room':{'id':5,'name':'Amphi D','type':'Amphitheater','level':1,'currentTemperature':19.6,'targetTemperature':20}},
  {'id':22,'name':'Sliding window 4','status':'OPEN','room':{'id':5,'name':'Amphi D','type':'Amphitheater','level':1,'currentTemperature':19.6,'targetTemperature':20}},
  {'id':23,'name':'Sliding window 5','status':'CLOSED','room':{'id':5,'name':'Amphi D','type':'Amphitheater','level':1,'currentTemperature':19.6,'targetTemperature':20}},
  {'id':24,'name':'Sliding window 1','status':'CLOSED','room':{'id':6,'name':'Amphi E','type':'Amphitheater','level':2,'currentTemperature':21.4,'targetTemperature':20}},
  {'id':25,'name':'Fixed window 2','status':'CLOSED','room':{'id':6,'name':'Amphi E','type':'Amphitheater','level':2,'currentTemperature':21.4,'targetTemperature':20}},
  {'id':26,'name':'Fixed window 3','status':'CLOSED','room':{'id':6,'name':'Amphi E','type':'Amphitheater','level':2,'currentTemperature':21.4,'targetTemperature':20}},
  {'id':27,'name':'Sliding window 4','status':'CLOSED','room':{'id':6,'name':'Amphi E','type':'Amphitheater','level':2,'currentTemperature':21.4,'targetTemperature':20}},
  {'id':28,'name':'Sliding window 5','status':'CLOSED','room':{'id':6,'name':'Amphi E','type':'Amphitheater','level':2,'currentTemperature':21.4,'targetTemperature':20}},
  {'id':29,'name':'Sliding window 1','status':'CLOSED','room':{'id':7,'name':'Amphi F','type':'Amphitheater','level':0,'currentTemperature':20.3,'targetTemperature':20}},
  {'id':30,'name':'Fixed window 2','status':'CLOSED','room':{'id':7,'name':'Amphi F','type':'Amphitheater','level':0,'currentTemperature':20.3,'targetTemperature':20}},
  {'id':31,'name':'Sliding window 3','status':'CLOSED','room':{'id':7,'name':'Amphi F','type':'Amphitheater','level':0,'currentTemperature':20.3,'targetTemperature':20}},
  {'id':32,'name':'Sliding window 4','status':'OPEN','room':{'id':7,'name':'Amphi F','type':'Amphitheater','level':0,'currentTemperature':20.3,'targetTemperature':20}},
  {'id':33,'name':'Fixed window 5','status':'CLOSED','room':{'id':7,'name':'Amphi F','type':'Amphitheater','level':0,'currentTemperature':20.3,'targetTemperature':20}},{
  'id':34,'name':'Sliding window 1','status':'CLOSED','room':{'id':8,'name':'Amphi G','type':'Amphitheater','level':0,'currentTemperature':16.7,'targetTemperature':20}},
  {'id':35,'name':'Sliding window 2','status':'CLOSED','room':{'id':8,'name':'Amphi G','type':'Amphitheater','level':0,'currentTemperature':16.7,'targetTemperature':20}},
  {'id':36,'name':'Sliding window 3','status':'CLOSED','room':{'id':8,'name':'Amphi G','type':'Amphitheater','level':0,'currentTemperature':16.7,'targetTemperature':20}},
  {'id':37,'name':'Sliding window 4','status':'CLOSED','room':{'id':8,'name':'Amphi G','type':'Amphitheater','level':0,'currentTemperature':16.7,'targetTemperature':20}},
  {'id':38,'name':'Fixed window 5','status':'CLOSED','room':{'id':8,'name':'Amphi G','type':'Amphitheater','level':0,'currentTemperature':16.7,'targetTemperature':20}},
  {'id':39,'name':'Sliding window 1','status':'CLOSED','room':{'id':9,'name':'Amphi H','type':'Amphitheater','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':40,'name':'Sliding window 2','status':'OPEN','room':{'id':9,'name':'Amphi H','type':'Amphitheater','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':41,'name':'Sliding window 3','status':'CLOSED','room':{'id':9,'name':'Amphi H','type':'Amphitheater','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':42,'name':'Fixed window 4','status':'CLOSED','room':{'id':9,'name':'Amphi H','type':'Amphitheater','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':43,'name':'Sliding window 5','status':'CLOSED','room':{'id':9,'name':'Amphi H','type':'Amphitheater','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':44,'name':'Sliding window 1','status':'CLOSED','room':{'id':9,'name':'Room E1','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':45,'name':'Sliding window 2','status':'CLOSED','room':{'id':9,'name':'Room E1','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':46,'name':'Sliding window 1','status':'OPEN','room':{'id':9,'name':'Room E2','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':47,'name':'Sliding window 2','status':'CLOSED','room':{'id':9,'name':'Room E2','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':48,'name':'Sliding window 1','status':'OPEN','room':{'id':9,'name':'Room E3','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':49,'name':'Sliding window 2','status':'OPEN','room':{'id':9,'name':'Room E3','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':50,'name':'Fixed window 1','status':'CLOSED','room':{'id':9,'name':'Room E4','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':51,'name':'Sliding window 2','status':'CLOSED','room':{'id':9,'name':'Room E4','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':52,'name':'Sliding window 1','status':'CLOSED','room':{'id':9,'name':'Room E5','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':53,'name':'Sliding window 2','status':'OPEN','room':{'id':9,'name':'Room E5','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':54,'name':'Sliding window 1','status':'CLOSED','room':{'id':9,'name':'Room E6','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':55,'name':'Sliding window 2','status':'OPEN','room':{'id':9,'name':'Room E6','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':56,'name':'Sliding window 1','status':'CLOSED','room':{'id':9,'name':'Room E7','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':57,'name':'Sliding window 2','status':'CLOSED','room':{'id':9,'name':'Room E7','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':58,'name':'Sliding window 1','status':'CLOSED','room':{'id':9,'name':'Room E8','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':59,'name':'Fixed window 2','status':'CLOSED','room':{'id':9,'name':'Room E8','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':60,'name':'Sliding window 1','status':'CLOSED','room':{'id':9,'name':'Room E9','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':61,'name':'Sliding window 2','status':'CLOSED','room':{'id':9,'name':'Room E9','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':62,'name':'Sliding window 1','status':'CLOSED','room':{'id':9,'name':'Room E10','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':63,'name':'Fixed window 2','status':'CLOSED','room':{'id':9,'name':'Room E10','type':'Room','level':2,'currentTemperature':19.8,'targetTemperature':20}},
  {'id':64,'name':'Sliding window 1','status':'OPEN','room':{'id':10,'name':'Library','type':'Library','level':0,'currentTemperature':21.8,'targetTemperature':20}},
  {'id':65,'name':'Fixed window 2','status':'CLOSED','room':{'id':10,'name':'Library','type':'Library','level':0,'currentTemperature':21.8,'targetTemperature':20}}];


export class WindowsRoute extends BaseRoute {

  public static create(router: Router) {
    const route = new WindowsRoute();
    router.get('/training/android/windows', (req: Request, res: Response) => {
      route.findAll(req, res);
    });
    router.get('/training/android/windows/:windowsId', (req: Request, res: Response) => {
      route.findById(req, res, +req.params.windowsId);
    });
    return route;
  }


  private findAll(req: Request, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(WINDOWS));
  }

  private findById(req: Request, res: Response, id: number) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(WINDOWS.find(win => win.id === id)));
  }


}

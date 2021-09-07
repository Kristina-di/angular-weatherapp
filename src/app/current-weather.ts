import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class CurrentWeather {
  constructor(public insert: string,
              public temp: string,
              public icon: string,
              public weatherKing: string,
              public showMax: string,
              public showMin: string) {}
}

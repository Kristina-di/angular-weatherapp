import {Component, OnInit} from '@angular/core';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

import {Forecast} from '../forecast';
import {CurrentWeather} from '../current-weather';
import {WeatherService} from '../weather.service';
import {MessageService} from '../message.service';

@Component({
    selector: 'wa-forecast',
    templateUrl: './forecast.component.html',
    styleUrls: ['./forecast.component.scss']
})

export class ForecastComponent implements OnInit {

    constructor(private ws: WeatherService, public messageService: MessageService) {
    }

    cityForecast: Forecast[] = [];
    myWeather: CurrentWeather;
    city = '';
    dirTemp = 'asc';
    dirDays = 'desc';

    sortTemp() {
        if (this.dirTemp === 'asc') {
            this.dirTemp = 'desc';
            this.cityForecast.sort((a, b) => {
                return parseInt(b.showMax, 10) - parseInt(a.showMax, 10);
            });
        } else {
            this.dirTemp = 'asc';
            this.cityForecast.sort((a, b) => {
                return parseInt(a.showMax, 10) - parseInt(b.showMax, 10);
            });
        }
    }

    sortDay() {
        this.cityForecast.sort((a, b) => {
            const aDate = a.day.split(' ')[0].split('-');
            const aDay = parseInt(aDate[2], 10);
            const bDate = b.day.split(' ')[0].split('-');
            const bDay = parseInt(bDate[2], 10);
            if (this.dirDays === 'asc') {
                return aDay - bDay;
            } else {
                return bDay - aDay;
            }
        });
        if (this.dirDays === 'asc') {
            this.dirDays = 'desc';
        } else {
            this.dirDays = 'asc';
        }
    }

    ngOnInit() {
        const city = this.cityDetect();
        if (city !== '') {
            this.city = city;
            this.getApiData(city);
        }
    }

    cityDetect() {
        const loc = location.href.split('?');
        const getCity = {
            city: ''
        };
        if (loc.length > 1) {
            const getParams = loc[1].split('&');
            getParams.map((item) => {
                const [key, value] = item.split('=');
                getCity[key] = value;
            });
        }
        return getCity.city;
    }

    getApiData(city) {
        if (city.length < 1) {
            this.messageService.add('Please, input city name');
            history.pushState(null, null, '/');
            return false;
        }
        this.ws.getWeatherByCity(city)
            .pipe(
                catchError(err => {
                    // console.log('Handling error getWeatherByCity locally and rethrowing it...', err);
                    this.ws.log('Not found. Please, check the city exist');
                    history.pushState(null, null, '/');
                    return throwError(err);
                })
            )
            .subscribe(
                (data: any) => {
                    this.myWeather = new CurrentWeather(
                        data.name,
                        data.main.temp,
                        data.weather[0].icon,
                        data.weather[0].description,
                        data.main.temp_max,
                        data.main.temp_min);
                    history.pushState(null, null, `?city=${data.name}`);
                    const reformatCity = this.cityDetect();
                    this.city = reformatCity;
                });
        this.ws.fiveDayForecast(city)
            .pipe(
                catchError(err => {
                    // console.log('Handling error fiveDayForecast locally and rethrowing it...', err);
                    return throwError(err);
                })
            )
            .subscribe(
                (data: any) => {
                    data.list.filter((item, i) => {
                        if (i % 8 === 0) {
                            const temp = new Forecast(
                                item.dt_txt,
                                item.weather[0].icon,
                                item.main.temp_max,
                                item.main.temp_min);
                            this.cityForecast.push(temp);
                        }
                        return false;
                    });
                });
    }

    onSubmit() {
        this.cityForecast.splice(0, this.cityForecast.length);
        this.myWeather = new CurrentWeather('', '', '', '', '', '');
        this.messageService.clear();
        this.getApiData(this.city);
    }
}

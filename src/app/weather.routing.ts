import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders} from '@angular/core';

import { ForecastComponent} from './forecast/forecast.component';

const WEATHER_ROUTER: Routes = [
    {path: '', component: ForecastComponent},
]

export const weatherRouting: ModuleWithProviders = RouterModule.forRoot(WEATHER_ROUTER);

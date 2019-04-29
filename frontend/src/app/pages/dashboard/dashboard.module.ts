import { NgModule, LOCALE_ID } from '@angular/core';

import { LineChartModule } from '@swimlane/ngx-charts';

import { ThemeModule } from '../../@theme/theme.module';
import { SocketService } from './core/Socket';
import { DashboardComponent } from './dashboard.component';
import { TemperatureComponent } from './temperature/temperature.component';
import { TemperatureDraggerComponent } from './temperature/temperature-dragger/temperature-dragger.component';
import { ElectricityComponent } from './electricity/electricity.component';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  imports: [
    ThemeModule,
    LineChartModule,
  ],
  declarations: [
    DashboardComponent,
    TemperatureComponent,
    TemperatureDraggerComponent,
    ElectricityComponent,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    SocketService,
  ]
})
export class DashboardModule { }

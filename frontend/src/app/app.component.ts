import { Component } from '@angular/core';

import * as chartsData from './config/ngx-charts.config';
import { SocketService } from './services/Socket';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  pipe = new DatePipe('pt-BR'); 
  view = undefined;
  lineChartShowXAxis = chartsData.lineChartShowXAxis;
  lineChartShowYAxis = chartsData.lineChartShowYAxis;
  lineChartGradient = chartsData.lineChartGradient;
  lineChartShowLegend = chartsData.lineChartShowLegend;
  lineChartShowXAxisLabel = chartsData.lineChartShowXAxisLabel;
  lineChartXAxisLabel = 'Tempo';
  lineChartShowYAxisLabel = chartsData.lineChartShowYAxisLabel;
  lineChartYAxisLabel = 'Bit';
  lineChartColorScheme = chartsData.lineChartColorScheme;
  lineChartAutoScale = chartsData.lineChartAutoScale;
  lineChartLineInterpolation = chartsData.lineChartLineInterpolation;
  timeline = true;

  chartDataS1: { name: string, series: { name: number | string, value: number }[] }[];
  chartDataS2: { name: string, series: { name: number | string, value: number }[] }[];
  showTimeline: boolean;
  interval: any;

  constructor(private socket: SocketService) {
    this.chartDataS1 = [{ name: 'S1', series: [] }];
    this.chartDataS2 = [{ name: 'S1', series: [] }];
  }

  ngOnInit() {

    this.socket.getMessages().subscribe((msg) => {
      if (msg['id'] == 'S1') {
        this.chartDataS1[0].series.push({ name: this.pipe.transform(Date.now(), 'mm:ss SSS'), value: msg['sensor'] });
        if (this.chartDataS1[0].series.length > 30) {
          this.chartDataS1[0].series.shift();
        }
        this.chartDataS1 = [...this.chartDataS1];
      }
    });


    /*this.interval = setInterval(() => {
        this.chartData[0].series.push({name: Math.random(), value: Math.random()});
        this.chartData = [...this.chartData];
    }, 500);*/
  }
  /*
  public switchData(): void {
    clearInterval(this.interval);
    this.showTimeline = false;

    this.chartData = [{ name: 'Test2', series: [] }];

    for (let i = 0; i < 240; i++) {
      this.chartData[0].series.push({ name: i, value: Math.random() });
    }

    this.chartData = [...this.chartData];
  }*/
}

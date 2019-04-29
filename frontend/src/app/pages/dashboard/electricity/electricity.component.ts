import { Component, Input, OnDestroy } from '@angular/core';
import * as chartsData from './ngx-charts.config';
import { NbThemeService } from '@nebular/theme';

@Component({
	selector: 'ngx-electricity',
	styleUrls: ['./electricity.component.scss'],
	templateUrl: './electricity.component.html',
})
export class ElectricityComponent implements OnDestroy {

	@Input() chartData: {
		name: string,
		legendX: string,
		legendY: string,
		data: {
			name: string,
			series: {
				name: number | string,
				value: number
			}[]
		}[]
	};

	view = null;
	lineChartShowXAxis = chartsData.lineChartShowXAxis;
	lineChartShowYAxis = chartsData.lineChartShowYAxis;
	lineChartShowLegend = chartsData.lineChartShowLegend;
	lineChartShowXAxisLabel = chartsData.lineChartShowXAxisLabel;
	lineChartShowYAxisLabel = chartsData.lineChartShowYAxisLabel;
	lineChartAutoScale = true;
	lineChartLineInterpolation = chartsData.lineChartLineInterpolation;
	timeline = false;

	colorScheme: any;
	themeSubscription: any;

	constructor(private theme: NbThemeService) {
		this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
			const colors: any = config.variables;
			this.colorScheme = {
				domain: [colors.primaryLight, colors.infoLight, colors.successLight, colors.warningLight, colors.dangerLight],
			};
		});
	}

	ngOnDestroy(): void {
		this.themeSubscription.unsubscribe();
	}

}

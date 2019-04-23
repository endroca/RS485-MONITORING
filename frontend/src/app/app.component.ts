import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as chartsData from './config/ngx-charts.config';
import { SocketService } from './services/Socket';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	/*
	* Variables
	*/
	pipe = new DatePipe('pt-BR');
	objectKeys = Object.keys;
	chartData: {
		[index: string]: {
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
		}
	} = {};
	slaveReciver: { id: string, sensor: string, ping: number };
	settingForm: FormGroup;

	//display alerts
	alert: { type: string, message: string } = null;

	/*
	* Ngx chart configs
	*/
	view = undefined;
	lineChartShowXAxis = chartsData.lineChartShowXAxis;
	lineChartShowYAxis = chartsData.lineChartShowYAxis;
	lineChartGradient = chartsData.lineChartGradient;
	lineChartShowLegend = chartsData.lineChartShowLegend;
	lineChartShowXAxisLabel = chartsData.lineChartShowXAxisLabel;
	lineChartShowYAxisLabel = chartsData.lineChartShowYAxisLabel;
	lineChartColorScheme = chartsData.lineChartColorScheme;
	lineChartAutoScale = chartsData.lineChartAutoScale;
	lineChartLineInterpolation = chartsData.lineChartLineInterpolation;
	timeline = false;


	constructor(private socket: SocketService,
		private http: HttpClient,
		private formBuilder: FormBuilder) {
	}


	ngOnInit() {
		// Get slaves online
		this._initStructure();


		// Init socket message
		this.socket.getMessages('sensors').subscribe((msg) => {
			if ("action" in msg) {
				switch (msg.action) {
					case "reload":
						this.resetInterface();
						this._initStructure();
						break;
				}
			} else {
				if (msg.id in this.chartData) {
					const series = this.chartData[msg.id].data[0].series;

					series.push({ name: this.pipe.transform(Date.now(), 'mm:ss SSS'), value: msg['sensor'] });

					if (series.length > 30) {
						series.shift();
					}

					this.chartData[msg.id].data = [...this.chartData[msg.id].data];

				}
			}
		});


		this.settingForm = this.formBuilder.group({
			'sensorKey': [null, [Validators.required]],
			'name': [null, [Validators.required]],
			'sampleTime': [null, [Validators.required]],
			'legendX': [null, [Validators.required]],
			'legendY': [null, [Validators.required]],
			'setPoint': [null, [Validators.required]],
			'function': [null, [Validators.required]]
		});
	}

	resetInterface(){
		this._cleanObject(this.chartData);
	}

	settingSubmit() {
		if (!this.settingForm.invalid) {

		}
	}

	_initStructure() {
		this.http.get('http://localhost:3000/sensorsOnline')
			.pipe(map(data => data as Array<any>))
			.subscribe(data => {

				if (data.length) {
					this.alert = null;

					for (let sensor in data) {
						this.chartData[data[sensor].serial] = {
							name: (data[sensor].name) ? data[sensor].name : data[sensor].serial,
							legendX: (data[sensor].legendX) ? data[sensor].legendX : 'Tempo',
							legendY: (data[sensor].legendY) ? data[sensor].legendY : 'Bit',
							data: [{
								name: (data[sensor].name) ? data[sensor].name : data[sensor].serial,
								series: [{
									name: '',
									value: 0
								}]
							}]
						};
					}
				} else {
					this.alert = {
						type: 'warning',
						message: 'Nenhum sensor encontrado'
					};
				}
			}, error => {
				this.alert = {
					type: 'danger',
					message: 'Não foi possivel localizar o servidor'
				};
			});
	}

	_length(obj) {
		return Object.keys(obj).length;
	}

	_cleanObject(obj) {
		if (this._length(obj)) {
			for (const prop of Object.keys(obj)) {
				delete obj[prop];
			}
		}

	}
}

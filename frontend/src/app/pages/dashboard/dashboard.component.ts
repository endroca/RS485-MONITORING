import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { SocketService } from './core/Socket';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'ngx-dashboard',
	templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

	pipe = new DatePipe('pt-BR');
	objectKeys = Object.keys;

	chartData: {
		[index: string]: {
			name: string,
			legendX: string,
			legendY: string,
			sampleTime: number,
			setPoint: number,
			tolerance: number,
			function: string,
			setPointFunction: string,
			data: {
				name: string,
				series: {
					name: number | string,
					value: number
				}[]
			}[]
		}
	} = {};

	//display alerts
	alert: { type: string, message: string } = null;


	constructor(private http: HttpClient,
		private socket: SocketService) {

	}

	ngOnInit(): void {
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
					const stringFunction = this.chartData[msg.id].function.replace('x', msg['sensor']);

					series.push({ name: this.pipe.transform(Date.now(), 'ss.SSS'), value: eval(stringFunction) });

					if (series.length > 15) {
						series.shift();
					}

					this.chartData[msg.id].data = [...this.chartData[msg.id].data];

				}
			}
		});
	}

	/*
	* UPDATE SETTING SENSOR
	*/
	setting(event) {
		this.http.post('http://localhost:3000/updateSetting', event)
			.pipe(map(data => data as Array<any>))
			.subscribe(data => {
				if (data['error'] == 0) {
					this.chartData[event.serial].name = event.name;
					this.chartData[event.serial].legendX = event.legendX;
					this.chartData[event.serial].legendY = event.legendY;
					this.chartData[event.serial].sampleTime = event.sampleTime;
					this.chartData[event.serial].function = event.function;
					this.chartData[event.serial].setPointFunction = event.setPointFunction;
					this.chartData[event.serial].setPoint = event.setPoint;
					this.chartData[event.serial].tolerance = event.tolerance;
				}
			})
	}


	resetInterface() {
		this.chartData = {};
	}

	_initStructure() {
		this.http.get('http://localhost:3000/sensorsOnline')
			.pipe(map(data => data as Array<any>))
			.subscribe(data => {

				if (data.length) {
					this.alert = null;

					for (let sensor in data) {
						this.chartData[data[sensor].serial] = {
							name: data[sensor].name,
							legendX: data[sensor].legendX,
							legendY: data[sensor].legendY,
							sampleTime: data[sensor].sampleTime,
							setPoint: data[sensor].setPoint,
							tolerance: data[sensor].tolerance,
							function: data[sensor].function,
							setPointFunction: data[sensor].setPointFunction,
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
			}, () => {
				this.alert = {
					type: 'danger',
					message: 'Não foi possivel realizar a conexção com o servidor'
				};
			});
	}

	_length(obj) {
		return Object.keys(obj).length;
	}
}

import { Component, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile, max } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
	selector: 'ngx-temperature',
	styleUrls: ['./temperature.component.scss'],
	templateUrl: './temperature.component.html',
})
export class TemperatureComponent implements OnDestroy {
	private alive = true;

	settingForm: FormGroup;
	@Input() serial: string;
	@Input() name: string;
	@Input() legendX: string;
	@Input() legendY: string;
	@Input() sampleTime: number;
	@Input() setPoint: number;
	@Input() function: string;
	@Input() setPointFunction: string;
	@Input() tolerance: number;

	@Output() setting = new EventEmitter<any>();

	oSetPoint: number = 0;
	oDisable = true;

	toleranceView = '';

	min: number;
	max: number;

	colors: any;
	themeSubscription: any;

	constructor(private theme: NbThemeService,
		private formBuilder: FormBuilder) {
		this.theme.getJsTheme()
			.pipe(takeWhile(() => this.alive))
			.subscribe(config => {
				this.colors = config.variables;
			});
	}

	ngOnInit() {
		this.toleranceView = this.tolerance.toString();

		this.min = eval(this.function.replace('x', '0'));
		this.max = eval(this.function.replace('x', '4095'));

		if (this.setPoint >= 0) {
			this.oSetPoint = Math.round(eval(this.function.replace('x', this.setPoint.toString())));
			this.oDisable = false;
		}

		this.settingForm = this.formBuilder.group({
			'name': [this.name, [Validators.required]],
			'sampleTime': [this.sampleTime, [Validators.required]],
			'legendX': [this.legendX, [Validators.required]],
			'legendY': [this.legendY, [Validators.required]],
			'function': [this.function, [Validators.required]],
			'setPointFunction': [this.setPointFunction, [Validators.required]]
		});
	}

	settingSubmit() {
		if (!this.settingForm.invalid) {

			let setPoint = Math.round(eval(this.settingForm.value.setPointFunction.replace('x', this.oSetPoint)));
			setPoint = (setPoint > 4095) ? 4095 : setPoint;
			setPoint = (setPoint < 0) ? 0 : setPoint;


			this.setting.emit({
				serial: this.serial,
				name: this.settingForm.value.name,
				sampleTime: this.settingForm.value.sampleTime,
				legendX: this.settingForm.value.legendX,
				legendY: this.settingForm.value.legendY,
				function: this.settingForm.value.function,
				setPointFunction: this.settingForm.value.setPointFunction,
				setPoint: (!this.oDisable) ? setPoint : -1,
				tolerance: this.toleranceView
			});

			this.min = eval(this.settingForm.value.function.replace('x', '0'));
			this.max = eval(this.settingForm.value.function.replace('x', '4095'));
		}
	}


	ngOnDestroy() {
		this.alive = false;
	}
}

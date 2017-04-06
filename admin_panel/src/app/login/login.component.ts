import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {fadeInAnimation} from "../route.animation";
import { MdSnackBar } from "@angular/material";
import { DataService } from '../data.service';

@Component({
	selector: 'ms-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	host: {
	'[@fadeInAnimation]': 'true'
	},
	animations: [ fadeInAnimation ]
})
export class LoginComponent implements OnInit {

	address: string;

	constructor(
		private router: Router,
		private dataService: DataService,
		private snackBar: MdSnackBar
	) { }

	ngOnInit() {
		var self = this;

		//self.address = "0x546eb1b4361645de25a748bdc9ee95ab42556657";

		self.dataService.disconnect();
		self.dataService.init();
		window.addEventListener('load', function() {
			if(!self.dataService.isWeb3Available()) self.router.navigate(['/getMetamask']);
			else self.login();
		});
	}

	login() {
		var self = this;

		if(this.address == undefined || this.address.trim().length == 0) return;

		this.dataService.connectToContract(this.address, function(error){
			if(error!=undefined){
				self.snackBar.open(error, "Close", {});
			}
			else {
				self.router.navigate(['/dashboard']);
			}
		});

	}

}

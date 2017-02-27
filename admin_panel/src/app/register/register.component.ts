import { Component, OnInit } from '@angular/core';
import {fadeInAnimation} from "../route.animation";
import {Router} from "@angular/router";
import { MdSnackBar } from "@angular/material";
import { ApplicationRef } from '@angular/core';

import { DataService } from '../data.service';

@Component({
	selector: 'ms-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss'],
	host: {
		'[@fadeInAnimation]': 'true'
	},
	animations: [ fadeInAnimation ]
})
export class RegisterComponent implements OnInit {
	
	contractAddress: string;
	
	constructor(
	private router: Router,
	private dataService: DataService,
	private snackBar: MdSnackBar,
	private appRef: ApplicationRef,
	) { }
	
	ngOnInit() {
	}
	
	register() {
		var self = this;
		this.dataService.deployNewContract(function(error: string, address: string){
			console.log("Got contract");
			if(error!=undefined){
				self.snackBar.open(error, "Close", {});
			}
			else {
				self.snackBar.open("Contract created! Address: "+address, "Close");
				self.contractAddress = address;
				self.appRef.tick();
			}
		});
	}

	connectToContract(){
		var self = this;
		this.dataService.initData(function(){
			self.router.navigate(['/dashboard']);
		});
	}
	
}

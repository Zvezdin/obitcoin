import { Component, OnInit } from '@angular/core';
import {fadeInAnimation} from "../route.animation";
import {Router} from "@angular/router";
import { MdSnackBar } from "@angular/material";
import { ChangeDetectorRef } from '@angular/core';

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
	private cdRef: ChangeDetectorRef,
	) { }
	
	ngOnInit() {
		var self = this;
		window.addEventListener('load', function() {
			if(!self.dataService.isWeb3Available()) self.router.navigate(['/getMetamask']);
		});
	}
	
	register() {
		var self = this;
		this.dataService.deployNewContract(function(error, address: string){
			console.log("Got contract");
			if(error!=undefined){
				console.log("Error with contract creation:",error);
				self.snackBar.open("There was an error", "Close", {});
			}
			else {
				self.snackBar.open("Contract created! Address: "+address, "Close");
				self.contractAddress = address;
			}
			self.cdRef.detectChanges();
		});
	}

	connectToContract(){
		var self = this;
		this.dataService.initData(function(){
			self.router.navigate(['/dashboard']);
		});
	}
	
}

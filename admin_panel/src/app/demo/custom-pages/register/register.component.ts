import { Component, OnInit } from '@angular/core';
import {fadeInAnimation} from "../../../route.animation";
import {Router} from "@angular/router";
import { MdSnackBar } from "@angular/material";

import { DataService } from '../../../data.service';

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
	) { }
	
	ngOnInit() {
	}
	
	register() {
		var self = this;
		this.dataService.createContract(function(error: string, address: string){
			if(error!=undefined){
				self.snackBar.open(error, "Close", {});
			}
			else {
				self.snackBar.open("Contract created! Address: "+address);
				self.contractAddress = address;
			}
		});
	}
	
}

import { Component, OnInit } from '@angular/core';
import {fadeInAnimation} from "../route.animation";
import {Router} from "@angular/router";
import { DataService } from '../data.service';

@Component({
	selector: 'ms-forgot-password',
	templateUrl: './get-metamask.component.html',
	styleUrls: ['./get-metamask.component.scss'],
	host: {
		'[@fadeInAnimation]': 'true'
	},
	animations: [ fadeInAnimation ]
})
export class GetMetamaskComponent implements OnInit {
	
	email: string;
	password: string;
	
	constructor(
	private router: Router,
	private dataService: DataService,
	) { }
	
	ngOnInit() {
		var self = this;
		console.log("Checking for web3...");
		window.addEventListener('load', function() {
			if(self.dataService.isWeb3Available()) self.router.navigate(['/login']);
		});
	}
}

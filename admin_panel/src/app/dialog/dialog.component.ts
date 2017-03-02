import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
	selector: 'ms-dialog',
	templateUrl: './dialog.component.html',
	styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
	
	private title: string;
	private lines: string[];
	
	constructor(public dialogRef: MdDialogRef<DialogComponent>) { }

	public appendMessage(message: string){
		if(this.lines == undefined) this.lines = [message];
		else {
			this.lines.push(message);
		}
	}

	public setTitle(title: string){
		this.title = title;
	}
}

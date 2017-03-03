import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { ChangeDetectorRef } from '@angular/core';

@Component({
	selector: 'ms-dialog',
	templateUrl: './dialog.component.html',
	styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
	
	private title: string;
	private lines: string[];
	
	constructor(public dialogRef: MdDialogRef<DialogComponent>, private cdRef: ChangeDetectorRef) {
		this.lines = [];
	}

	public appendMessage(message: string){
		console.log("Appending ", message);
		this.lines.push(message);
		this.cdRef.detectChanges();
	}

	public setTitle(title: string){
		this.title = title;
	}
}

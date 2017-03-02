import { DialogComponent } from './dialog/dialog.component';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable()
export class DialogService {
	
	constructor(private dialog: MdDialog) { }

	dialogRef : MdDialogRef<DialogComponent>;
    config : MdDialogConfig;

	isOpen: boolean;

	public notify(title: string, message: string, viewContainerRef : ViewContainerRef): void {
		var self = this;
		this.config = new MdDialogConfig();

        this.config.viewContainerRef = viewContainerRef;

        this.dialogRef = this.dialog.open(DialogComponent, this.config);

        this.dialogRef.componentInstance.setTitle(title);
        this.dialogRef.componentInstance.appendMessage(message);

		this.isOpen = true;

		this.dialogRef.afterClosed().subscribe(a => {
			self.isOpen = false;
			console.log("closed dialog");
		});
	}

	public appendMessage(title: string, message: string, viewContainerRef: ViewContainerRef): void {
		if(this.isOpen){
			this.dialogRef.componentInstance.setTitle(title);
			this.dialogRef.componentInstance.appendMessage(message);
		} else this.notify(title, message, viewContainerRef);
	}
	
}

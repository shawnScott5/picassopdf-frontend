import { Component, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ReportBugOrRequestFeature } from '../report-bug-or-feature/report-bug-or-feature.component';

let self: any;
@Component({
  selector: 'app-contact-support',
  standalone: true,
  imports: [],
  templateUrl: './contact-support.component.html',
  styleUrls: ['./contact-support.component.scss']
})
export class ContactSupportComponent {
  isReportBug: boolean = true;

  constructor(public _dialog: MatDialog, public _viewContainerRef: ViewContainerRef) {
    self = this;
  }
  onRequestBugOrFeature() {
     //this.isReportBug = 
     const config = new MatDialogConfig();
         
             config.autoFocus = false;
             config.disableClose = false;
             config.viewContainerRef = this._viewContainerRef;
             config.hasBackdrop = true;
             config.disableClose = true
             config.minWidth = '75vw';
             config.maxWidth = '75vw';
             config.minHeight = '75vh';
             config.maxHeight = '75vh';
             self.dialogRef = this._dialog.open(ReportBugOrRequestFeature, config);
             self.dialogRef.componentInstance.isReportBug = this.isReportBug;
             self.dialogRef
               .afterClosed()
               .subscribe((result: any) => {
                 self.dialogRef = null;
                 if (result) {
                   
                 }
               });
       }
}

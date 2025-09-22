import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cancel-membership-confirmation',
  standalone: true,
  imports: [DragDropModule],
  templateUrl: './cancel-membership-confirmation.component.html',
  styleUrls: ['./cancel-membership-confirmation.component.scss']
})
export class CancelMembershipConfirmationComponent implements OnInit {
  dialog!: MatDialogRef<any>;

  constructor(private dialogRef: MatDialogRef<any>) {

  }

  ngOnInit() {
    this.dialog = this.dialogRef;
  }

  onCancel() {
    this.dialog.close(false);
  }

  onCancelMembership() {
    this.dialog.close(true);
  }
}

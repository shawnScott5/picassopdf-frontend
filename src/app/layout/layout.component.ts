import { Component, inject, OnInit, ViewContainerRef } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/model/common.model';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { NgIf } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportBugOrRequestFeatureComponent } from '../report-bug-or-request-feature/report-bug-or-request-feature.component';
import { Router } from '@angular/router';
let self: any;
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, MatMenuModule, MatDialogModule, MatTooltipModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})

export class LayoutComponent implements OnInit {
  constructor(public _dialog: MatDialog, public _viewContainerRef: ViewContainerRef,
              public _toastr: ToastrService, private router: Router) {
    self = this;
  }
  authService = inject(AuthService);
  user!: User;
  isCollapsed: boolean = false;
  isNightMode: boolean = false;

  ngOnInit() {
    this.authService.me().subscribe({
      next: (response: any) => {
        this.user = response.data;
      },
      error: (error: any) => {
        //an error will be returned if the token is expired
        this.authService.logout();
      }
    });

    // Force light mode only - app will always be in light mode
    this.isNightMode = false;
    localStorage.setItem('nightMode', 'false');
    this.applyNightMode();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    // Save state to localStorage for persistence
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
  }

  toggleSidebar() {
    this.toggleCollapse();
  }

  navigateToNewsletterToPodcast() {
    this.router.navigate(['/app/newsletter-to-podcast']);
  }

  navigateToVoiceSelection() {
    this.router.navigate(['/app/voice-selection']);
  }

  navigateToPdfConverter() {
    this.router.navigate(['/app/pdf-converter']);
  }

  navigateToApiDocs() {
    this.router.navigate(['/app/api-docs']);
  }

  logout() {
    this.authService.logout();
  }

  openCreateCampaign() {
    this.router.navigate(['/create-campaign']);
  }

  openAbandonedCarts() {
    this.router.navigate(['/abandoned-carts']);
  }

  openVoiceCloning() {
    this.router.navigate(['/voice-face-cloning']);
  }

  openReportBugModal() {
      const config = new MatDialogConfig();
  
      config.autoFocus = false;
      config.disableClose = false;
      config.viewContainerRef = this._viewContainerRef;
      config.hasBackdrop = true;
      config.minWidth = '40vw';
      config.maxWidth = '40vw';
      config.minHeight = '80vh';
      config.maxHeight = '80vh';
      config.panelClass = 'custom-dialog-container';
      self.dialogRef = this._dialog.open(ReportBugOrRequestFeatureComponent, config);
      self.dialogRef.componentInstance.isReportBug = true;
      //self.dialogRef.componentInstance.data = [];
      self.dialogRef.componentInstance.userId = this.user._id;
      self.dialogRef
        .afterClosed()
        .subscribe((result: any) => {
          self.dialogRef = null;
          if (result) {
            //this._toastr.success('Note Created Successfully', 'Success');
          }
        });
  }

  openRequestFeatureModal() {
      const config = new MatDialogConfig();
  
      config.autoFocus = false;
      config.disableClose = false;
      config.viewContainerRef = this._viewContainerRef;
      config.hasBackdrop = true;
      config.minWidth = '40vw';
      config.maxWidth = '40vw';
      config.minHeight = '80vh';
      config.maxHeight = '80vh';
      config.panelClass = 'custom-dialog-container';
      self.dialogRef = this._dialog.open(ReportBugOrRequestFeatureComponent, config);
      //self.dialogRef.componentInstance.data = [];
      self.dialogRef.componentInstance.isReportBug = false;
      self.dialogRef.componentInstance.userId = this.user._id;
      self.dialogRef
        .afterClosed()
        .subscribe((result: any) => {
          self.dialogRef = null;
          if (result) {
            //this._toastr.success('Note Created Successfully', 'Success');
          }
        });
  }

  openCreateNote() {
      // TODO: Implement CreateNoteComponent or remove this functionality
      console.log('Create Note functionality not implemented');
  }

  openCreateTask() {
      // TODO: Implement CreateNewTaskComponent or remove this functionality
      console.log('Create Task functionality not implemented');
    }

    openCreateEvent() {
        // TODO: Implement CreateNewEventComponent or remove this functionality
        console.log('Create Event functionality not implemented');
    }

  // Night mode functionality disabled - app is light mode only
  // toggleNightMode() {
  //   this.isNightMode = !this.isNightMode;
  //   localStorage.setItem('nightMode', this.isNightMode.toString());
  //   this.applyNightMode();
  // }

  applyNightMode() {
    const layoutContainer = document.querySelector('.layout-container');
    const dashboardContainer = document.querySelector('.dashboard-container');
    
    // Force light mode - always remove night-mode classes
    layoutContainer?.classList.remove('night-mode');
    dashboardContainer?.classList.remove('night-mode');
  }
}

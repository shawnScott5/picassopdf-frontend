import { Component, inject, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';  // Import MatFormFieldModule
//import { MatLabelModule } from '@angular/material/form-field'; // Optional: MatLabel if needed
//import { MatHintModule } from '@angular/material/form-field';  // Optional: MatHint if needed
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CreateNewTaskComponent } from '../create-new-task/create-new-task.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { CreateTaskService } from '../create-new-task/create-new-task.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RemoveTaskConfirmationComponent } from '../remove-task-confirmation/remove-task-confirmation.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { debounce } from 'lodash';
import * as _ from 'lodash';
import { TruncatePipe } from '../find-influencers/truncate.pipe';

let self: any;
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, InfiniteScrollModule,TruncatePipe,
            MatButtonModule, DragDropModule, NgFor, NgIf, RouterOutlet, RouterLink, RouterLinkActive, NgClass, DatePipe],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  private eventChannel = new BroadcastChannel('task_updates');
  userId!: string;
  dialog!: MatDialogRef<any>;
  tasksForm!: FormGroup;
  tasks: any[] = [];
  allTasks: any[] = [];
  fb = inject(FormBuilder);
  inProgress: any[] = [];
  done: any[] = [];
  updateId!: any;
  pageSize = 10; // Number of items to load per scroll
  hasMoreData: boolean = true;
  isMoreLoading: boolean = false;
  
  isEditEnabled: boolean = false;
  authService = inject(AuthService);
  isLoading: boolean = false;
  isPageLoading: boolean = true;
  isDeleting: boolean = false;
  query = {
    page: 1,
    limit: 10,
    userId: '',
    task: '',
    reminder: '',
    priority: '',
    status: '',
    flagged: '',
  };
  deleteQuery = {
    userId: '',
    taskId: ''
  };

  constructor(public _viewContainerRef: ViewContainerRef, public _dialog: MatDialog, public _TasksService: CreateTaskService) {
     self = this;
     this.onScroll = debounce(this.onScroll.bind(this), 200); // Debounce to 200ms
  }

  ngOnInit() {
    this.me();
    this.buildForm();

     // Listen for event updates
     this.eventChannel.onmessage = (message) => {
      if (message.data.taskAdded) {
        this.fetchMyTasks();
      }
    };
  }

  onScroll(event: any): void {
    const { scrollTop, scrollHeight, clientHeight } = event.target;

    // Check if the user has scrolled to the bottom
    if (scrollTop + clientHeight >= scrollHeight -10 && !this.isLoading && !this.isPageLoading && this.hasMoreData) {
      this.isMoreLoading = true;
      this.fetchMyTasks();
    }
  }

  fetchMyTasks(reset: boolean = false) {
    if(reset) {
      this.query.page = 1;
      this.tasks = [];
    }

    this._TasksService.fetchMyTasks(this.query).subscribe((response: any) => {
      if(response) {
        setTimeout(() => {
          this.tasks = _.concat(this.tasks, response.data);
          this.isLoading = false;
          this.isPageLoading = false;
          this.isMoreLoading = false;
          this.convertTaskData();
          //this.sortTasks();
          this.hasMoreData = (response.data.length == this.query.limit);
          this.isLoading = false;
          this.query.page++;
        }, 500);
      } else {
        this.isLoading = false;
        this.hasMoreData = false;
        this.isPageLoading = false;
      }
    });
  }

  convertTaskData() {
    for(let task of this.tasks) {
      task.convertedDueDateTime = this.convertMilitaryToStandardTime(task.dueDateTime);
    }
  }

  convertMilitaryToStandardTime(militaryTime: any) {
    if(militaryTime) {
      // Split the input into hours and minutes
      let [hour, minute] = militaryTime.split(':').map(Number);
      let period = hour < 12 ? 'am' : 'pm';

      // Convert hour to 12-hour format
      hour = hour % 12 || 12;

      return `${hour}:${minute.toString().padStart(2, '0')}${period}`;
    }
    return;
  }

  onDeleteTask(task: any) {
          const config = new MatDialogConfig();
      
          config.autoFocus = false;
          config.disableClose = false;
          config.viewContainerRef = this._viewContainerRef;
          config.hasBackdrop = true;
          config.minWidth = '40vw';
          config.maxWidth = '40vw';
          config.minHeight = '30vh';
          config.maxHeight = '30vh';
          config.panelClass = 'custom-dialog-container';
          self.dialogRef = this._dialog.open(RemoveTaskConfirmationComponent, config);
          self.dialogRef.componentInstance.taskId = task._id;
          self.dialogRef.componentInstance.userId = this.userId;
          self.dialogRef
            .afterClosed()
            .subscribe((response: any) => {
              self.dialogRef = null;
              this.isDeleting = true;
              if (response) {
                this.isLoading = true;
                this.fetchMyTasks(true);
              }
            });
  }

  sortTasks() {
    for(let task of this.allTasks) {
      if(task.status === 'TO DO') {
        this.tasks.push(task);
      } else if(task.status === 'IN PROGRESS') { 
        this.inProgress.push(task);
      } else { //DONE
        this.done.push(task);
      }
    }
    //this.isLoading = false;
  }

  me() {
    this.authService.me().subscribe({
      next: (response: any) => {
        this.userId = response.data._id;
        this.query.userId = response.data._id;
        this.fetchMyTasks();
      }
    })
  }

  buildForm() {
      this.tasksForm = this.fb.group({
        _id: ['', []],
        title: ['', []],
        item: ['', [Validators  .required]]
      });
    }

  onSubmit() {

  }

  drop(event: CdkDragDrop<string[]>) {
    const container = event.container;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.updateTask(container);
  }

  updateTask(container: any) {
    const task = container.data[0];

    switch(container.id) {
      case 'cdk-drop-list-0':
        task.status = 'TO DO';
        break;
      case 'cdk-drop-list-1':
        task.status = 'IN PROGRESS';
        break;
      case 'cdk-drop-list-2':
        task.status = 'DONE';
        break;
      default:
        break;
    }

    this.query.task = task;
    this._TasksService.updateTask(this.query).subscribe((response: any) => {
      if(response) {
        this.isLoading = true;
        this.fetchMyTasks(true);
      } else {
        //error
      }
    });
  }

  addTask() {
    this.tasks.push({
      description: this.tasksForm.value.item,
      done: false
    })
  }

   openCreateNewTaskModal() {
      const config = new MatDialogConfig();
  
      config.autoFocus = false;
      config.disableClose = false;
      config.viewContainerRef = this._viewContainerRef;
      config.hasBackdrop = true;
      config.minWidth = '40vw';
      config.maxWidth = '40vw';
      config.minHeight = '70vh';
      config.maxHeight = '70vh';
      config.panelClass = 'custom-dialog-container';
      self.dialogRef = this._dialog.open(CreateNewTaskComponent, config);
      self.dialogRef.componentInstance.data = [];
      self.dialogRef.componentInstance.userId = this.userId;
      self.dialogRef.componentInstance.influencerLists = '';
      self.dialogRef
        .afterClosed()
        .subscribe((result: any) => {
          self.dialogRef = null;
          if (result) {
            this.isLoading = true;
            this.fetchMyTasks(true);
          }
        });
    }

    onUpdateTask(task: any) {
      const config = new MatDialogConfig();
  
      config.autoFocus = false;
      config.disableClose = false;
      config.viewContainerRef = this._viewContainerRef;
      config.hasBackdrop = true;
      config.minWidth = '40vw';
      config.maxWidth = '40vw';
      config.minHeight = '70vh';
      config.maxHeight = '70vh';
      config.panelClass = 'custom-dialog-container';
      self.dialogRef = this._dialog.open(CreateNewTaskComponent, config);
      self.dialogRef.componentInstance.data = [];
      self.dialogRef.componentInstance.userId = this.userId;
      self.dialogRef.componentInstance.task = task;
      self.dialogRef.componentInstance.influencerLists = '';
      self.dialogRef
        .afterClosed()
        .subscribe((result: any) => {
          self.dialogRef = null;
          if (result) {
            this.isLoading = true;
            this.fetchMyTasks(true);
          }
        });
    }

    editTask(item: any, index: number) {
      const config = new MatDialogConfig();
  
      config.autoFocus = false;
      config.disableClose = false;
      config.viewContainerRef = this._viewContainerRef;
      config.hasBackdrop = true;
      config.minWidth = '40vw';
      config.maxWidth = '40vw';
      config.minHeight = '38vh';
      config.maxHeight = '38vh';
      config.panelClass = 'custom-dialog-container';
      //self.dialogRef = this._dialog.open(UpdateTaskComponent, config);
      self.dialogRef.componentInstance.data = [];
      self.dialogRef.componentInstance.userId = this.userId;
      self.dialogRef.componentInstance.influencerLists = '';
      self.dialogRef
        .afterClosed()
        .subscribe((result: any) => {
          self.dialogRef = null;
          if (result) {
           
          }
        });
    }

    deleteTask(task: any) {
      const config = new MatDialogConfig();
  
      config.autoFocus = false;
      config.disableClose = false;
      config.viewContainerRef = this._viewContainerRef;
      config.hasBackdrop = true;
      config.minWidth = '40vw';
      config.maxWidth = '40vw';
      config.minHeight = '38vh';
      config.maxHeight = '38vh';
      config.panelClass = 'custom-dialog-container';
      //self.dialogRef = this._dialog.open(DeleteTaskComponent, config);
      self.dialogRef.componentInstance.data = [];
      self.dialogRef.componentInstance.userId = this.userId;
      self.dialogRef.componentInstance.taskId = task._id;
      self.dialogRef.componentInstance.influencerLists = '';
      self.dialogRef
        .afterClosed()
        .subscribe((result: any) => {
          self.dialogRef = null;
          if (result) {
          
          }
        });
  }


  onClearFilters() {
    if(this.query.reminder || this.query.priority || this.query.status || this.query.flagged) {
      this.query.reminder = '';
      this.query.priority = '';
      this.query.status = '';
      this.query.flagged = '';
      document.getElementById('dropdownMenuLink')!.innerHTML = 'Reminder';
      document.getElementById('dropdownMenuLink1')!.innerHTML = 'Priority';
      document.getElementById('dropdownMenuLink2')!.innerHTML = 'Status';
      document.getElementById('dropdownMenuLink3')!.innerHTML = 'Flagged';
      this.fetchMyTasks(true);
    }
  }

  dropdownSelected(menu: string, item: any) {
    document.getElementById(menu)!.innerHTML = item;

    switch(menu) {
      case 'dropdownMenuLink':
        this.query.reminder = item;
        break;
      case 'dropdownMenuLink1':
        this.query.priority = item;
        break;
      case 'dropdownMenuLink2':
        this.query.status = item;
        break;
      case 'dropdownMenuLink3':
        this.query.flagged = item;
        break;
      default:
        break;
    }
    this.isLoading = true;
    this.fetchMyTasks(true);
  }
}

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, map } from 'rxjs';

@Component({
  selector: 'app-all-filters',
  standalone: true,
  imports: [MatCheckboxModule, FormsModule, NgFor, NgIf, DragDropModule, CommonModule],
  templateUrl: './all-filters.component.html',
  styleUrls: ['./all-filters.component.scss']
})
export class AllFiltersComponent implements OnInit {
  dialog!: MatDialogRef<any>;
  isLoading: boolean = false;
  
  // Filters array
  filters: Array<any> = [
    { name: 'Exclude influencers that have already been added to a list', checked: true },
    { name: 'Exclude hidden influencers', checked: true }
  ];

  // BehaviorSubject to manage the task object
  task = new BehaviorSubject<any>({
    name: 'Parent task',
    completed: true,
    subtasks: [],
  });

  // Derived observable to compute the 'partiallyComplete' status
  partiallyComplete$ = this.task.pipe(
    map((task) => {
      if (!task.subtasks) {
        return false;
      }
      return task.subtasks.some((t: any) => t.completed) && !task.subtasks.every((t: any) => t.completed);
    })
  );

  constructor(private dialogRef: MatDialogRef<any>) {}

  ngOnInit() {
    this.dialog = this.dialogRef;
    this.loadFilters(); // Load saved checkbox values

    // Initialize subtasks based on filters
    this.task.next({
      name: 'Parent task',
      completed: this.filters.every(f => f.checked),
      subtasks: this.filters.map(filter => ({
        name: filter.name,
        completed: filter.checked
      })),
    });
  }

  update(completed: boolean, index: number) {
    this.filters[index].checked = completed;

    const currentTask = this.task.value;
    currentTask.subtasks[index].completed = completed;
    currentTask.completed = currentTask.subtasks.every((t: any) => t.completed);
    this.task.next({ ...currentTask });
  }

  applyFilters() {
    this.dialogRef.close(this.filters);
    localStorage.setItem('filters', JSON.stringify(this.filters));
  }

  // Load filter states from localStorage
  private loadFilters() {
    const savedFilters = localStorage.getItem('filters');
    if (savedFilters) {
      this.filters = JSON.parse(savedFilters);
    }
  }
}
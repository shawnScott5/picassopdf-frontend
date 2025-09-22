import { NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CreateListService } from '../create-new-list/create-new-list.service';
import { AuthService } from '../core/services/auth.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sort',
  standalone: true,
  imports: [NgFor, DragDropModule, NgIf],
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss']
})
export class SortComponent implements OnInit {
  authService = inject(AuthService);
  userId!: string;
  description: string = '';
  newInfluencer: any;
  influencerLists: Array<any> = [];
  dialog!: MatDialogRef<any>;
  isShowDetails: boolean = false;
  isLoading: boolean = false;
  isInfluencerListEmpty!: boolean;
  form!: FormGroup;
  query: any = {
    userId: '',
  }

  constructor(private dialogRef: MatDialogRef<any>,
              private _ListsService: CreateListService,
              private fb: FormBuilder,
              private _CreateListService: CreateListService
            ) { 
              
            }
  
  ngOnInit() {
    this.dialog = this.dialogRef;
    this.me();
  }

  dropdownSelected(menu: string, item: any) {
    if(!this.isInfluencerListEmpty) {
      document.getElementById(menu)!.innerHTML = item.name;
      this.form.controls['listName'].setValue(item.name);
    }
  }

  buildForm() {
    this.form = this.fb.group({
      userId: new FormControl(this.userId, [Validators.required]),
      listName: new FormControl('', [Validators.required]),
      description: new FormControl('', []),
      newInfluencer: new FormControl(this.newInfluencer, [Validators.required])
    });
  }

  me() {
    this.authService.me().subscribe({
      next: (response: any) => {
        this.userId = response.data._id;
        console.log(this.userId)
        this.query.userId = this.userId;
        this.fetchMyInfluencerLists();
      }
    })
  }

  onKeyUp(description: string) {
    this.description = description;
  }

  async fetchMyInfluencerLists() {
    this._ListsService.fetchMyInfluencerLists(this.query).subscribe((response: any) => {
      if(response) {
        this.influencerLists = response.data;
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }

      if(!this.influencerLists.length) {
        this.isInfluencerListEmpty = true;
        this.influencerLists.push({name: 'No lists exist'});
      } else {
        this.isInfluencerListEmpty = false;
      }
      this.buildForm();
    });
  }

  openMoreDetails() {
    this.isShowDetails = !this.isShowDetails;
  }

  onSave() {
    this.isLoading = true;
    if(this.description) this.form.controls['description'].setValue(this.description);
    this._CreateListService.updateList(this.form.value).subscribe((response: any) => {
      if(response) {
        this.dialog.close(true);
      } else {
        this.isLoading = false;
      }
    });
  }
}

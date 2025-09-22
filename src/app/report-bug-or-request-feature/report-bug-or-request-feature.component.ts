import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
//import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { HttpEvent } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import * as _ from 'lodash';
import { ActionsService } from '../actions/actions.service';
import { Editor, NgxEditorModule } from 'ngx-editor';
import { ToastrService } from 'ngx-toastr';

interface UploadResponse {
  imageUrl: string; // Adjust this to match your API response structure
}

@Component({
  selector: 'app-report-bug-or-feature',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, /*AngularEditorModule,*/ DragDropModule, 
    MatFormFieldModule, NgFor, MatChipsModule, MatIconModule, NgxEditorModule, NgIf],
  templateUrl: './report-bug-or-request-feature.component.html',
  styleUrls: ['./report-bug-or-request-feature.component.scss']
})

export class ReportBugOrRequestFeatureComponent implements OnInit {
  dialog!: MatDialogRef<any>;
  formControl = new FormControl(['angular']);
  html = '';
  editor!: Editor;
  editorForm!: FormGroup;
  influencer: any;
  userId!: string;
  isLoading: boolean = false;
  isReportBug!: boolean;
  influencerEmails!: Array<string>;
  toastrService = inject(ToastrService);
  editorConfig: /*AngularEditorConfig*/any = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter note description here...',
    translate: 'yes',
    width: 'auto',
    minWidth: '0',
    enableToolbar: true,
    showToolbar: true,
    defaultParagraphSeparator: '',
    defaultFontName: 'Arial',
    defaultFontSize: '2', // Default font size in pixels
    fonts: [
      {class: 'arial', name: 'Arial'},
      {class: 'times-new-roman', name: 'Times New Roman'},
      {class: 'calibri', name: 'Calibri'},
      {class: 'comic-sans-ms', name: 'Comic Sans MS'}
    ],
    customClasses: [
    ],
    uploadUrl: 'http://localhost:3000/api/uploads/image', // Your API endpoint
    //upload: (file: File) => this.handleImageUpload(file),
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['customClasses']
    ]
  };

  constructor(private dialogRef: MatDialogRef<any>, /*private angularEditorModule: AngularEditorModule, */
              private fb: FormBuilder, private _ActionsService: ActionsService, private _toastr: ToastrService) {
  }

  ngOnInit() {
    this.dialog = this.dialogRef;
    this.buildForm();
    this.editor = new Editor();
  }

  buildForm() {
    this.editorForm = this.fb.group({
      user: [this.userId, [Validators.required]],
      noteTitle: ['', [Validators.required]],
      editorContent: ['', [Validators.required]], // Initialize with empty or default value
    });
  }

  isFormValid() {
    if(this.editorForm.valid && this.editorForm.controls['editorContent'].value !== "<p></p>") {
      return true;
    }
    return false;
  }

  remove(index: number) {

  }

  addReactiveKeyword(event: any) {
    
  }

  onEditorLoaded(editor: any) {
    editor.loadDesign({
      body: {
        rows: []
      },
      counters: {
        u_row: 0,
        u_content_text: 0,
        u_content_image: 0
      }
    });

    // Set custom fonts
    editor.registerCallback('editor:ready', () => {
      editor.setConfig({
        fonts: {
        showDefaultFonts: true,
          customFonts: [
            { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
            { label: 'Georgia', value: 'Georgia, serif' },
            { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
            { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
            { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' }
          ]
        }
      });
    });
  }

  onLoadNewDesign(editor: any) { //work on injecting a template into editor
    const design = {
      body: {
        rows: [
          {
            columns: [
              {
                contents: [
                  {
                    type: 'html',
                    values: {
                      html: '<div style="color: red;">This is raw HTML content!</div>'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    };
    editor.loadDesign(design);
  }

  exportEmailDesign(editor: any) {
    editor.exportHtml((data: { design: any; html: string }) => {
      const { design, html } = data;
      this.processEmailContent(html);

      // Save or process the data in your app
      this.saveEmailData(design, html);
    });
  }

  processEmailContent(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract formatted text with tags like <b>, <i>, etc.
    const formattedContent = doc.body.innerHTML; // Keeps all inline formatting
  }

  saveEmailData(design: any, html: string) {
    // Example: Save to a server or local storage

    // Add your implementation here (e.g., send to an API)
  }

  onDesignUpdated(event: any) {
    // Capture design updates
  }

  onSend() {
    this.isLoading = true;
    const htmlContent = this.editorForm.get('editorContent')?.value; // Extract HTML content

    if(this.editorForm.valid) {
      this.isLoading = true;

      const action = this.isReportBug ? this._ActionsService.sendBug : this._ActionsService.sendFeatureSuggestion;
      action.call(this._ActionsService, this.editorForm.value).subscribe({
        next: (response: any) => {
          setTimeout(() => {
            if (response) {
              this._toastr.success('Your email was sent successfully!', 'Success', {
                toastClass: 'custom-toast',
              });
              this.dialog.close(true);
            }
            this.isLoading = false;
          }, 500);
        },
        error: () => {
          this._toastr.success('Sorry, your email could not be sent', 'Error', {
            toastClass: 'custom-toast-error',
          });
          this.isLoading = false;
        }
      });
    }
  }
}




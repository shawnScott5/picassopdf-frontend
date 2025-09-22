import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
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

interface UploadResponse {
  imageUrl: string; // Adjust this to match your API response structure
}

@Component({
  selector: 'app-report-bug-or-feature',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DragDropModule, 
    MatFormFieldModule, NgFor, MatChipsModule, MatIconModule, NgxEditorModule, NgIf],
  templateUrl: './report-bug-or-feature.component.html',
  styleUrls: ['./report-bug-or-feature.component.scss']
})

export class ReportBugOrRequestFeature implements OnInit {
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
  editorConfig: any = {
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

  constructor(private dialogRef: MatDialogRef<any>, private fb: FormBuilder, private _ActionsService: ActionsService) {
  }

  ngOnInit() {
    this.dialog = this.dialogRef;
    this.buildForm();
    this.editor = new Editor();
  }

  buildForm() {
    this.editorForm = this.fb.group({
      userId: [this.userId, [Validators.required]],
      noteTitle: ['', [Validators.required]],
      editorContent: ['', [Validators.required]], // Initialize with empty or default value
    });
  }

  isFormValid() {
    console.log(this.editorForm)
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

  onCreateNote() {
    this.isLoading = true;
    const htmlContent = this.editorForm.get('editorContent')?.value; // Extract HTML content
    console.log('HTML Content:', htmlContent);

    if(this.editorForm.valid) {
      this._ActionsService.createNote(this.editorForm.value).subscribe({
        next: (response: any) => {
          setTimeout(() => {
            if(response) {
              this.dialog.close(true);
            }
            this.isLoading = false;
          }, 500)
        },
        error: (error: Error) => {
          this.isLoading = false;
        }
      });
    }
  }
}




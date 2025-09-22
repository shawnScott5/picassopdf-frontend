import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  selectedFile: File | null = null;
  title = '';
  author = '';
  description = '';
  loading = false;
  error = '';
  dragOver = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.validateAndSetFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  validateAndSetFile(file: File) {
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/epub+zip'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.error = 'Please select a valid file type (PDF, DOCX, or EPUB)';
      return;
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      this.error = 'File size must be less than 50MB';
      return;
    }

    this.selectedFile = file;
    this.error = '';

    // Auto-fill title if not provided
    if (!this.title) {
      this.title = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
    }
  }

  async uploadBook() {
    if (!this.selectedFile || !this.title || !this.author) {
      this.error = 'Please fill in all required fields and select a file';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const formData = new FormData();
      formData.append('book', this.selectedFile);
      formData.append('title', this.title);
      formData.append('author', this.author);
      formData.append('description', this.description);

      const response = await this.apiService.post('/audiobooks/upload', formData).toPromise();
      
      // Navigate to the audiobook details page
      this.router.navigate(['/audiobooks', response.audiobook.id]);

    } catch (error: any) {
      console.error('Upload error:', error);
      this.error = error.error?.error || 'Failed to upload book. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.error = '';
  }

  getFileIcon(fileType: string): string {
    switch (fileType) {
      case 'application/pdf':
        return 'fas fa-file-pdf';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'fas fa-file-word';
      case 'application/epub+zip':
        return 'fas fa-book';
      default:
        return 'fas fa-file';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}


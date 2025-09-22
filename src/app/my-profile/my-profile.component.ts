import { NgIf } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  form!: FormGroup;
  userImage: Array<any> = [];
  authService = inject(AuthService);
  router = inject(Router);
  isLoading: boolean = false;
  isPageLoading: boolean = true;
  profileForm!: FormGroup;
  fb = inject(FormBuilder);
  imageUrl: string | ArrayBuffer | null = null;
  newProfilePicUploaded: boolean = false;
  user: any;
  selectedFile: any;
  uploadedImageUrl: any;
  uploadedImagePublicId!: string;
  isPasswordsMatching: boolean = true;
  isImageLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  toastrService = inject(ToastrService);
  cloudinaryPreset = 'avatar';
  DEFAULT_PROFILE_IMAGE = '../../assets/images/profile-user.png';
  
  constructor(private _toastr: ToastrService) {

  }

  ngOnInit() {
    this.me();
  }

  buildForm() {
    this.profileForm = this.fb.group({
      name: [this.user.name, [Validators.required]],
      email: [this.user.email, [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });
    
    this.profileForm.controls['password'].valueChanges.subscribe(() => {
      this.isBothPasswordsMatching();
    });
    this.profileForm.controls['confirmPassword'].valueChanges.subscribe(() => {
      this.isBothPasswordsMatching();
    });
  }

  canSave() {
    if (!this.isPasswordsMatching) return false;
  
    const { name, email, password, confirmPassword } = this.profileForm.controls;
  
    return name.dirty || email.dirty || (password.dirty && confirmPassword.dirty) || this.newProfilePicUploaded;
  }

  me() {
    this.authService.me().subscribe({
      next: (response: any) => {
        this.user = response.data;
        if(this.user.avatar == 'false' || !this.user.avatar) {
          this.uploadedImageUrl = this.DEFAULT_PROFILE_IMAGE;
        } else {
          this.uploadedImageUrl = this.user.avatar;
        }
        this.buildForm();
        this.isPageLoading = false;
      }, error: (error: any) => {

      }
    })
  }

  onSave() {
    this.isLoading = true;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    this.showConfirmPassword = this.showPassword;
  }
  
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if(this.selectedFile) {
      this.onUpload();
      this.newProfilePicUploaded = true;
    }
  }

  async onDeleteCloudinaryImage() {
    if (!this.uploadedImagePublicId) return;
    
    const cloudinaryDeleteUrl = `https://api.cloudinary.com/v1_1/dza3ed8yw/delete_by_token`;
    
    const body = JSON.stringify({ token: this.uploadedImagePublicId });

    const res = await fetch(cloudinaryDeleteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
    });

    const response = await res.json();
}

  async onUpload() {
    this.isImageLoading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile/*, this.selectedFile.name*/);
    formData.append('upload_preset', this.cloudinaryPreset);
    formData.append('cloud_name', 'dza3ed8yw');
    //formData.append('folder', 'your_folder_name'); // Optional: Organize files in Cloudinary
    formData.append('width', '125');  // Set width
    formData.append('height', '125'); // Set height
    formData.append('crop', 'fill');  // Crop method to ensure it fills the dimensions

    const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dza3ed8yw/image/upload';
     // Send the file to Cloudinary
     const res = await fetch(cloudinaryUrl, {method: 'POST', body: formData});
     const cloudinaryImageUrl = await res.json();
     this.uploadedImageUrl = cloudinaryImageUrl.secure_url.replace('/upload/', '/upload/w_125,h_125,c_fill/');
     this.uploadedImagePublicId = cloudinaryImageUrl.public_id;
     this.isPasswordsMatching = true;
     this.isImageLoading = false;
  }

  isBothPasswordsMatching() {
    if(this.profileForm.controls['password'].dirty && this.profileForm.controls['confirmPassword'].dirty && 
      this.profileForm.controls['password'].value != this.profileForm.controls['confirmPassword'].value) {
        this.isPasswordsMatching = false;
    } else if(this.profileForm.controls['password'].dirty && this.profileForm.controls['confirmPassword'].dirty && 
      this.profileForm.controls['password'].value == this.profileForm.controls['confirmPassword'].value) {
      this.isPasswordsMatching = true;
    }
  }

  onUpdate() {
    this.isLoading = true;
    let query: Object = { name: this.profileForm.controls['name'].value, email: this.profileForm.controls['email'].value, userId: this.user._id, avatar: this.uploadedImageUrl, password: this.profileForm.controls['password'].value };
    this.authService.updateAvatar(query).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.user = response.data;
        this._toastr.success('Your profile was updated successfully!', 'Success', {
          toastClass: 'custom-toast', // Add a custom class
        });
        this.buildForm();
      }, error: (error: any) => {

      }
    })
  }

  onCancel() {
    if(this.selectedFile) {
      this.uploadedImageUrl = '';
      this.onDeleteCloudinaryImage();
      this.newProfilePicUploaded = false;
    }
    this.profileForm.controls['password'].setValue('');
    this.profileForm.controls['confirmPassword'].setValue('');
    this.isPasswordsMatching = false;
  }
}

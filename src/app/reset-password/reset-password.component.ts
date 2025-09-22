import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  fb = inject(FormBuilder);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  token!: string;
  isLoading: boolean = false;
  showPassword: boolean = false;
  toastrService = inject(ToastrService);
  isPasswordsMatching: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private _authService: AuthService, private _toastr: ToastrService) {

  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(val => {
      this.token = val['token'];
    });
    this.buildForm();
  }

  buildForm() {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });

    this.resetForm.controls['password'].valueChanges.subscribe(() => {
      this.isBothPasswordsMatching();
    });
    this.resetForm.controls['confirmPassword'].valueChanges.subscribe(() => {
      this.isBothPasswordsMatching();
    });
  }

  canSubmit() {
    return !(this.resetForm.invalid || !this.isPasswordsMatching);
  }

  isBothPasswordsMatching() {
    if(this.resetForm.controls['password'].dirty && this.resetForm.controls['confirmPassword'].dirty && 
      this.resetForm.controls['password'].value != this.resetForm.controls['confirmPassword'].value) {
        this.isPasswordsMatching = false;
    } else if(this.resetForm.controls['password'].dirty && this.resetForm.controls['confirmPassword'].dirty && 
      this.resetForm.controls['password'].value == this.resetForm.controls['confirmPassword'].value) {
      this.isPasswordsMatching = true;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    let resetObj = {
      token: this.token,
      password: this.resetForm.value.password
    };

    this._authService.resetPassword(resetObj).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Password was reset successfully!';
        this._toastr.success('Password was reset successfully!', 'Success', {
          toastClass: 'custom-toast',
        });
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500)
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'An error occurred while resetting your password.';
        this._toastr.error(this.errorMessage, 'Error', {
          toastClass: 'custom-toast-error',
        });
      }
    });
  }
}

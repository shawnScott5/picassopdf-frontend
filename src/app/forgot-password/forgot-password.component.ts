import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  email: string = '';
  isUserFound!: boolean;
  isLoading: boolean = false;
  response: boolean = false;
  forgetForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  fb = inject(FormBuilder);
  toastrService = inject(ToastrService);

  constructor(private _authService: AuthService, private _toastr: ToastrService) {

  }

  ngOnInit() {
    this.forgetForm = this.fb.group({
      email:  ['', [Validators.required, Validators.email]]
    })
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this._authService.forgotPassword(this.forgetForm.value).subscribe({
      next: (response: any) => {
        this.response = true;
        this.isUserFound = true;
        this.isLoading = false;
        this.successMessage = 'Password reset link sent! Please check your email.';
        this._toastr.success('Reset link sent! Check your email 📧', 'Success', {
          toastClass: 'custom-toast-success',
          timeOut: 4000,
          progressBar: true
        });
      },
      error: (error: Error) => {
        this.response = true;
        this.isUserFound = false;
        this.isLoading = false;
        this.errorMessage = 'No user found with this email address.';
      }
    });
  }
}

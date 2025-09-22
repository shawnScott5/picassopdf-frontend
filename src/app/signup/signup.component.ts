import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  form: FormGroup
  signupForm: FormGroup; // Add this for template compatibility
  authService = inject(AuthService);
  router = inject(Router);
  toastrService = inject(ToastrService);
  isLoading: boolean = false;
  isSuccess: boolean = false;
  userAlreadyExists: boolean = false;
  accountAlreadyExistsOnThisDevice: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false; // Add this for template compatibility
  errorMessage: string = ''; // Add this for template compatibility
  response: boolean = false;
    
  constructor(private fb: FormBuilder, private _toastr: ToastrService) {
      this.form = this.fb.group({
        name: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
        subscription: new FormGroup({
          type: new FormControl(''),
          //isActive:  new FormControl('')
        }),
        referralCode: new FormControl('', []),
        // Company field
        companyName: new FormControl('', [Validators.required])
      })
      this.signupForm = this.form; // Set signupForm to reference the same form
  }

  ngOnInit() {
    this.fetchSubscriptionType();
    // Clear any old device keys that might block registration
    localStorage.removeItem('device_key');
  }


  fetchSubscriptionType() {
    const type = 'FREE'; //make dynamic later
    this.form.get('subscription.type')?.setValue(type);
  }

  onSubmit() {
    this.onSignUp();
  }

  async onSignUp() {
    console.log('Signup attempt started');
    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);
    
    if (this.form.valid) {
      this.isLoading = true;
      this.userAlreadyExists = false;
      this.accountAlreadyExistsOnThisDevice = false;
      this.errorMessage = ''; // Clear any previous error messages

      try {
        console.log('Sending registration request...');
        // Send registration request with form data
        this.authService.register(this.form.value).subscribe({
          next: (response: any) => {
            console.log('Registration success:', response);
            this.userAlreadyExists = false;
            this.accountAlreadyExistsOnThisDevice = false;
            this.errorMessage = ''; // Clear any error messages on success
            
            // Show success state with checkmark
            this.isLoading = false;
            this.isSuccess = true;
            this.response = true;
            
            // Redirect to login after showing checkmark
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1000);
          },
          error: (error: any) => {
            console.error('Registration error:', error);
            this.isLoading = false;
            this.response = true;
            this.accountAlreadyExistsOnThisDevice = false;
            this.userAlreadyExists = true;
            console.log('USER ALREADY EXISTS!!!!!!!!!!!!!!!!!!!!!!!!')
          }
        });
      } catch (error) {
        console.error('Registration catch error:', error);
        this.isLoading = false;
      }
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  togglePassword() {
    this.togglePasswordVisibility();
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Clear error message when user starts typing
  clearError() {
    this.errorMessage = '';
    this.userAlreadyExists = false;
    this.accountAlreadyExistsOnThisDevice = false;
  }

}

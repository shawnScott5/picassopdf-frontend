import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { NgClass, NgIf } from '@angular/common';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, RouterLink, NgClass],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loginForm: FormGroup; // Add this for template compatibility
  authService = inject(AuthService);
  router = inject(Router);
  isUserNotFound: boolean = false;
  isLoading: boolean = false;
  rememberMe: boolean = false;
  showPassword = false;
  errorMessage: string = ''; // Add this for template compatibility
  private secretKey = 'your-strong-secret-key';
  

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      rememberMe: new FormControl(false)
    });
    this.loginForm = this.form; // Set loginForm to reference the same form
  }

  ngOnInit() {
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
      this.rememberMe = true;
      const parsedData = JSON.parse(savedCredentials);
      const decryptedPassword = AES.decrypt(parsedData.password, this.secretKey).toString(Utf8);
      this.form.patchValue({
        email: parsedData.email,
        password: decryptedPassword,
        rememberMe: true // Set 'rememberMe' to true if credentials are found
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  togglePassword() {
    this.togglePasswordVisibility();
  }

  onSubmit() {
    this.onLogin();
  }
  
  async onLogin() {
    if(this.form.valid) {
      this.isLoading = true;
      this.authService.login(this.form.value).subscribe({
        next: (response: any) => {
          this.isUserNotFound = false;
          this.isLoading = false;

          // Check if "Remember Me" is checked
          if (this.rememberMe) {
            const encryptedPassword = AES.encrypt(this.form.value.password, this.secretKey).toString();
            localStorage.setItem('savedCredentials', JSON.stringify({
              email: this.form.value.email,
              password: encryptedPassword
            }));
          } else {
            localStorage.removeItem('savedCredentials');
          }

          this.router.navigate(['/app/dashboard']);
        },
        error: (error: Error) => {
          this.isUserNotFound = true;
          this.isLoading = false;
          this.errorMessage = 'Invalid email or password. Please try again.';
        }
      });
    } else {
      
    }
  }

  clicked() {
    this.rememberMe = !this.rememberMe;
  }

  onRememberMeChange(event: any) {
    this.rememberMe = event.target.checked;
    this.form.get('rememberMe')?.setValue(this.rememberMe);
  }
}

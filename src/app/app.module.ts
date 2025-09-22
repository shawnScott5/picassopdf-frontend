import { importProvidersFrom, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { httpInterceptor } from './core/interceptors/http.interceptor';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule, DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { PdfVaultComponent } from './pdf-vault/pdf-vault.component';
import { UploadComponent } from './pdf-vault/upload/upload.component';
import { PdfConverterComponent } from './pdf-converter/pdf-converter.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { ApiKeysComponent } from './api-keys/api-keys.component';
import { PdfLogsComponent } from './pdf-logs/pdf-logs.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LayoutComponent } from './layout/layout.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { MembershipComponent } from './membership/membership.component';
import { IntegrationsComponent } from './integrations/integrations.component';
import { HomeComponent } from './home/home.component';
import { TestApiComponent } from './test-api/test-api.component';
import { BlogComponent } from './blog/blog.component';
import { BlogPostComponent } from './blog/blog-post/blog-post.component';

@NgModule({
  declarations: [
    AppComponent,
    PdfVaultComponent,
    UploadComponent,
    PdfConverterComponent,
    DocumentationComponent,
    ApiKeysComponent,
    PdfLogsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatTooltipModule,
    CommonModule,
    ToastrModule.forRoot({ 
      closeButton: true, 
      positionClass: 'toast-bottom-right', 
      timeOut: 3000 
    }),
    LoginComponent,
    SignupComponent,
    ForgotPasswordComponent,
    LayoutComponent,
    ResetPasswordComponent,
    DashboardComponent,
    SettingsComponent,
    MembershipComponent,
    IntegrationsComponent,
    HomeComponent,
    TestApiComponent,
    BlogComponent,
    BlogPostComponent
  ],
  providers: [
    importProvidersFrom(HttpClientModule), 
    provideHttpClient(withInterceptors([httpInterceptor])), 
    provideAnimations(),
    DatePipe,
    TitleCasePipe,
    DecimalPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LayoutComponent } from './layout/layout.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { MembershipComponent } from './membership/membership.component';
import { IntegrationsComponent } from './integrations/integrations.component';
import { HomeComponent } from './home/home.component';
import { PdfConverterComponent } from './pdf-converter/pdf-converter.component';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { PdfVaultComponent } from './pdf-vault/pdf-vault.component';
import { UploadComponent } from './pdf-vault/upload/upload.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { ApiKeysComponent } from './api-keys/api-keys.component';
import { TestApiComponent } from './test-api/test-api.component';
import { PdfLogsComponent } from './pdf-logs/pdf-logs.component';
import { BlogComponent } from './blog/blog.component';
import { BlogPostComponent } from './blog/blog-post/blog-post.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full', title: 'Best HTML to PDF API — Convert HTML to PDF Programmatically' },
  { path: 'home', component: HomeComponent, title: 'Best HTML to PDF API — Convert HTML to PDF Programmatically'},
  { path: 'login', canActivate: [guestGuard], component: LoginComponent, title: 'PicassoPDF — Login'},
  { path: 'signup', component: SignupComponent, title: 'PicassoPDF — Signup'},
  { path: 'forgot-password', component: ForgotPasswordComponent, title: 'PicassoPDF — Forgot Password' },
  { path: 'reset-password/:token', component: ResetPasswordComponent, title: 'PicassoPDF — Reset Password' },
  { path: 'docs', component: DocumentationComponent, title: 'PicassoPDF — Documentation' },
  { path: 'blog', component: BlogComponent, title: 'PicassoPDF — Blog' },
  { path: 'blog/:slug', component: BlogPostComponent, title: 'PicassoPDF — Blog Post' },
  {
      path: 'app', 
      component: LayoutComponent,
      children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
              path: 'dashboard',
              canActivate: [authGuard],
              component: DashboardComponent,
              title: 'PicassoPDF — Dashboard'
          },
          {
              path: 'newsletter-to-podcast',
              canActivate: [authGuard],
              component: HomeComponent,
              title: 'PicassoPDF — Dashboard'
          },
          {
              path: 'voice-selection',
              canActivate: [authGuard],
              component: DashboardComponent, // Placeholder until VoiceSelectionComponent is created
              title: 'PicassoPDF — Dashboard'
          },
          {
              path: 'script-editor',
              canActivate: [authGuard],
              component: DashboardComponent, // Placeholder until ScriptEditorComponent is created
              title: 'PicassoPDF — Dashboard'
          },
          {
              path: 'audio-generation',
              canActivate: [authGuard],
              component: IntegrationsComponent, // Will be replaced with AudioGenerationComponent
              title: 'PicassoPDF — Dashboard'
          },
          {
              path: 'export-distribution',
              canActivate: [authGuard],
              component: SettingsComponent, // Will be replaced with ExportDistributionComponent
              title: 'PicassoPDF — Dashboard'
          },
          {
              path: 'api-keys',
              canActivate: [authGuard],
              component: ApiKeysComponent,
              title: 'PicassoPDF — API Keys'
          },
          {
              path: 'test-api',
              canActivate: [authGuard],
              component: TestApiComponent,
              title: 'PicassoPDF — Test API'
          },
          {
              path: 'analytics',
              canActivate: [authGuard],
              component: MembershipComponent, // Will be replaced with AnalyticsComponent
              title: 'PicassoPDF — Dashboard'
          },
          {
              path: 'settings',
              canActivate: [authGuard],
              component: SettingsComponent,
              title: 'PicassoPDF — Settings'
          },
          {
              path: 'membership',
              canActivate: [authGuard],
              component: MembershipComponent,
              title: 'PicassoPDF — Membership'
          },
            {
                path: 'pdf-vault',
                canActivate: [authGuard],
                component: PdfVaultComponent,
                title: 'PicassoPDF — PDF Vault'
            },
            {
                path: 'pdf-logs',
                canActivate: [authGuard],
                component: PdfLogsComponent,
                title: 'PicassoPDF — PDF Logs'
            },
          
          {
              path: 'audiobooks/upload',
              canActivate: [authGuard],
              component: UploadComponent,
              title: 'PicassoPDF — Dashboard'
          }
      ]
  },
  // Catch-all route - redirect to home for any unmatched paths
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy }  // Use PathLocationStrategy (default, no hashtag)
  ]
})
export class AppRoutingModule { }
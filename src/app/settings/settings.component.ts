import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor, NgClass, TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { User } from '../core/model/common.model';
import { Router } from '@angular/router';

interface StoreIntegration {
  id: string;
  platform: 'shopify' | 'woocommerce' | 'bigcommerce';
  storeName: string;
  storeUrl: string;
  isConnected: boolean;
  lastSync: string;
}

interface EmailSettings {
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  emailSignature: string;
  defaultSubject: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  conversionAlerts: boolean;
  usageReports: boolean;
  systemUpdates: boolean;
  creditAlerts: boolean;
}

interface RecoverySettings {
  autoSendDelay: number;
  maxEmailsPerCart: number;
  discountPercentage: number;
  freeShippingThreshold: number;
  customMessage: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, TitleCasePipe, DatePipe, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  authService = inject(AuthService);
  toastrService = inject(ToastrService);
  httpClient = inject(HttpClient);
  router = inject(Router);
  formBuilder = inject(FormBuilder);

  user: User | null = null;
  isLoading = true;
  activeTab = 'profile';
  isNightMode: boolean = false;
  
  // Company Management
  newUserForm = {
    fullName: '',
    email: '',
    role: '',
    permissions: [] as string[] // Default permissions
  };
  isInvitingUser = false;
  companyMembers: any[] = [];
  showAddUserModal = false;
  editingUser: any = null;
  
  // Create Company Form
  createCompanyForm!: FormGroup;
  isCreatingCompany = false;
  
  // User search and filtering
  userSearchTerm = '';
  filteredUsers: any[] = [];
  
  
  // Available permissions for company users
  availablePermissions = [
    {
      id: 'user_management',
      name: 'Create New Users'
    },
    {
      id: 'api_keys_management',
      name: 'API Keys Management'
    },
    {
      id: 'usage_analytics',
      name: 'Usage Analytics'
    },
    {
      id: 'billing_access',
      name: 'Billing Access'
    }
  ];
  
  // Profile Settings
  profileForm = {
    firstName: '',
    lastName: '',
    email: '',
    company: ''
  };

  // Password Form
  passwordForm = {
    newPassword: '',
    confirmPassword: ''
  };

  // Store Integrations
  storeIntegrations: StoreIntegration[] = [
    {
      id: '1',
      platform: 'shopify',
      storeName: 'My Shopify Store',
      storeUrl: 'https://mystore.myshopify.com',
      isConnected: false,
      lastSync: ''
    },
    {
      id: '2',
      platform: 'woocommerce',
      storeName: 'My WooCommerce Store',
      storeUrl: 'https://mystore.com',
      isConnected: false,
      lastSync: ''
    },
    {
      id: '3',
      platform: 'bigcommerce',
      storeName: 'My BigCommerce Store',
      storeUrl: 'https://mystore.mybigcommerce.com',
      isConnected: false,
      lastSync: ''
    }
  ];

  // Email Settings
  emailSettings: EmailSettings = {
    senderName: '',
    senderEmail: '',
    replyToEmail: '',
    emailSignature: '',
    defaultSubject: 'Complete your purchase - {store_name}'
  };

  // API Settings
  apiSettings = {
    webhookUrl: '',
    callbackUrl: '',
    timeout: 120,
    maxRetries: 3
  };

  // Notification Settings
  notificationSettings: NotificationSettings = {
    emailNotifications: true,
    conversionAlerts: true,
    usageReports: true,
    systemUpdates: false,
    creditAlerts: true
  };

  // Recovery Settings
  recoverySettings: RecoverySettings = {
    autoSendDelay: 60,
    maxEmailsPerCart: 3,
    discountPercentage: 10,
    freeShippingThreshold: 50,
    customMessage: 'We noticed you left some items in your cart. Complete your purchase now and save!'
  };



  // Billing Settings
  billingSettings = {
    currentPlan: 'Free',
    nextBillingDate: '',
    paymentMethod: 'Visa ending in 4242',
    billingEmail: ''
  };

  // Payment Method Modal
  showPaymentMethodModal = false;
  isUpdatingPaymentMethod = false;
  paymentMethodForm!: FormGroup;

  // Interactive pricing properties
  monthlyConversions = 1;
  recommendedPlan: any = {
    name: 'Free',
    credits: '50',
    price: '0',
    annualPrice: '0',
    overage: '0.02',
    maxFileSize: '5MB',
    timeout: 'Up to 2 minutes'
  };

  // Pricing plans configuration
  pricingPlans = [
    {
      name: 'Free',
      minConversions: 1,
      maxConversions: 50,
      credits: '50',
      price: '0',
      annualPrice: '0',
      overage: '0.02',
      maxFileSize: '5MB',
      timeout: 'Up to 2 minutes'
    },
    {
      name: 'Starter',
      minConversions: 51,
      maxConversions: 500,
      credits: '500',
      price: '9',
      annualPrice: '90',
      overage: '0.01',
      maxFileSize: '10MB',
      timeout: 'Up to 5 minutes'
    },
    {
      name: 'Boost',
      minConversions: 501,
      maxConversions: 2500,
      credits: '2500',
      price: '24',
      annualPrice: '240',
      overage: '0.008',
      maxFileSize: '50MB',
      timeout: 'Up to 10 minutes'
    },
    {
      name: 'Growth',
      minConversions: 2501,
      maxConversions: 5000,
      credits: '5000',
      price: '39',
      annualPrice: '390',
      overage: '0.005',
      maxFileSize: '100MB',
      timeout: 'Up to 15 minutes'
    },
    {
      name: 'Business',
      minConversions: 5001,
      maxConversions: 25000,
      credits: '25000',
      price: '99',
      annualPrice: '990',
      overage: '0.003',
      maxFileSize: 'Unlimited',
      timeout: 'Up to 30 minutes'
    },
    {
      name: 'Business',
      minConversions: 25001,
      maxConversions: 50000,
      credits: '50000',
      price: '149',
      annualPrice: '1490',
      overage: '0.003',
      maxFileSize: 'Unlimited',
      timeout: 'Up to 30 minutes'
    },
    {
      name: 'Enterprise',
      minConversions: 50001,
      maxConversions: 100000,
      credits: '100000',
      price: '249',
      annualPrice: '2490',
      overage: '0.003',
      maxFileSize: 'Unlimited',
      timeout: 'Up to 30 minutes'
    },
    {
      name: 'Enterprise',
      minConversions: 100001,
      maxConversions: 250000,
      credits: '250000',
      price: '499',
      annualPrice: '4990',
      overage: '0.003',
      maxFileSize: 'Unlimited',
      timeout: 'Up to 30 minutes'
    },
    {
      name: 'Enterprise',
      minConversions: 250001,
      maxConversions: 500000,
      credits: '500000',
      price: '799',
      annualPrice: '7990',
      overage: '0.003',
      maxFileSize: 'Unlimited',
      timeout: 'Up to 30 minutes'
    },
    {
      name: 'Enterprise',
      minConversions: 500001,
      maxConversions: 1000000,
      credits: '1000000',
      price: '999',
      annualPrice: '9990',
      overage: '0.003',
      maxFileSize: 'Unlimited',
      timeout: 'Up to 30 minutes'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.initializeForms();
    this.initializePaymentMethodForm();
    this.loadUserData();
    this.loadSettings();
    this.checkNightMode();
    this.setupNightModeListener();
  }

  initializeForms() {
    this.createCompanyForm = this.formBuilder.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  initializePaymentMethodForm() {
    this.paymentMethodForm = this.formBuilder.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['', [Validators.required, Validators.minLength(2)]],
      billingAddress: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  loadUserData() {
    this.authService.me().subscribe({
      next: (response: any) => {
        this.user = response.data;
        console.log('USER DATA', this.user);
        // Extract name from the user data (assuming it might be in a name field or we'll use email)
        const nameParts = (this.user as any)?.name?.split(' ') || [];
        this.profileForm = {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: this.user?.email || '',
          company: (this.user as any)?.companyName || ''
        };
        this.billingSettings.currentPlan = this.user?.subscription?.type || 'Free';
        this.billingSettings.billingEmail = this.user?.email || '';
        
        // Always load company members (show current user as owner)
        this.loadCompanyMembers();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        // Set default values if user data fails to load
        this.user = null;
        this.profileForm = {
          firstName: '',
          lastName: '',
          email: '',
          company: ''
        };
        this.billingSettings.currentPlan = 'Free';
        this.billingSettings.billingEmail = '';
        this.isLoading = false;
      }
    });
  }


  createCompany() {
    if (this.createCompanyForm.invalid) {
      this.toastrService.error('Please fill in all required fields');
      return;
    }

    this.isCreatingCompany = true;
    
    const companyData = {
      name: this.createCompanyForm.get('companyName')?.value?.trim(),
      description: this.createCompanyForm.get('description')?.value?.trim()
    };

    this.httpClient.post('http://localhost:3000/api/organizations/create-for-user', companyData).subscribe({
      next: (response: any) => {
        this.isCreatingCompany = false;
        if (response.success) {
          this.toastrService.success('Company created successfully!');
          
          // Reset form
          this.createCompanyForm.reset();
          
          // Reload user data to get the new companyId
          this.loadUserData();
        } else {
          this.toastrService.error(response.message || 'Failed to create company');
        }
      },
      error: (error) => {
        this.isCreatingCompany = false;
        console.error('Error creating company:', error);
        this.toastrService.error(error.error?.message || 'Failed to create company');
      }
    });
  }

  loadCompanyMembers() {
    if (!this.user?.companyId) {
      console.log('No company ID found for user, showing current user only');
      // Always show the current user as a team member even without company
      this.companyMembers = [
        {
          name: this.user?.name || 'You',
          email: this.user?.email || '',
          role: this.user?.role || 'owner',
          status: 'active',
          joinedAt: new Date(),
          permissions: ['url_to_pdf', 'html_to_pdf', 'api_keys_management', 'user_management']
        }
      ];
      this.filteredUsers = [...this.companyMembers];
      return;
    }

    console.log('Loading company members for company:', this.user.companyId);
    
    this.authService.getOrganizationMembers(this.user.companyId).subscribe({
      next: (response: any) => {
        if (response.success && response.data.members) {
          this.companyMembers = response.data.members;
        } else {
          // Fallback: Always show the current user as a team member
          this.companyMembers = [
            {
              name: this.user?.name || 'You',
              email: this.user?.email || '',
              role: 'owner',
              status: 'active',
              joinedAt: new Date(),
              permissions: ['url_to_pdf', 'html_to_pdf', 'api_keys_management', 'user_management']
            }
          ];
        }
        
        // Initialize filtered users
        this.filteredUsers = [...this.companyMembers];
      },
      error: (error) => {
        console.error('Error loading company members:', error);
        // Fallback: Always show the current user as a team member
        this.companyMembers = [
          {
            name: this.user?.name || 'You',
            email: this.user?.email || '',
            role: 'owner',
            status: 'active',
            joinedAt: new Date(),
            permissions: ['url_to_pdf', 'html_to_pdf', 'api_keys_management', 'user_management']
          }
        ];
        
        // Initialize filtered users
        this.filteredUsers = [...this.companyMembers];
      }
    });
  }

  getPermissionName(permissionId: string): string {
    const permission = this.availablePermissions.find(p => p.id === permissionId);
    return permission ? permission.name : permissionId;
  }


  editUserPermissions(member: any) {
    // Pre-populate the form with existing user data
    this.newUserForm = {
      fullName: member.name || '',
      email: member.email || '',
      role: member.role || '',
      permissions: (member.permissions || []) as string[]
    };
    
    // Set the user being edited
    this.editingUser = member;
    this.showAddUserModal = true;
  }

  deleteUser(member: any) {
    if (confirm(`Are you sure you want to remove ${member.name} from your organization?`)) {
      // TODO: Implement delete user API call
      console.log('Delete user:', member);
      this.toastrService.info('Delete user functionality coming soon!');
    }
  }

  onUserSearchChange() {
    this.applyFilters();
  }


  applyFilters() {
    let filtered = [...this.companyMembers];

    // Apply search filter
    if (this.userSearchTerm.trim()) {
      const searchTerm = this.userSearchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.name?.toLowerCase().includes(searchTerm) ||
        member.email?.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredUsers = filtered;
  }


  loadSettings() {
    // Load saved settings from backend/localStorage
    const savedEmailSettings = localStorage.getItem('emailSettings');
    if (savedEmailSettings) {
      this.emailSettings = { ...this.emailSettings, ...JSON.parse(savedEmailSettings) };
    }

    const savedNotificationSettings = localStorage.getItem('notificationSettings');
    if (savedNotificationSettings) {
      this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(savedNotificationSettings) };
    }

    const savedRecoverySettings = localStorage.getItem('recoverySettings');
    if (savedRecoverySettings) {
      this.recoverySettings = { ...this.recoverySettings, ...JSON.parse(savedRecoverySettings) };
    }

    // Load saved profile data
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      this.profileForm = { ...this.profileForm, ...JSON.parse(savedProfile) };
    }
  }

  // Profile Methods
  updateProfile() {
    if (!this.user) return;

    // For now, just save to localStorage and show success message
    // In a real implementation, this would make an API call
    localStorage.setItem('userProfile', JSON.stringify(this.profileForm));
    this.toastrService.success('Profile updated successfully!', 'Success');
    
    // Uncomment the following code when the backend API is ready:
    /*
    this.httpClient.put(`/api/users/${this.user._id}`, this.profileForm).subscribe({
      next: (response) => {
        this.toastrService.success('Profile updated successfully!', 'Success');
        this.loadUserData();
      },
      error: (error) => {
        this.toastrService.error('Failed to update profile. Please try again.', 'Error');
      }
    });
    */
  }

  // Store Integration Methods
  connectStore(platform: string) {
    // Simulate store connection
    const store = this.storeIntegrations.find(s => s.platform === platform);
    if (store) {
      store.isConnected = true;
      store.lastSync = new Date().toISOString();
      this.toastrService.success(`${platform} store connected successfully!`, 'Success');
    }
  }

  disconnectStore(platform: string) {
    const store = this.storeIntegrations.find(s => s.platform === platform);
    if (store) {
      store.isConnected = false;
      store.lastSync = '';
      this.toastrService.success(`${platform} store disconnected.`, 'Success');
    }
  }

  syncStore(platform: string) {
    const store = this.storeIntegrations.find(s => s.platform === platform);
    if (store && store.isConnected) {
      store.lastSync = new Date().toISOString();
      this.toastrService.success(`${platform} store synced successfully!`, 'Success');
    }
  }

  // API Settings Methods
  saveApiSettings() {
    localStorage.setItem('apiSettings', JSON.stringify(this.apiSettings));
    this.toastrService.success('API settings saved successfully!', 'Success');
  }

  // Email Settings Methods
  saveEmailSettings() {
    localStorage.setItem('emailSettings', JSON.stringify(this.emailSettings));
    this.toastrService.success('Email settings saved successfully!', 'Success');
  }

  // Notification Settings Methods
  saveNotificationSettings() {
    localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    this.toastrService.success('Notification settings saved successfully!', 'Success');
  }

  // Recovery Settings Methods
  saveRecoverySettings() {
    localStorage.setItem('recoverySettings', JSON.stringify(this.recoverySettings));
    this.toastrService.success('Recovery settings saved successfully!', 'Success');
  }

  // Password Change Method
  changePassword() {
    if (!this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
      this.toastrService.error('Please fill in all password fields.', 'Error');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toastrService.error('New passwords do not match.', 'Error');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.toastrService.error('New password must be at least 8 characters long.', 'Error');
      return;
    }

    // For now, just show success message and clear form
    // In a real implementation, this would make an API call
    this.toastrService.success('Password changed successfully!', 'Success');
    this.passwordForm = {
      newPassword: '',
      confirmPassword: ''
    };

    // Uncomment the following code when the backend API is ready:
    /*
    this.httpClient.post('/api/auth/change-password', {
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: (response) => {
        this.toastrService.success('Password changed successfully!', 'Success');
        this.passwordForm = {
          newPassword: '',
          confirmPassword: ''
        };
      },
      error: (error) => {
        this.toastrService.error('Failed to change password. Please try again.', 'Error');
      }
    });
    */
  }

  // Payment Method Modal Methods
  openPaymentMethodModal() {
    this.showPaymentMethodModal = true;
    this.paymentMethodForm.reset();
  }

  closePaymentMethodModal() {
    this.showPaymentMethodModal = false;
    this.paymentMethodForm.reset();
  }

  // Billing Methods
  updatePaymentMethod() {
    if (this.paymentMethodForm.invalid) {
      this.paymentMethodForm.markAllAsTouched();
      return;
    }

    this.isUpdatingPaymentMethod = true;
    
    // Simulate API call
    setTimeout(() => {
      const formData = this.paymentMethodForm.value;
      const lastFourDigits = formData.cardNumber.replace(/\s/g, '').slice(-4);
      const cardType = this.getCardType(formData.cardNumber);
      
      // Update the billing settings
      this.billingSettings.paymentMethod = `${cardType} ending in ${lastFourDigits}`;
      
      this.isUpdatingPaymentMethod = false;
      this.showPaymentMethodModal = false;
      this.toastrService.success('Payment method updated successfully!', 'Success');
      this.paymentMethodForm.reset();
    }, 2000);
  }

  // Card formatting methods
  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    if (formattedValue.length > 19) {
      formattedValue = formattedValue.substr(0, 19);
    }
    event.target.value = formattedValue;
    this.paymentMethodForm.patchValue({ cardNumber: formattedValue });
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
    this.paymentMethodForm.patchValue({ expiryDate: value });
  }

  formatCVV(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    event.target.value = value;
    this.paymentMethodForm.patchValue({ cvv: value });
  }

  getCardType(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    if (number.startsWith('6')) return 'Discover';
    return 'Card';
  }

  downloadInvoice() {
    this.toastrService.info('Invoice download would be implemented here.', 'Info');
  }

  // Utility Methods
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  exportData() {
    this.toastrService.info('Data export functionality would be implemented here.', 'Info');
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.toastrService.info('Account deletion would be implemented here.', 'Info');
    }
  }

  // Interactive pricing methods
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + 'M';
    } else if (num >= 1000) {
      const thousands = num / 1000;
      if (thousands % 1 === 0) {
        return thousands.toFixed(0) + 'k';
      } else {
        return thousands.toFixed(1) + 'k';
      }
    }
    return num.toString();
  }

  parseInt(value: string): number {
    return parseInt(value, 10);
  }

  onInputChange(event: any): void {
    const value = parseInt(event.target.value.replace(/[^\d]/g, ''));
    if (value && value > 0) {
      this.monthlyConversions = Math.min(value, 100000);
      this.updatePricing();
    }
  }

  updatePricing(): void {
    // Find the appropriate plan based on monthly conversions
    for (const plan of this.pricingPlans) {
      if (this.monthlyConversions >= plan.minConversions && this.monthlyConversions <= plan.maxConversions) {
        this.recommendedPlan = plan;
        break;
      }
    }
  }

  goToSignup(): void {
    this.router.navigate(['/membership']);
  }

  checkNightMode() {
    const savedNightMode = localStorage.getItem('nightMode');
    this.isNightMode = savedNightMode === 'true';
    this.applyNightMode();
  }

  setupNightModeListener() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'nightMode') {
        this.isNightMode = event.newValue === 'true';
        this.applyNightMode();
      }
    });
  }

  applyNightMode() {
    const settingsContainer = document.querySelector('.settings-container');
    if (this.isNightMode) {
      settingsContainer?.classList.add('night-mode');
    } else {
      settingsContainer?.classList.remove('night-mode');
    }
  }

  // Add User Modal Methods
  openAddUserModal() {
    this.editingUser = null;
    this.showAddUserModal = true;
    this.resetNewUserForm();
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
    this.editingUser = null;
    this.resetNewUserForm();
  }

  resetNewUserForm() {
    this.newUserForm = {
      fullName: '',
      email: '',
      role: '',
      permissions: [] as string[]
    };
  }

  togglePermission(permissionId: string) {
    const index = this.newUserForm.permissions.indexOf(permissionId);
    if (index > -1) {
      this.newUserForm.permissions.splice(index, 1);
    } else {
      this.newUserForm.permissions.push(permissionId);
    }
  }

  saveUser() {
    if (this.isInvitingUser || !this.user?.companyId) return;

    this.isInvitingUser = true;

    const userData = {
      email: this.newUserForm.email,
      role: this.newUserForm.role
    };

    if (this.editingUser) {
      // Editing existing user - TODO: Implement update user API
      console.log('Updating user:', userData);
      this.toastrService.info('Update user functionality coming soon!', 'Info');
      this.isInvitingUser = false;
    } else {
      // Adding new user
      console.log('Inviting new user:', userData);
      
      this.authService.inviteUser(this.user.companyId, userData).subscribe({
        next: (response: any) => {
          if (response.success) {
            // Add the new user to the local array for immediate UI update
            const newUser = {
              name: this.newUserForm.fullName,
              email: userData.email,
              role: userData.role,
              status: 'pending',
              joinedAt: new Date(),
              permissions: this.newUserForm.permissions
            };
            
            this.companyMembers.push(newUser);
            this.filteredUsers = [...this.companyMembers];
            
            this.toastrService.success('User invitation sent successfully!', 'Success');
            this.closeAddUserModal();
          } else {
            this.toastrService.error(response.message || 'Failed to invite user', 'Error');
          }
          this.isInvitingUser = false;
        },
        error: (error) => {
          console.error('Error inviting user:', error);
          this.toastrService.error(error.error?.message || 'Failed to invite user. Please try again.', 'Error');
          this.isInvitingUser = false;
        }
      });
    }
  }
} 
import { NgClass, NgIf } from '@angular/common';
import { Component, inject, OnInit, ViewContainerRef } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { CheckoutScreenComponent } from '../checkout-screen/checkout-screen.component';
import { User } from '../core/model/common.model';
import { SubscriptionService } from './membership.component.service';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { CancelMembershipConfirmationComponent } from '../cancel-membership-confirmation/cancel-membership-confirmation.component';
import { catchError, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StripeCustomService } from '../core/services/stripe-custom.service';

let self: any;
@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [NgIf, NgClass, FormsModule],
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss']
})
export class MembershipComponent implements OnInit {
  dialog!: MatDialogRef<any>;
  isUserSubscribed!: boolean;
  isLoading: boolean = true;
  isNightMode: boolean = false;
  isOpeningStarter: boolean = false;
  isOpeningPro: boolean = false;
  isOpeningAdvanced: boolean = false;
  isDisplayYearly: boolean = false;
  isCancelingPro: boolean = false;
  isCancelingAdvanced: boolean = false;
  currentPlan: string = '';
  mySubscriptionId: string = '';
  authService = inject(AuthService);
  toastrService = inject(ToastrService);
  userId!: string;
  user!: User;
  stripeProductIds: Array<any> = [];
  query = {
    userId: ''
  }

  // Interactive pricing properties
  monthlyConversions = 1000;
  pricePerCredit: number = 0.005;
  isProcessingPayment: boolean = false;

  constructor(public _dialog: MatDialog, public _viewContainerRef: ViewContainerRef, private _toastr: ToastrService,
              private HttpClient: HttpClient, private SubscriptionService: SubscriptionService, private router: Router,
              private stripeCustomService: StripeCustomService) {
    self = this;
  }

  ngOnInit() {
    this.me();
    this.fetchProductIds();
    this.checkNightMode();
    this.setupNightModeListener();
    this.updatePricing();
  }

  fetchProductIds() {
    this.SubscriptionService.fetchAllProductIds({}).subscribe({
      next: (response: any) => {
        this.stripeProductIds = response.data;
      }
    })
  }

  fetchSubscriptionDetails() {
    if(this.user.stripeSessionId && !this.user.stripeSubscriptionId) {
      let baseURL: string = '';

      if(this.user.subscription.type === 'FREE') {
        //baseURL = "http://localhost:3000/api/subscribe-stripe/details";
        baseURL = 'https://api.picassopdf.com/api/subscribe-stripe/details';
      } else if(this.user.subscription.type === 'PRO') {
        //baseURL = "http://localhost:3000/api/subscribe-stripe-pro/details";
        baseURL = 'https://api.picassopdf.com/api/subscribe-stripe-pro/details';
      } else if(this.user.subscription.type === 'SCALE') {
        //baseURL = "http://localhost:3000/api/subscribe-stripe-scale/details";
        baseURL = 'https://api.picassopdf.com/api/subscribe-stripe-scale/details';
        //baseURL = "https://distros-8f63ee867795.herokuapp.com/api/subscribe-stripe-pro/details";
      } else if(this.user.subscription.type === 'CUSTOM') {
        //baseURL = "http://localhost:3000/api/subscribe-stripe-custom/details";
        baseURL = 'https://api.picassopdf.com/api/subscribe-stripe-custom/details';
        //baseURL = "https://distros-8f63ee867795.herokuapp.com/api/subscribe-stripe-custom/details";
      }

      this.HttpClient.post<{ status: string }>(baseURL, { sessionId: this.user.stripeSessionId, user: this.user })
        .subscribe(response => {
          if(response) {
            const subscriptionStatus = response.status;
            if(subscriptionStatus != 'active') {
              //reset status to FREE Plant
            }
          }
        });
    }
  }
  
  subscribeToPro() {
    this.isOpeningPro = true;
    setTimeout(() => {
      //const baseURL: string = "http://localhost:3000/api/subscribe-stripe-pro";
      const baseURL: string = 'https://api.picassopdf.com/api/subscribe-stripe-pro';
      //const baseURL: string = "https://distros-8f63ee867795.herokuapp.com/api/subscribe-stripe-pro";

      const plan = _.find(this.stripeProductIds, { plan: 'Pro' });
      //const plan = _.find(this.stripeProductIds, { plan: 'Testing' });
      this.HttpClient.post<{ session: any }>(baseURL, { priceId: plan.stripePriceId, userId: this.userId })
      .subscribe(response => {
        window.location.href = response.session.url;
        //toastr success message
        this.isOpeningPro = false;
      });
    }, 250)
  }

  subscribeToScale() {
    this.isOpeningAdvanced = true;
    setTimeout(() => {
    //const baseURL: string = "http://localhost:3000/api/subscribe-stripe-scale";
    const baseURL: string = 'https://api.picassopdf.com/api/subscribe-stripe-scale';
    //const baseURL: string = "https://distros-8f63ee867795.herokuapp.com/api/subscribe-stripe-scale";

      const plan = _.find(this.stripeProductIds, { plan: 'Scale' });
      //const plan = _.find(this.stripeProductIds, {plan: 'Testing'});
      this.HttpClient.post<{ session: any }>(baseURL, { priceId: plan.stripePriceId, userId: this.userId })
      .subscribe(response => {
        window.location.href = response.session.url;
        this.isOpeningAdvanced = false;
      });
    }, 250);
  }

  me() {
    this.authService.me().subscribe({
      next: (response: any) => {
        this.user = response.data;
        this.userId = response.data._id;
        this.query.userId = response.data._id;
        this.currentPlan = `${response.data.subscription?.type.charAt(0).toUpperCase()}${response.data.subscription?.type.slice(1).toLowerCase()}`;
        //this.isUserSubscribed = response.data.subscription?.type !== 'FREE TRIAL';
        this.isLoading = false;
        
        // Auto-set slider and recommended plan based on current plan
        this.setCurrentPlanDefaults();
      }
    })
  }

  setCurrentPlanDefaults(): void {
    // Set default credits based on current plan
    switch (this.currentPlan.toLowerCase()) {
      case 'free':
        this.monthlyConversions = 50;
        break;
      case 'starter':
        this.monthlyConversions = 300;
        break;
      case 'growth':
        this.monthlyConversions = 2500;
        break;
      case 'scale':
        this.monthlyConversions = 25000;
        break;
      case 'small business':
        this.monthlyConversions = 75000;
        break;
      case 'medium business':
        this.monthlyConversions = 300000;
        break;
      case 'enterprise':
        this.monthlyConversions = 750000;
        break;
      default:
        this.monthlyConversions = 1000;
        break;
    }
    
    // Update the slider background
    setTimeout(() => {
      this.updateSliderBackground();
    }, 100);
  }

  cancelPro() {
    const config = new MatDialogConfig();
          
    config.autoFocus = false;
    config.disableClose = false;
    config.viewContainerRef = this._viewContainerRef;
    config.hasBackdrop = true;
    config.minWidth = '40vw';
    config.maxWidth = '40vw';
    config.minHeight = '30vh';
    config.maxHeight = '30vh';
    config.panelClass = 'custom-dialog-container';
      self.dialogRef = this._dialog.open(CancelMembershipConfirmationComponent, config);
      self.dialogRef.componentInstance.userId = this.userId;
      self.dialogRef
        .afterClosed()
        .subscribe((response: any) => {
          self.dialogRef = null;
          if (response) {
            this.isCancelingPro = true;
            //const baseURL: string = "http://localhost:3000/api/subscribe-stripe-pro/cancel";
            const baseURL: string = 'https://api.picassopdf.com/api/subscribe-stripe-pro/cancel';
            //const baseURL: string = "https://distros-8f63ee867795.herokuapp.com/api/subscribe-stripe-pro/cancel";

            this.HttpClient.post<{ session: any }>(baseURL, { subscriptionId: this.user.stripeSubscriptionId, userId: this.userId })
            .pipe(
              catchError(error => {
                this.isCancelingPro = false;
                this._toastr.success('Failed to cancel your membership. Please contact support.', 'Error', {
                  toastClass: 'custom-toast-red',
                });
                return throwError(() => error); // Rethrow the error if needed
              })
            ).subscribe(response => {
                if(response) {
                  this.isCancelingPro = false;
                  this.me();
                  this._toastr.success('Your membership was successfully canceled!', 'Success', {
                    toastClass: 'custom-toast', // Add a custom class
                  });
                }
              });
            }
        });
  }

  cancelScale() {
    const config = new MatDialogConfig();
          
    config.autoFocus = false;
    config.disableClose = false;
    config.viewContainerRef = this._viewContainerRef;
    config.hasBackdrop = true;
    config.minWidth = '40vw';
    config.maxWidth = '40vw';
    config.minHeight = '30vh';
    config.maxHeight = '30vh';
    config.panelClass = 'custom-dialog-container';
      self.dialogRef = this._dialog.open(CancelMembershipConfirmationComponent, config);
      self.dialogRef.componentInstance.userId = this.userId;
      self.dialogRef
        .afterClosed()
        .subscribe((response: any) => {
          self.dialogRef = null;
          if (response) {
            this.isCancelingAdvanced = true;
            //const baseURL: string = "http://localhost:3000/api/subscribe-stripe-scale/cancel";
            const baseURL: string = 'https://api.picassopdf.com/api/subscribe-stripe-scale/cancel';
            //const baseURL: string = "https://distros-8f63ee867795.herokuapp.com/api/subscribe-stripe-scale/cancel";

            this.HttpClient.post<{ session: any }>(baseURL, { subscriptionId: this.user.stripeSubscriptionId, userId: this.userId })
            .pipe(
              catchError(error => {
                this.isCancelingAdvanced = false;
                this._toastr.success('Failed to cancel your membership. Please contact support.', 'Error', {
                  toastClass: 'custom-toast-red',
                });
                return throwError(() => error); // Rethrow the error if needed
              })
            ).subscribe(response => {
              if(response) {
                this.isCancelingAdvanced = false
                this.me();
                this._toastr.success('Your membership was successfully canceled!', 'Success', {
                  toastClass: 'custom-toast', // Add a custom class
                });
              }
            });
          }
        });
  }

  cancelCustom() {
    const dialogRef = this._dialog.open(CancelMembershipConfirmationComponent, {
      width: '400px',
      data: { planType: 'Custom' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //const baseURL: string = "http://localhost:3000/api/subscribe-stripe-custom/cancel";
        const baseURL: string = 'https://api.picassopdf.com/api/subscribe-stripe-custom/cancel';

        this.HttpClient.post(baseURL, { subscriptionId: this.user.stripeSubscriptionId, userId: this.userId })
          .pipe(
            catchError((error: any) => {
              this._toastr.success('Failed to cancel your membership. Please contact support.', 'Error', {
                toastClass: 'custom-toast-red',
              });
              return throwError(() => error);
            })
          ).subscribe((response: any) => {
            if(response) {
              this.me();
              this._toastr.success('Your membership was successfully canceled!', 'Success', {
                toastClass: 'custom-toast',
              });
            }
          });
      }
    });
  }

  onClickMonthly() {
    this.isDisplayYearly = false;
  }

  onClickYearly() {
    this.isDisplayYearly = true;
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

  getEstimatedCredits(): number {
    // 1 credit = 1 PDF page (simple pricing model)
    return this.monthlyConversions;
  }

  getSubscriptionTier(credits: number): string {
    if (credits <= 50) {
      return 'FREE';
    } else if (credits <= 500) {
      return 'STARTER';
    } else if (credits <= 5000) {
      return 'GROWTH';
    } else if (credits <= 50000) {
      return 'SCALE';
    } else if (credits <= 100000) {
      return 'SMALL_BUSINESS';
    } else if (credits <= 500000) {
      return 'MEDIUM_BUSINESS';
    } else {
      return 'ENTERPRISE';
    }
  }

  getTierDisplayName(tier: string): string {
    const tierNames: { [key: string]: string } = {
      'FREE': 'Free',
      'STARTER': 'Starter',
      'GROWTH': 'Growth',
      'SCALE': 'Scale',
      'SMALL_BUSINESS': 'Small Business',
      'MEDIUM_BUSINESS': 'Medium Business',
      'ENTERPRISE': 'Enterprise'
    };
    return tierNames[tier] || 'Free';
  }

  getCurrentTier(): string {
    return this.getSubscriptionTier(this.monthlyConversions);
  }

  parseInt(value: string): number {
    return parseInt(value, 10);
  }

  onInputChange(event: any): void {
    const value = event.target.value.replace(/[^0-9]/g, ''); // Remove all non-numeric characters
    const numValue = parseInt(value) || 0;
    
    if (numValue >= 1000 && numValue <= 1000000) {
      this.monthlyConversions = numValue;
      this.updatePricing();
      // Format the display with commas
      event.target.value = this.formatNumberWithCommas(numValue);
    }
  }

  onInputBlur(event: any): void {
    // On blur, ensure the input shows the formatted number with commas
    event.target.value = this.formatNumberWithCommas(this.monthlyConversions);
  }

  formatNumberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  updatePricing(): void {
    this.updateSliderBackground();
  }

  getTotalPrice(): number {
    // Use the same rounding logic as formatNumber for consistency
    let roundedCredits = this.monthlyConversions;
    
    if (this.monthlyConversions >= 1000000) {
      roundedCredits = Math.round(this.monthlyConversions / 1000000) * 1000000;
    } else if (this.monthlyConversions >= 1000) {
      const thousands = this.monthlyConversions / 1000;
      roundedCredits = Math.round(thousands * 10) / 10 * 1000; // Round to 1 decimal place
    }
    
    // Special case for 1M credits
    if (roundedCredits === 1000000) {
      return 999;
    }
    
    // Tiered pricing based on credit amount
    let pricePerCredit = 0.005; // Default for 1k-24,999 credits
    
    if (roundedCredits >= 250000) {
      pricePerCredit = 0.001; // 250k+ credits
    } else if (roundedCredits >= 100000) {
      pricePerCredit = 0.002; // 100k-249,999 credits
    } else if (roundedCredits >= 50001) {
      pricePerCredit = 0.003; // 50,001-99,999 credits
    } else if (roundedCredits >= 25000) {
      pricePerCredit = 0.004; // 25k-50k credits
    }
    
    return roundedCredits * pricePerCredit;
  }

  getFormattedPrice(): string {
    // Show "Free" for the free plan (50 credits)
    if (this.monthlyConversions === 50) {
      return 'Free';
    }
    
    const price = this.getTotalPrice();
    // If the price has decimal places, show 2 decimal places, otherwise show none
    if (price % 1 === 0) {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    } else {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  }

  updateSliderBackground(): void {
    setTimeout(() => {
      const slider = document.querySelector('.conversion-slider') as HTMLInputElement;
      if (slider) {
        const value = parseInt(slider.value);
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        const percentage = ((value - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(to right, var(--primary-red) 0%, var(--primary-red) ${percentage}%, #e9ecef ${percentage}%, #e9ecef 100%)`;
      }
    }, 0);
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
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
    const membershipContainer = document.querySelector('.membership-container');
    if (this.isNightMode) {
      membershipContainer?.classList.add('night-mode');
    } else {
      membershipContainer?.classList.remove('night-mode');
    }
  }

  setCredits(credits: number) {
    this.monthlyConversions = credits;
    this.updatePricing();
  }

  isButtonDisabled(): boolean {
    // Disable button if user is on free plan and has selected free plan (50 credits)
    if (this.currentPlan.toLowerCase() === 'free' && this.monthlyConversions === 50) {
      return true;
    }
    // Also disable if payment is processing
    return this.isProcessingPayment;
  }

  async startCustomSubscription() {
    this.isProcessingPayment = true;

    try {
      const totalPrice = this.getTotalPrice();
      const credits = this.monthlyConversions;

      let userId = null;
      let customerEmail = null;

      // If user is logged in, get their details
      if (this.authService.isLoggedIn) {
        try {
          const userResponse = await this.authService.me().toPromise();
          if (userResponse && userResponse.data) {
            userId = userResponse.data._id;
            customerEmail = userResponse.data.email;
          }
        } catch (error) {
          console.log('User not found, proceeding without user ID');
        }
      }

      const subscriptionTier = this.getSubscriptionTier(credits);
      
      const subscriptionRequest = {
        credits: credits,
        userId: userId,
        price: totalPrice,
        customerEmail: customerEmail,
        tier: subscriptionTier
      };

      // Create Stripe checkout session
      console.log('Creating subscription request:', subscriptionRequest);
      const response = await this.stripeCustomService.createCustomSubscription(subscriptionRequest).toPromise();
      console.log('Stripe response:', response);
      
      if (response && response.session && response.session.url) {
        // Redirect to Stripe checkout
        window.location.href = response.session.url;
      } else {
        this._toastr.error('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating custom subscription:', error);
      console.error('Error details:', error);
      this._toastr.error('An error occurred while processing your request. Please try again.');
    } finally {
      this.isProcessingPayment = false;
    }
  }

}

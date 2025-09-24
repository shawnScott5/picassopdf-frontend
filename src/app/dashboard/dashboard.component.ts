import { Component, ElementRef, inject, OnInit, OnDestroy, ViewChild, ViewContainerRef, HostListener } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { User } from '../core/model/common.model';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { YourMatchesComponent } from '../your-matches/your-matches.component';
import { Router } from '@angular/router';
import { apiKeysService } from '../api-keys/api-keys.service';
import { ConversionsService } from '../services/conversions.service';

interface CreditUsageData {
  date: string;
  credits: number;
  displayDate: string;
}

let self: any;
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, NgClass, NgFor],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('videoRef1') videoRef1!: any;
  @ViewChild('videoRef2') videoRef2!: any;
  @ViewChild('videoRef3') videoRef3!: any;
  @ViewChild('videoRef4') videoRef4!: any;
  @ViewChild('videoRef5') videoRef5!: any;
  @ViewChild('videoRef6') videoRef6!: any;
  @ViewChild('videoRef7') videoRef7!: any;
  @ViewChild('videoRef8') videoRef8!: any;
  @ViewChild('videoRef9') videoRef9!: any;
  @ViewChild('videoRef10') videoRef10!: any;
  @ViewChild('videoRef11') videoRef11!: any;
  @ViewChild('videoRef12') videoRef12!: any;
  authService = inject(AuthService);
  user: User | any = {};
  router = inject(Router);
  isNightMode: boolean = false;
  
  // API Keys
  apiKeys: any[] = [];
  apiKeysLoading = false;

  // Real Conversion Data
  allConversions: any[] = [];
  conversionsLoading = false;

  // Credit Usage Data
  creditUsageData: CreditUsageData[] = [];
  totalCreditsUsed: number = 0;
  creditsResetDays: number = 30;
  selectedTimeRange: string = 'Last 30 days';
  selectedApiKey: string = 'All API keys';
  
  // Custom dropdown states
  showTimeRangeDropdown: boolean = false;
  showApiKeyDropdown: boolean = false;
  
  // Math object for template usage
  Math = Math;

  // Format number with commas
  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  // Get current plan
  getCurrentPlan(): string {
    if (this.user && this.user.subscription && this.user.subscription.type) {
      return `${this.user.subscription.type.charAt(0).toUpperCase()}${this.user.subscription.type.slice(1).toLowerCase()}`;
    }
    return 'Free';
  }

  // Tooltip state
  showTooltip: boolean = false;
  tooltipData: { date: string; credits: number } | null = null;
  tooltipPosition: { x: number; y: number } = { x: 0, y: 0 };
  private tooltipTimeout: any = null;

  // Resize handler
  private handleResize: (() => void) | null = null;
  private resizeTimeout: any = null;

  // Computed properties for SVG
  get polylinePoints(): string {
    return this.creditUsageData.map((data, index) => {
      const pos = this.getPointPosition(index, data.credits);
      return pos.x + ',' + pos.y;
    }).join(' ');
  }

  private cachedGraphDataPoints: Array<{data: CreditUsageData, index: number, position: {x: number, y: number}}> = [];

  get graphDataPoints(): Array<{data: CreditUsageData, index: number, position: {x: number, y: number}}> {
    // Only recalculate if data has changed
    if (this.cachedGraphDataPoints.length !== this.creditUsageData.length) {
      this.cachedGraphDataPoints = this.creditUsageData.map((data, index) => ({
        data,
        index,
        position: this.getPointPosition(index, data.credits)
      }));
    }
    return this.cachedGraphDataPoints;
  }

  get visibleLabels(): Array<{data: CreditUsageData, index: number, position: {x: number, y: number}}> {
    const labels = this.creditUsageData
      .map((data, index) => ({
        data,
        index,
        position: this.getPointPosition(index, data.credits)
      }));
    
    // Show fewer labels for 90-day view to prevent overlapping
    if (this.selectedTimeRange.includes('90')) {
      const filtered = labels.filter((_, index) => index % 6 === 0);
      // Ensure the last label (today) is always shown
      const lastLabel = labels[labels.length - 1];
      if (lastLabel && !filtered.some(label => label.index === lastLabel.index)) {
        filtered.push(lastLabel);
      }
      return filtered;
    } else if (this.selectedTimeRange.includes('7')) {
      return labels.filter((_, index) => index % 1 === 0); // Show every label for 7 days
    } else {
      const filtered = labels.filter((_, index) => index % 3 === 0);
      // Ensure the last label (today) is always shown
      const lastLabel = labels[labels.length - 1];
      if (lastLabel && !filtered.some(label => label.index === lastLabel.index)) {
        filtered.push(lastLabel);
      }
      return filtered;
    }
  }

  // Revenue & Client Data
  recurringRevenue: any = '$0';
  thisMonthRevenue: any = '$0';
  newClients: number = 0;
  totalClients: number = 0;

  // Internal Counters
  recurringRevenueCounter: number = 0;
  thisMonthRevenueCounter: number = 0;
  newClientsCounter: number = 0;
  totalClientsCounter: number = 0;

  //Analytics
  recurringRevenueChange: number = 0;
  totalRevenueChange: number = 0;
  newClientsChange: number = 0;
  totalClientsChange: number = 0;

  // Flags to track intervals
  isWithinTen1: boolean = false;
  isWithinTen2: boolean = false;

  // Interval Identifiers
  recurringRevenueStop: any;
  thisMonthRevenueStop: any;
  newClientsStop: any;
  totalClientsStop: any;

  // Update Query Template
  updateQuery = {
    userId: '',
    lastMonthRevenue: null,
    thisMonthRevnue: null,
    recurringRevenue: null,
    newClients: 0,
    clientsLastMonth: null,
    totalClients: null,
  };

  constructor(private HttpClient: HttpClient, public _viewContainerRef: ViewContainerRef, public _dialog: MatDialog, private apiKeysService: apiKeysService, private conversionsService: ConversionsService) {
    self = this;
    this.authService.me().subscribe({
      next: (response: any) => {
        this.user = response.data;
        console.log('USER:', this.user);
  
        if (this.user) {
          this.startRevenueCounter();
          this.startClientsCounter();
          this.startMonthlyRevenueCounter();
          this.startTotalClientsCounter();

          //analytics
          this.calculateRecurringRevenueChange();
          this.calculateTotalRevenueChange();
          this.calculateNewClientsChange();
          this.calculateTotalClientsChange();
        }
  
        this.clearCachedData();
        this.checkFirstOfMonthAndCalculate();
        this.loadApiKeys();
        this.loadConversions();
      }
    });
  }

  ngOnInit() {
    // Load night mode preference from localStorage
    const savedNightMode = localStorage.getItem('nightMode');
    this.isNightMode = savedNightMode === 'true';
    this.applyNightMode();
    
    // Add window resize listener for responsive graph
    this.handleResize = () => {
      // Use debounced resize to prevent excessive recalculations
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.recalculateGraph();
      }, 150);
    };
    
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy() {
    // Clean up event listener
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }
    
    // Clean up tooltip timeout
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
    
    // Clean up resize timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  initializeCreditUsageData() {
    // For now, generate sample data
    // In a real application, this would fetch from an API
    // Generate initial data based on the default selected time range (30 days)
    this.generateSampleCreditData(30);
  }

  clearCachedData() {
    console.log('🧹 Clearing cached data...');
    this.allConversions = [];
    this.creditUsageData = [];
    this.totalCreditsUsed = 0;
  }

  loadApiKeys() {
    this.apiKeysLoading = true;
    
    // Pass user information to filter API keys by user (same as API keys component)
    const userParams: any = {
      userId: this.user?._id || ''
    };
    
    // Only add organizationId if it exists and is not empty
    if (this.user?.organizationId) {
      userParams.organizationId = this.user.organizationId;
    }

    console.log('Loading API keys for dashboard with params:', userParams);

    this.apiKeysService.getApiKeys(userParams).subscribe({
      next: (response: any) => {
        console.log('Dashboard API keys response:', response);
        if (response.success && response.data) {
          this.apiKeys = response.data;
        } else {
          this.apiKeys = [];
        }
        this.apiKeysLoading = false;
      },
      error: (error) => {
        console.error('Error loading API keys for dashboard:', error);
        this.apiKeys = [];
        this.apiKeysLoading = false;
      }
    });
  }

  loadConversions() {
    this.conversionsLoading = true;
    
    // Calculate date range for last 90 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 90);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    console.log('🔄 Loading conversions for dashboard from', startDateStr, 'to', endDateStr);
    console.log('🌍 Environment:', window.location.hostname.includes('localhost') ? 'DEVELOPMENT' : 'PRODUCTION');

    this.conversionsService.getConversionsByDateRange(startDateStr, endDateStr).subscribe({
      next: (response: any) => {
        console.log('Dashboard conversions response:', response);
        if (response.success && response.data) {
          // Filter conversions to only include those from the last 90 days
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - 90);
          
          this.allConversions = response.data.filter((conversion: any) => {
            if (!conversion.completedAt) return false;
            const conversionDate = new Date(conversion.completedAt);
            return conversionDate >= startDate && conversionDate <= endDate;
          });
          
          console.log('📊 Loaded', this.allConversions.length, 'conversions for dashboard (last 90 days)');
          console.log('📋 Sample conversions:', this.allConversions.slice(0, 3));
          
          // Debug: Log total credits from all conversions
          const totalCreditsFromAllConversions = this.allConversions.reduce((sum, conversion) => {
            return sum + (conversion.creditsUsed || 1);
          }, 0);
          console.log('💰 Total credits from ALL conversions:', totalCreditsFromAllConversions);
          
          // Debug: Check for today's conversions specifically
          const today = new Date();
          const todayStr = today.getFullYear() + '-' + 
                          String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(today.getDate()).padStart(2, '0');
          
          const todayConversions = this.allConversions.filter((conversion: any) => {
            if (!conversion.completedAt) return false;
            const conversionDate = new Date(conversion.completedAt);
            const conversionDateStr = conversionDate.getFullYear() + '-' + 
                                    String(conversionDate.getMonth() + 1).padStart(2, '0') + '-' + 
                                    String(conversionDate.getDate()).padStart(2, '0');
            return conversionDateStr === todayStr;
          });
          
          console.log('Today\'s conversions:', todayConversions.length, 'for date:', todayStr);
          console.log('Today\'s conversion details:', todayConversions);
        } else {
          this.allConversions = [];
          console.log('No conversions found in response:', response);
        }
        this.conversionsLoading = false;
        
        // Regenerate graph data with real data
        this.generateRealCreditData(30); // Start with 30 days
      },
      error: (error) => {
        console.error('Error loading conversions for dashboard:', error);
        this.allConversions = [];
        this.conversionsLoading = false;
        
        // Fall back to sample data if real data fails
        this.generateSampleCreditData(30);
      }
    });
  }

  generateRealCreditData(days: number = 30, conversions: any[] | null = null) {
    console.log('✅ Using REAL conversion data');
    const today = new Date();
    this.creditUsageData = [];
    
    // Use provided conversions or fall back to all conversions
    const conversionsToUse = conversions || this.allConversions;
    console.log('Using', conversionsToUse.length, 'conversions for data generation');
    
    // Generate data for the past N days including today
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Format date for comparison (use local date to avoid timezone issues)
      const dateStr = date.getFullYear() + '-' + 
                     String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(date.getDate()).padStart(2, '0');
      
      // Count conversions for this specific date
      const conversionsForDate = conversionsToUse.filter(conversion => {
        if (!conversion.completedAt) return false;
        
        // Parse the conversion date and compare with local date
        const conversionDate = new Date(conversion.completedAt);
        const conversionDateStr = conversionDate.getFullYear() + '-' + 
                                 String(conversionDate.getMonth() + 1).padStart(2, '0') + '-' + 
                                 String(conversionDate.getDate()).padStart(2, '0');
        
        return conversionDateStr === dateStr;
      });
      
      const creditsUsed = conversionsForDate.reduce((total, conversion) => {
        return total + (conversion.creditsUsed || 1); // Sum up creditsUsed from each conversion, default to 1 if not set
      }, 0);
      
      this.creditUsageData.push({
        date: dateStr,
        credits: creditsUsed,
        displayDate: this.formatDate(date)
      });
    }
    
    // Reverse to show oldest to newest
    this.creditUsageData.reverse();
    
    // Calculate total credits used
    this.totalCreditsUsed = this.creditUsageData.reduce((sum, data) => sum + data.credits, 0);
    
    console.log('📈 Generated real credit data for', days, 'days. Total credits used:', this.totalCreditsUsed);
    console.log('📅 Sample of creditUsageData:', this.creditUsageData.slice(0, 5));
    console.log('🔍 Environment check - API URL would be:', window.location.hostname.includes('localhost') ? 'localhost:3000' : 'api.picassopdf.com');
    
    // Debug: Log today's data specifically
    const todayStr = today.getFullYear() + '-' + 
                    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(today.getDate()).padStart(2, '0');
    const todayData = this.creditUsageData.find(data => data.date === todayStr);
    console.log('Today\'s credit usage:', todayData ? todayData.credits : 0, 'for date:', todayStr);
  }

  generateSampleCreditData(days: number = 30) {
    console.log('⚠️ WARNING: Using sample data instead of real data!');
    const today = new Date();
    this.creditUsageData = [];
    
    // Generate data for the past N days including today
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate random credit usage (0-50k credits per day) with 1k increments
      const credits = Math.floor(Math.random() * 51) * 1000; // 0, 1k, 2k, 3k... 50k
      
      this.creditUsageData.push({
        date: date.toISOString().split('T')[0],
        credits: credits,
        displayDate: this.formatDate(date)
      });
    }
    
    // Reverse the array so oldest dates come first
    this.creditUsageData.reverse();
    
    // Reset cached data when new data is generated
    this.cachedGraphDataPoints = [];
    this.calculateTotalCredits();
  }

  // Force recalculation of graph dimensions
  private recalculateGraph() {
    this.cachedGraphWidth = 800; // Reset to force recalculation
    this.cachedGraphDataPoints = [];
    this.creditUsageData = [...this.creditUsageData];
  }

  fetchCreditUsageData(timeRange: string = '30', apiKey: string = 'all') {
    // Use real conversion data if available, otherwise fall back to sample data
    const days = parseInt(timeRange);
    
    if (this.allConversions.length > 0) {
      // Filter conversions by API key if not 'all'
      let filteredConversions = this.allConversions;
      if (apiKey !== 'All API keys' && apiKey !== 'all') {
        // Note: We'd need to add API key tracking to conversions for this to work
        // For now, we'll use all conversions
        console.log('API key filtering not yet implemented, using all conversions');
      }
      
      // Generate real data with filtered conversions
      this.generateRealCreditData(days, filteredConversions);
    } else {
      // Fall back to sample data if no real data is available
      console.log('No real conversion data available, using sample data');
      this.generateSampleCreditData(days);
    }
  }

  formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${day} ${month}`;
  }

  calculateTotalCredits() {
    this.totalCreditsUsed = this.creditUsageData.reduce((sum, data) => sum + data.credits, 0);
  }
  
  getCurrentMonthlyUsage(): number {
    // Return the actual total credits used from the current data
    return this.totalCreditsUsed;
  }
  
  getCreditLimit(): number {
    // Return the plan-based credit limit
    const plan = this.getCurrentPlan();
    
    switch (plan.toLowerCase()) {
      case 'free':
        return 50;
      case 'starter':
        return 500;
      case 'boost':
        return 2500;
      case 'growth':
        return 5000;
      case 'business':
        return 25000;
      case 'enterprise':
        return 100000;
      default:
        return 50; // Default to free plan
    }
  }

  getMaxCredits(): number {
    // Use different maximums based on user's plan
    const plan = this.getCurrentPlan();
    
    switch (plan.toLowerCase()) {
      case 'free':
      case 'starter':
        return 50; // 0, 10, 20, 30, 40, 50
      case 'boost':
      case 'growth':
        return 500; // 0, 100, 200, 300, 400, 500
      case 'business':
        return 5000; // 0, 1k, 2k, 3k, 4k, 5k
      case 'enterprise':
        return 50000; // 0, 10k, 20k, 30k, 40k, 50k
      default:
        return 50; // Default to free plan scale
    }
  }

  getGraphHeight(): number {
    return 200; // Full height for the graph
  }

  private cachedGraphWidth: number = 800;

  getGraphWidth(): number {
    // Always get the current width for responsive design
    const container = document.querySelector('.graph-content');
    if (container) {
      const newWidth = container.clientWidth;
      // Only update cache if width has actually changed
      if (Math.abs(newWidth - this.cachedGraphWidth) > 5) {
        this.cachedGraphWidth = newWidth;
        // Clear cached data points when width changes
        this.cachedGraphDataPoints = [];
      }
    }
    return this.cachedGraphWidth;
  }

  getPointPosition(index: number, credits: number): { x: number; y: number } {
    const width = this.getGraphWidth();
    const height = this.getGraphHeight();
    const maxCredits = this.getMaxCredits();
    
    // Add internal padding to prevent cut-off
    const paddingX = 20; // 20px padding on left and right
    const paddingY = 20; // 20px padding on top and bottom
    const availableWidth = width - (paddingX * 2);
    const availableHeight = height - (paddingY * 2);
    
    // Calculate position with padding
    const x = paddingX + (index / (this.creditUsageData.length - 1)) * availableWidth;
    const y = paddingY + availableHeight - (credits / maxCredits) * availableHeight;
    
    // Debug logging for first few points
    if (index < 3) {
      console.log(`Point ${index}: credits=${credits}, x=${x}, y=${y}, maxCredits=${maxCredits}`);
    }
    
    return { x, y };
  }

  getYAxisLabel(creditValue: number): string {
    // Format the label based on the value
    if (creditValue >= 1000) {
      return (creditValue / 1000).toFixed(0) + 'k';
    }
    return creditValue.toString();
  }

  getCreditsText(): string {
    // Return appropriate text based on selected time range
    if (this.selectedTimeRange.includes('7')) {
      return 'You used ' + this.formatNumber(this.totalCreditsUsed) + ' credits in the last 7 days';
    } else if (this.selectedTimeRange.includes('90')) {
      return 'You used ' + this.formatNumber(this.totalCreditsUsed) + ' credits in the last 90 days';
    } else {
      return 'You used ' + this.formatNumber(this.totalCreditsUsed) + ' credits in the last 30 days';
    }
  }

  getYLabelPosition(creditValue: number): number {
    // Calculate position based on the credit value relative to max credits
    const maxCredits = this.getMaxCredits();
    const height = this.getGraphHeight();
    const paddingY = 20;
    const availableHeight = height - (paddingY * 2);
    
    // Calculate position from top (0 is at bottom, maxCredits is at top)
    const position = paddingY + availableHeight - (creditValue / maxCredits) * availableHeight;
    
    // Move each label down 22px to align with grid lines
    return Math.round(position + 22);
  }

  onPointHover(event: MouseEvent, data: CreditUsageData, index: number) {
    // Clear any existing timeout
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
      this.tooltipTimeout = null;
    }
    
    this.tooltipData = {
      date: data.displayDate,
      credits: data.credits
    };
    
    // Position tooltip relative to mouse cursor
    let x = event.clientX; // Center the tooltip on the mouse
    let y = event.clientY - 80; // Position above the mouse
    
    // Prevent tooltip from going off-screen
    if (x + 120 > window.innerWidth) {
      x = window.innerWidth - 130;
    }
    if (x < 10) {
      x = 10;
    }
    if (y < 10) {
      y = event.clientY + 20; // Show below the mouse instead
    }
    
    this.tooltipPosition = { x, y };
    this.showTooltip = true;
  }

  onPointLeave() {
    // Add a small delay before hiding the tooltip to prevent flickering
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
    this.tooltipTimeout = setTimeout(() => {
      this.showTooltip = false;
      this.tooltipData = null;
      this.tooltipTimeout = null;
    }, 150);
  }

  onTimeRangeChange(event: any) {
    this.selectedTimeRange = event.target.value;
    const range = event.target.value.includes('7') ? '7' : 
                  event.target.value.includes('90') ? '90' : '30';
    this.fetchCreditUsageData(range, this.selectedApiKey);
  }

  // Custom dropdown methods
  toggleTimeRangeDropdown() {
    this.showTimeRangeDropdown = !this.showTimeRangeDropdown;
    this.showApiKeyDropdown = false; // Close other dropdown
  }

  toggleApiKeyDropdown() {
    this.showApiKeyDropdown = !this.showApiKeyDropdown;
    this.showTimeRangeDropdown = false; // Close other dropdown
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Check if click is outside of dropdown containers
    const target = event.target as HTMLElement;
    const timeRangeDropdown = document.querySelector('.custom-dropdown');
    const apiKeyDropdown = document.querySelectorAll('.custom-dropdown')[1];
    
    if (timeRangeDropdown && !timeRangeDropdown.contains(target) && 
        apiKeyDropdown && !apiKeyDropdown.contains(target)) {
      this.showTimeRangeDropdown = false;
      this.showApiKeyDropdown = false;
    }
  }

  selectTimeRange(range: string) {
    this.selectedTimeRange = range;
    this.showTimeRangeDropdown = false;
    let rangeValue = '30';
    if (range.includes('7')) {
      rangeValue = '7';
    } else if (range.includes('90')) {
      rangeValue = '90';
    }
    this.fetchCreditUsageData(rangeValue, this.selectedApiKey);
  }

  selectApiKey(apiKey: string) {
    this.selectedApiKey = apiKey;
    this.showApiKeyDropdown = false;
    const range = this.selectedTimeRange.includes('7') ? '7' : 
                  this.selectedTimeRange.includes('90') ? '90' : '30';
    this.fetchCreditUsageData(range, apiKey);
  }

  onApiKeyChange(event: any) {
    this.selectedApiKey = event.target.value;
    const range = this.selectedTimeRange.includes('7') ? '7' : 
                  this.selectedTimeRange.includes('90') ? '90' : '30';
    this.fetchCreditUsageData(range, event.target.value);
  }

  applyNightMode() {
    const dashboardContainer = document.querySelector('.dashboard-container');
    
    if (this.isNightMode) {
      dashboardContainer?.classList.add('night-mode');
    } else {
      dashboardContainer?.classList.remove('night-mode');
    }
  }

  ngAfterViewInit() {
    // Only process video elements if they exist in the template
    if (this.videoRef1?.nativeElement) {
      const video1 = this.videoRef1.nativeElement;
      video1.muted = true;
      video1.click();
    }

    if (this.videoRef2?.nativeElement) {
      const video2 = this.videoRef2.nativeElement;
      video2.muted = true;
      video2.click();
    }

    if (this.videoRef3?.nativeElement) {
      const video3 = this.videoRef3.nativeElement;
      video3.muted = true;
      video3.click();
    }

    if (this.videoRef4?.nativeElement) {
      const video4 = this.videoRef4.nativeElement;
      video4.muted = true;
      video4.click();
    }

    if (this.videoRef5?.nativeElement) {
      const video5 = this.videoRef5.nativeElement;
      video5.muted = true;
      video5.click();
    }

    if (this.videoRef6?.nativeElement) {
      const video6 = this.videoRef6.nativeElement;
      video6.muted = true;
      video6.click();
    }

    if (this.videoRef7?.nativeElement) {
      const video7 = this.videoRef7.nativeElement;
      video7.muted = true;
      video7.click();
    }

    if (this.videoRef8?.nativeElement) {
      const video8 = this.videoRef8.nativeElement;
      video8.muted = true;
      video8.click();
    }

    if (this.videoRef9?.nativeElement) {
      const video9 = this.videoRef9.nativeElement;
      video9.muted = true;
      video9.click();
    }

    if (this.videoRef10?.nativeElement) {
      const video10 = this.videoRef10.nativeElement;
      video10.muted = true;
      video10.click();
    }

    if (this.videoRef11?.nativeElement) {
      const video11 = this.videoRef11.nativeElement;
      video11.muted = true;
      video11.click();
    }

    if (this.videoRef12?.nativeElement) {
      const video12 = this.videoRef12.nativeElement;
      video12.muted = true;
      video12.click();
    }
  }

  onOpen() {
    
  }

  openYourMatchesModal() {
      const config = new MatDialogConfig();
  
      const influencerList: Array<any> = [];
  
      config.autoFocus = false;
      config.hasBackdrop = true;
      config.disableClose = false;
      config.viewContainerRef = this._viewContainerRef;
      config.minWidth = '60vw';
      config.maxWidth = '60vw';
      config.minHeight = '90vh';
      config.maxHeight = '90vh';
      config.panelClass = 'custom-dialog-container';
      self.dialogRef = this._dialog.open(YourMatchesComponent, config);
      self.dialogRef.componentInstance.user = this.user;
      self.dialogRef.componentInstance.userId = this.user._id;
      self.dialogRef
        .afterClosed()
        .subscribe((result: any) => {
          self.dialogRef = null;
         
          if (result) {
            
          }
        });
    }

  fetchSubscriptionDetails() {
    if(this.user.stripeSessionId && !this.user.stripeSubscriptionId) {
      let baseURL: string = '';
      if(this.user.subscription.type === 'FREE') {
        //baseURL = "http://localhost:3000/api/subscribe-stripe/details";
        baseURL = "https://distros-8f63ee867795.herokuapp.com/api/subscribe-stripe/details";
      } else if(this.user.subscription.type === 'PRO') {
        baseURL = "https://api.picassopdf.com/api/subscribe-stripe-pro/details";
        //baseURL = "https://distros-8f63ee867795.herokuapp.com/api/subscribe-stripe-pro/details";
      } else if(this.user.subscription.type === 'SCALE') {
        baseURL = "https://api.picassopdf.com/api/subscribe-stripe-scale/details";
        //baseURL = "https://distros-8f63ee867795.herokuapp.com/api/subscribe-stripe-pro/details";
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

  calculateNewClientsChange() {
    if (this.user.lastMonthNewClients === 0) {
      this.newClientsChange = this.user.thisMonthNewClients > 0 ? 100 : 0; // Avoid division by zero
    } else {
      let change = ((this.user.thisMonthNewClients - this.user.lastMonthNewClients) / this.user.lastMonthNewClients) * 100;
      this.newClientsChange =  Math.round(change); // Round to the nearest whole number
    }
  }

  calculateTotalClientsChange() {
    if (this.user.lastMonthTotalClients === 0) {
      this.totalClientsChange = this.user.thisMonthTotalClients > 0 ? 100 : 0; // Avoid division by zero
    } else {
      let change = ((this.user.thisMonthTotalClients - this.user.lastMonthTotalClients) / this.user.lastMonthTotalClients) * 100;
      this.totalClientsChange =  Math.round(change); // Round to the nearest whole number
    }
  }

  calculateTotalRevenueChange() {
    if (this.user.lastMonthTotalRevenue === 0) {
      this.totalRevenueChange = this.user.thisMonthTotalRevenue > 0 ? 100 : 0; // Avoid division by zero
   } else {
      let change = ((this.user.thisMonthTotalRevenue - this.user.lastMonthTotalRevenue) / this.user.lastMonthTotalRevenue) * 100;
      this.totalRevenueChange =  Math.round(change); // Round to the nearest whole number
   }
  }

  calculateRecurringRevenueChange() {
    if (this.user.lastMonthRecurringRevenue === 0) {
       this.recurringRevenueChange = this.user.thisMonthRecurringRevenue > 0 ? 100 : 0; // Avoid division by zero
    } else {
      let change = ((this.user.thisMonthRecurringRevenue - this.user.lastMonthRecurringRevenue) / this.user.lastMonthRecurringRevenue) * 100;
      this.recurringRevenueChange =  Math.round(change); // Round to the nearest whole number
    }
  }

  startMonthlyRevenueCounter() {
    this.thisMonthRevenue = 0;
    this.thisMonthRevenueCounter = 0;
    this.thisMonthRevenueStop = setInterval(() => {
      this.isWithinTen2 = ((Number(this.user?.thisMonthTotalRevenue) - this.thisMonthRevenueCounter) <= 10) ? true : false;
      if(this.thisMonthRevenueCounter < Number(this.user?.thisMonthTotalRevenue)) {
        this.thisMonthRevenueCounter += this.isWithinTen2 ? 1 : 100;
        this.thisMonthRevenue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(this.thisMonthRevenueCounter);
      } else {
        clearInterval(this.thisMonthRevenueStop);
      }
    }, 10);
  }

  startTotalClientsCounter() {
    this.totalClients = 0;
    this.totalClientsCounter = 0;
    this.totalClientsStop = setInterval(() => {
      if(this.totalClientsCounter < Number(this.user?.thisMonthTotalClients)) {
        this.totalClientsCounter++;
        this.totalClients = this.totalClientsCounter;
      } else {
        clearInterval(this.totalClientsStop);
      }
    }, 10);
  }

  startRevenueCounter() {
    this.recurringRevenueCounter = 0;
    this.recurringRevenueStop = setInterval(() => {
      const targetRevenue = Number(this.user?.thisMonthRecurringRevenue) || 0;
      this.isWithinTen1 = (targetRevenue - this.recurringRevenueCounter) <= 10;
      
      if (this.recurringRevenueCounter < targetRevenue) {
        this.recurringRevenueCounter += this.isWithinTen1 ? 1 : 100;
        this.recurringRevenue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(this.recurringRevenueCounter);
      } else {
        clearInterval(this.recurringRevenueStop);
      }
    }, 10);
  }

  startClientsCounter() {
    this.newClientsCounter = 0;
    this.newClientsStop = setInterval(() => {
      const targetClients = Number(this.user?.thisMonthNewClients) || 0;
      
      if (this.newClientsCounter < targetClients) {
        this.newClientsCounter++;
        this.newClients = this.newClientsCounter;
      } else {
        clearInterval(this.newClientsStop);
      }
    }, 10);
  }

  checkFirstOfMonthAndCalculate(): void {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const lastMonth = currentMonth == 1 ? 12 : currentMonth - 1;
    
    if (today.getDate() === 1) {
      // If it's the first day of the month, calculate for last month and this month
      const currentMonth = today.getMonth() + 1;
      const lastMonth = currentMonth == 1 ? 12 : (currentMonth - 1);

      // Fetch or calculate totals for last month and this month
      this.calculateRevenueAndClients(lastMonth, currentMonth);
    } else {
      
    }
  }

  calculateRevenueAndClients(lastMonth: number, currentMonth: number): void {
    
  }

  convertNumbers() {
    this.recurringRevenue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.user?.thisMonthRecurringRevenue);
    this.thisMonthRevenue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.user?.thisMonthTotalRevenue);
  }

  openArticle1() {
    const url = 'https://www.hellomagazine.com/hfm/culture/511677/best-fitness-influencers-to-follow/';
    window.open(url, "_blank");
  }

  openArticle2() {
    const url = 'https://dropshipping.com/article/dropshipping-youtubers/';
    window.open(url, "_blank");
  }

  openArticle3() {
    const url = 'https://www.getaccept.com/blog/top-sales-influencers';
    window.open(url, "_blank");
  }

  // Navigation methods for PDF conversion API platform
  navigateToPdfConverter() {
    this.router.navigate(['/app/pdf-converter']);
  }

  navigateToApiDocs() {
    this.router.navigate(['/app/api-docs']);
  }

  navigateToUsageAnalytics() {
    this.router.navigate(['/app/usage-analytics']);
  }

  navigateToBilling() {
    this.router.navigate(['/app/billing']);
  }

  // Legacy methods (keeping for compatibility)
  createNewPDF() {
    this.router.navigate(['/pdf-builder']);
  }

  navigateToBuilder() {
    this.router.navigate(['/pdf-builder']);
  }

  navigateToAIBuilder() {
    this.router.navigate(['/ai-builder']);
  }

  navigateToTemplates() {
    this.router.navigate(['/templates']);
  }

  // Legacy methods (keeping for compatibility)
  createNewCampaign() {
    this.router.navigate(['/create-campaign']);
  }

  navigateToAbandonedCarts() {
    this.router.navigate(['/abandoned-carts']);
  }

  navigateToEmailCampaigns() {
    this.router.navigate(['/email-campaigns']);
  }

  navigateToVoiceCloning() {
    this.router.navigate(['/voice-face-cloning']);
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  onUpgrade() {
    this.router.navigate(['/app/membership']);
  }
}

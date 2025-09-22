import { Component, OnInit, HostListener, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../core/model/common.model';
import { AuthService } from '../core/services/auth.service';
import { PdfVaultService } from '../pdf-vault/pdf-vault.service';

// PDF Log interface - matches LogsSchema
export interface PDFLog {
  _id: string;
  companyId: string;
  userId?: string;
  requestId: string;
  inputType: 'html' | 'url' | 'file' | 'text';
  inputSizeBytes: number;
  outputSizeBytes?: number;
  generationTimeMs: number;
  creditUsed: number;
  saveToVault: boolean;
  storageRef?: string;
  apiEndpoint: string;
  status: 'success' | 'failed' | 'processing';
  errorMessage?: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  conversionOptions?: any;
}

export interface PDFLogListResponse {
  success: boolean;
  message: string;
  data: PDFLog[];
  total: number;
  page: number;
  limit: number;
}

@Component({
  selector: 'app-pdf-logs',
  templateUrl: './pdf-logs.component.html',
  styleUrls: ['./pdf-logs.component.scss']
})
export class PdfLogsComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  pdfVaultService = inject(PdfVaultService);
  loading = true;
  error: string | null = null;
  logs: PDFLog[] = [];
  filteredLogs: PDFLog[] = [];
  user: User | any = {};
  searchTerm = '';
  statusFilter = '';
  showStatusDropdown = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  isLoadingMore = false;
  hasMoreData = true;
  isNightMode: boolean = false;
  private checkNightModeInterval: any;

  constructor(
    private router: Router, 
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const savedNightMode = localStorage.getItem('nightMode');
    this.isNightMode = savedNightMode === 'true';
    this.applyNightMode();

    // Load user data and then PDF Logs
    this.me();
    
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    this.checkNightModeInterval = setInterval(() => {
      const currentNightMode = localStorage.getItem('nightMode') === 'true';
      if (currentNightMode !== this.isNightMode) {
        this.isNightMode = currentNightMode;
        this.applyNightMode();
      }
    }, 100);
  }

  me() {
    this.authService.me().subscribe({
      next: (response: any) => {
        console.log('User data received:', response.data);
        this.user = response.data;
        console.log('USER:', this.user);
        // Load Logs after user data is available
        this.loadLogs();
      },
      error: (error: any) => {
        console.error('Error fetching user data:', error);
      }
    })
  }

  loadLogs(): void {
    this.error = null;
    console.log('Loading logs from database...');

    this.pdfVaultService.getLogs(this.currentPage, this.itemsPerPage, this.searchTerm, this.statusFilter).subscribe({
      next: (response) => {
        console.log('Logs response:', response);
        if (response.success) {
          this.logs = response.data || [];
          this.totalPages = Math.ceil((response.total || 0) / this.itemsPerPage);
          this.hasMoreData = this.currentPage * this.itemsPerPage < (response.total || 0);
          this.applyFilters();
          console.log(`Loaded ${this.logs.length} log entries from database`);
        } else {
          // If the API returns success: false but it's just because there are no logs, treat it as empty
          this.logs = [];
          this.totalPages = 0;
          this.hasMoreData = false;
          this.applyFilters();
          console.log('No logs found in database');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading logs from database:', error);
        // If it's a 404 or similar "not found" error, treat it as empty data
        if (error.status === 404 || error.status === 400) {
          this.logs = [];
          this.totalPages = 0;
          this.hasMoreData = false;
          this.applyFilters();
          this.loading = false;
          console.log('No logs found - treating as empty data');
        } else {
          this.error = 'Failed to load logs from database. Please try again.';
          this.toastr.error('Failed to load logs from database. Please try again.', 'Error');
          this.loading = false;
        }
      }
    });
  }

  getMockLogs(): PDFLog[] {
    return [
      {
        _id: '507f1f77bcf86cd799439011',
        companyId: 'company123',
        userId: 'user456',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        status: 'success',
        requestId: 'req-123e4567-e89b-12d3-a456-426614174000',
        inputType: 'html',
        inputSizeBytes: 2048,
        outputSizeBytes: 51200,
        creditUsed: 1,
        saveToVault: true,
        storageRef: 'pdf_507f1f77bcf86cd799439011',
        apiEndpoint: '/api/v1/pdf/convert',
        generationTimeMs: 1250
      },
      {
        _id: '507f1f77bcf86cd799439012',
        companyId: 'company123',
        userId: 'user456',
        timestamp: new Date('2024-01-15T11:15:00Z'),
        status: 'failed',
        requestId: 'req-123e4567-e89b-12d3-a456-426614174001',
        inputType: 'html',
        inputSizeBytes: 4096,
        creditUsed: 0,
        saveToVault: false,
        apiEndpoint: '/api/v1/pdf/convert',
        generationTimeMs: 500,
        errorMessage: 'Invalid HTML content'
      }
    ];
  }

  applyFilters(): void {
    let filtered = [...this.logs];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.requestId.toLowerCase().includes(search) ||
        log.apiEndpoint.toLowerCase().includes(search) ||
        log.inputType.toLowerCase().includes(search) ||
        (log.errorMessage && log.errorMessage.toLowerCase().includes(search))
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(log => log.status === this.statusFilter);
    }

    this.filteredLogs = filtered;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredLogs.length / this.itemsPerPage);
    this.hasMoreData = this.currentPage * this.itemsPerPage < this.filteredLogs.length;
  }

  get paginatedLogs(): PDFLog[] {
    const end = this.currentPage * this.itemsPerPage;
    return this.filteredLogs.slice(0, end);
  }

  loadMoreData(): void {
    if (this.isLoadingMore || !this.hasMoreData) return;
    
    this.isLoadingMore = true;
    this.currentPage++;
    
    this.pdfVaultService.getLogs(this.currentPage, this.itemsPerPage, this.searchTerm, this.statusFilter).subscribe({
      next: (response) => {
        if (response.success) {
          this.logs = [...this.logs, ...response.data];
          this.totalPages = Math.ceil(response.total / this.itemsPerPage);
          this.hasMoreData = this.currentPage * this.itemsPerPage < response.total;
          this.calculatePagination();
        }
        this.isLoadingMore = false;
      },
      error: (error) => {
        console.error('Error loading more logs:', error);
        this.isLoadingMore = false;
        // Revert page increment on error
        this.currentPage--;
      }
    });
  }

  onTableScroll(event: Event): void {
    if (this.isLoadingMore || !this.hasMoreData) return;
    
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      this.loadMoreData();
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success': return 'completed';
      case 'processing': return 'processing';
      case 'failed': return 'failed';
      default: return 'completed';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'success': return 'Success';
      case 'processing': return 'Processing';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatFileSizeMB(bytes: number): string {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return parseFloat(mb.toFixed(2)) + ' MB';
  }

  formatGenerationTimeSeconds(ms: number): string {
    if (!ms) return '0s';
    const seconds = ms / 1000;
    return parseFloat(seconds.toFixed(2)) + 's';
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.showStatusDropdown = false;
    }
  }

  toggleStatusDropdown(): void {
    this.showStatusDropdown = !this.showStatusDropdown;
  }

  selectStatus(status: string): void {
    this.statusFilter = status;
    this.showStatusDropdown = false;
    this.currentPage = 1;
    this.loadLogs();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  applyNightMode() {
    const pdfLogsContainer = document.querySelector('.pdf-logs-container');
    
    if (this.isNightMode) {
      pdfLogsContainer?.classList.add('night-mode');
    } else {
      pdfLogsContainer?.classList.remove('night-mode');
    }
  }

  handleStorageChange(event: StorageEvent) {
    if (event.key === 'nightMode') {
      this.isNightMode = event.newValue === 'true';
      this.applyNightMode();
    }
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    if (this.checkNightModeInterval) {
      clearInterval(this.checkNightModeInterval);
    }
  }
}

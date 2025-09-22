import { Component, OnInit, HostListener, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PdfVaultService, PDF } from './pdf-vault.service';
import { User } from '../core/model/common.model';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-pdf-vault',
  templateUrl: './pdf-vault.component.html',
  styleUrls: ['./pdf-vault.component.scss']
})
export class PdfVaultComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  loading = true; // Start with loading true to show loading state immediately
  error: string | null = null;
  pdfs: PDF[] = [];
  filteredPDFs: PDF[] = [];
  searchTerm = '';
  statusFilter = '';
  showStatusDropdown = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  isLoadingMore = false;
  hasMoreData = true;
  isNightMode: boolean = false;
  user: User | any = {};
  private checkNightModeInterval: any;
  
  // Delete confirmation modal state
  showDeleteModal = false;
  selectedPDFForDelete: PDF | null = null;
  isDeletingPDF = false;
  deleteSuccess = false;

  constructor(
    private router: Router, 
    private pdfVaultService: PdfVaultService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    // Load night mode preference from localStorage
    const savedNightMode = localStorage.getItem('nightMode');
    this.isNightMode = savedNightMode === 'true';
    this.applyNightMode();
    // Load user data and then Generated PDFs
    this.me();
    
    // Listen for night mode changes from other tabs
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Set up interval to check for night mode changes
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
        // Load PDFs after user data is available
        this.loadPDFs();
      },
      error: (error: any) => {
        console.error('Error fetching user data:', error);
      }
    })
  }

  loadPDFs(): void {
    this.error = null;

    this.pdfVaultService.getPDFs(this.currentPage, this.itemsPerPage, this.searchTerm, this.statusFilter).subscribe({
      next: (response) => {
        if (response.success) {
          this.pdfs = response.data || [];
          console.log('PDFS:', this.pdfs)
          this.totalPages = Math.ceil((response.total || 0) / this.itemsPerPage);
          this.hasMoreData = this.currentPage * this.itemsPerPage < (response.total || 0);
          this.applyFilters();
        } else {
          // If the API returns success: false but it's just because there are no PDFs, treat it as empty
          this.pdfs = [];
          this.totalPages = 0;
          this.hasMoreData = false;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading PDFs:', error);
        // If it's a 404 or similar "not found" error, treat it as empty data
        if (error.status === 404 || error.status === 400) {
          this.pdfs = [];
          this.totalPages = 0;
          this.hasMoreData = false;
          this.applyFilters();
          this.loading = false;
        } else {
          this.error = 'Failed to load PDFs. Please try again.';
          this.toastr.error('Failed to load PDFs. Please try again.', 'Error');
          this.loading = false;
        }
      }
    });
  }


  applyFilters(): void {
    let filtered = [...this.pdfs];

    // Apply search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(pdf => 
        this.getDisplayFileName(pdf.fileName).toLowerCase().includes(search) ||
        pdf.dataType.toLowerCase().includes(search) ||
        (pdf.description && pdf.description.toLowerCase().includes(search)) ||
        (pdf.errorMessage && pdf.errorMessage.toLowerCase().includes(search))
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(pdf => pdf.status === this.statusFilter);
    }

    this.filteredPDFs = filtered;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPDFs.length / this.itemsPerPage);
    this.hasMoreData = this.currentPage * this.itemsPerPage < this.filteredPDFs.length;
  }

  get paginatedPDFs(): PDF[] {
    const end = this.currentPage * this.itemsPerPage;
    return this.filteredPDFs.slice(0, end);
  }

  loadMoreData(): void {
    if (this.isLoadingMore || !this.hasMoreData) return;
    
    this.isLoadingMore = true;
    this.currentPage++;
    
    this.pdfVaultService.getPDFs(this.currentPage, this.itemsPerPage, this.searchTerm, this.statusFilter).subscribe({
      next: (response) => {
        if (response.success) {
          this.pdfs = [...this.pdfs, ...response.data];
          console.log('PDFS:', this.pdfs)
          this.totalPages = Math.ceil(response.total / this.itemsPerPage);
          this.hasMoreData = this.currentPage * this.itemsPerPage < response.total;
          this.calculatePagination();
        }1
        this.isLoadingMore = false;
      },
      error: (error) => {
        console.error('Error loading more PDFs:', error);
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
    
    // Load more when user reaches the bottom of the table
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      this.loadMoreData();
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'completed';
      case 'processing': return 'processing';
      case 'failed': return 'failed';
      case 'pending': return 'pending';
      case 'cancelled': return 'cancelled';
      default: return 'completed';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'failed': return 'Failed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
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

  getDisplayFileName(fileName: string | undefined): string {
    if (!fileName) return '';
    // Remove "Generated from raw" prefix if it exists
    return fileName.replace(/^Generated from raw\s*/, '');
  }

  canViewPDF(pdf: PDF): boolean {
    // PDF must be completed and have either a Cloudflare R2 URL or a download URL
    return pdf.status === 'completed' && 
           (!!(pdf.storageInfo && pdf.storageInfo.r2Url) || !!pdf.downloadUrl);
  }

  createNewPDF(): void {
    // Navigate to PDF creation page or open modal
    console.log('Create new PDF');
  }

  viewPDF(pdf: PDF): void {
    if (pdf.status === 'completed') {
      console.log('PDF storageInfo:', pdf.storageInfo);
      console.log('PDF downloadUrl:', pdf.downloadUrl);
      
      // Check if we have a Cloudflare R2 URL in storageInfo
      if (pdf.storageInfo && pdf.storageInfo.r2Url) {
        // Open PDF from Cloudflare R2 in new tab
        console.log('Opening R2 URL:', pdf.storageInfo.r2Url);
        window.open(pdf.storageInfo.r2Url, '_blank');
      } else if (pdf.downloadUrl) {
        // Fallback to local download URL
        console.log('Opening local download URL:', pdf.downloadUrl);
        window.open(pdf.downloadUrl, '_blank');
      } else {
        this.toastr.info('PDF URL not available', 'Information');
      }
    } else {
      // Show message for incomplete PDFs
      this.toastr.info('This PDF is not ready for viewing yet', 'Information');
    }
  }

  downloadPDF(pdf: PDF): void {
    if (pdf.status === 'completed' && pdf.filePath) {
      // Use the service to download
      this.pdfVaultService.downloadPDF(pdf._id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${pdf.fileName}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error downloading PDF:', error);
          this.error = 'Failed to download PDF. Please try again.';
          this.toastr.error('Failed to download PDF. Please try again.', 'Error');
        }
      });
    } else {
      this.toastr.info('This PDF is not ready for download yet', 'Information');
    }
  }

  deletePDF(pdf: PDF): void {
    this.selectedPDFForDelete = pdf;
    this.showDeleteModal = true;
  }

  confirmDeletePDF(): void {
    if (!this.selectedPDFForDelete || this.isDeletingPDF) return;

    const pdf = this.selectedPDFForDelete;
    this.isDeletingPDF = true;
    this.deleteSuccess = false;

    this.pdfVaultService.deletePDF(pdf._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.pdfs = this.pdfs.filter(p => p._id !== pdf._id);
          this.applyFilters();
          this.deleteSuccess = true;
          
          // Show checkmark for 1.5 seconds then close modal
          setTimeout(() => {
            this.closeDeleteModal();
          }, 1500);
        } else {
          this.error = response.message || 'Failed to delete log entry';
          this.toastr.error(response.message || 'Failed to delete log entry', 'Error');
          this.closeDeleteModal();
        }
      },
      error: (error) => {
        console.error('Error deleting log entry:', error);
        this.error = 'Failed to delete log entry. Please try again.';
        this.toastr.error('Failed to delete log entry. Please try again.', 'Error');
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedPDFForDelete = null;
    this.isDeletingPDF = false;
    this.deleteSuccess = false;
  }

  // Watch for search and filter changes
  onSearchChange(): void {
    this.currentPage = 1;
    this.loadPDFs();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.showStatusDropdown = false;
    }
  }

  toggleStatusDropdown(): void {
    console.log('Toggle dropdown clicked, current state:', this.showStatusDropdown);
    this.showStatusDropdown = !this.showStatusDropdown;
    console.log('New state:', this.showStatusDropdown);
    
    // Force change detection
    setTimeout(() => {
      console.log('Dropdown state after timeout:', this.showStatusDropdown);
    }, 0);
  }

  selectStatus(status: string): void {
    this.statusFilter = status;
    this.showStatusDropdown = false;
    this.currentPage = 1;
    this.loadPDFs();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadPDFs();
  }

  applyNightMode() {
    const pdfVaultContainer = document.querySelector('.pdf-vault-container');
    
    if (this.isNightMode) {
      pdfVaultContainer?.classList.add('night-mode');
    } else {
      pdfVaultContainer?.classList.remove('night-mode');
    }
  }

  handleStorageChange(event: StorageEvent) {
    if (event.key === 'nightMode') {
      this.isNightMode = event.newValue === 'true';
      this.applyNightMode();
    }
  }

  ngOnDestroy() {
    // Clean up event listeners and intervals
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    if (this.checkNightModeInterval) {
      clearInterval(this.checkNightModeInterval);
    }
  }
}




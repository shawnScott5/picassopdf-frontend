import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PDF {
  _id: string;
  id: string;
  userId?: string;
  companyId?: string;
  dataType: 'html' | 'grapesjs' | 'raw';
  fileName: string;
  originalFileName?: string;
  sourceType: 'raw' | 'grapesjs' | 'upload';
  htmlContent?: string;
  cssContent?: string;
  jsContent?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  fileSize: number;
  filePath?: string;
  originalFilePath?: string;
  storageInfo?: {
    storageType: string;
    filePath: string;
    r2Url?: string;
    key?: string;
    bucket?: string;
  };
  supabaseFileId?: string;
  processingTime?: number;
  errorMessage?: string;
  errorDetails?: any;
  processingProgress: number;
  conversionOptions?: any;
  metadata?: any;
  tags: string[];
  description?: string;
  isPublic: boolean;
  downloadCount: number;
  lastDownloadedAt?: Date;
  creditsUsed?: number;
  expiresAt?: Date;
  isArchived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  startedAt?: Date;
  // Computed fields for display
  title?: string;
  type?: string;
  fileSizeFormatted?: string;
  downloadUrl?: string;
}

export interface PDFListResponse {
  success: boolean;
  message: string;
  data: PDF[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfVaultService {
  //private apiUrl = 'http://localhost:3000';
  private apiUrl = 'https://api.picassopdf.com';

  constructor(private http: HttpClient) {}

  // Get all converted PDFs for the current user
  getPDFs(page: number = 1, limit: number = 10, search?: string, status?: string): Observable<PDFListResponse> {
    let params: any = { page, limit };
    if (search) params.search = search;
    if (status) params.status = status;
    
    return this.http.get<PDFListResponse>(`${this.apiUrl}/api/conversions`, { params });
  }

  // Get logs from the logs collection
  getLogs(page: number = 1, limit: number = 10, search?: string, status?: string): Observable<any> {
    let params: any = { page, limit };
    if (search) params.search = search;
    if (status) params.status = status;
    
    return this.http.get<any>(`${this.apiUrl}/api/logs`, { params });
  }

  // Get log metadata by ID
  getPDFMetadata(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/logs/${id}`);
  }

  // Download PDF by ID (if available in logs)
  downloadPDF(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/api/conversions/download/${id}`, { 
      responseType: 'blob' 
    });
  }

  // Delete PDF conversion by ID
  deletePDF(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/conversions/${id}`);
  }

  // Get conversion status by ID
  getConversionStatus(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/v1/status/${id}`);
  }
}

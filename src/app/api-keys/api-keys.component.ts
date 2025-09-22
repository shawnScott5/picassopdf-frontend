import { Component, OnInit, HostListener, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { apiKeysService } from './api-keys.service';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/model/common.model';

interface ApiKey {
  _id: string;
  id?: string; // Keep for backward compatibility
  name: string;
  token: string;
  key?: string; // The actual API key
  fullKey?: string; // Full key with prefix
  keyId?: string; // Public key identifier
  keyVersion?: number; // Key version for rotation
  lastUsed: string | null;
  createdAt: Date;
  lastModifiedAt?: Date;
  lastModifiedBy?: string;
  isActive: boolean;
  status?: string;
  description?: string;
  permissions?: string[];
  scopes?: string[];
  rateLimits?: any;
  keyPrefix?: string;
  userId?: string;
  organizationId?: string;
  usage?: any;
  securityMetadata?: {
    lastRotated?: Date;
    rotationCount?: number;
    compromisedAt?: Date;
    lastSecurityCheck?: Date;
    failedAttempts?: number;
    lastFailedAttempt?: Date;
  };
}

interface UsageStats {
  pdfConversions: number;
  pdfLimit: number;
  audiobooks: number;
  audiobookLimit: number;
  requestsToday: number;
  dailyLimit: number;
}

@Component({
  selector: 'app-api-keys',
  templateUrl: './api-keys.component.html',
  styleUrls: ['./api-keys.component.scss']
})
export class ApiKeysComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  // Maximum number of API keys allowed
  readonly MAX_API_KEYS = 5;
  
  apiKeys: ApiKey[] = [];
  loading = true; // Start with loading true to show loading state immediately
  error: string | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  showCreateModal = false;
  showRegenerateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  newKeyName = '';
  regenerateKeyName = '';
  editKeyName = '';
  selectedApiKeyForRegenerate: ApiKey | null = null;
  selectedApiKeyForEdit: ApiKey | null = null;
  selectedApiKeyForDelete: ApiKey | null = null;
  isNightMode: boolean = false;
  private checkNightModeInterval: any;
  copiedApiKeyId: string | null = null;
  user: User | any = {};
  isCreatingApiKey = false; // Loading state for create button
  
  // Validation properties
  isCheckingNameAvailability = false;
  nameAvailabilityError = '';
  editNameAvailabilityError = '';
  
  // Usage statistics
  usageStats: UsageStats = {
    pdfConversions: 45,
    pdfLimit: 1000,
    audiobooks: 12,
    audiobookLimit: 100,
    requestsToday: 67,
    dailyLimit: 1000
  };
  
  // Tab management
  activeTab = 'python';
  tabs = [
    { id: 'python', name: 'Python' },
    { id: 'nodejs', name: 'NodeJS' },
    { id: 'php', name: 'PHP' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'java', name: 'Java' },
    { id: 'csharp', name: 'C#' },
    { id: 'go', name: 'Go' }
  ];



  // Code examples for different languages - matching landing page
  codeExamples = {
    python: `<span style="color: #569cd6; font-weight: 500;">import</span> requests

API_KEY = <span style="color: #ce9178;">"sk_XXXXXXXXXX"</span>

res = requests.<span style="color: #dcdcaa;">post</span>(
    <span style="color: #ce9178;">"https://picassopdf.com/api/v1/convert/pdf"</span>,
    headers={<span style="color: #ce9178;">"Authorization"</span>: <span style="color: #ce9178;">f"Bearer {API_KEY}"</span>},
    json={
        <span style="color: #6a9955;"># Either 'url' or 'html' is required</span>
        <span style="color: #ce9178;">"url"</span>: <span style="color: #ce9178;">"https://en.wikipedia.org/wiki/PDF"</span>,
        <span style="color: #ce9178;">"html"</span>: <span style="color: #569cd6; font-weight: 500;">None</span>,
        <span style="color: #ce9178;">"css"</span>: <span style="color: #569cd6; font-weight: 500;">None</span>,         <span style="color: #6a9955;"># optional, only used with 'html'</span>
        <span style="color: #ce9178;">"javascript"</span>: <span style="color: #569cd6; font-weight: 500;">None</span>,  <span style="color: #6a9955;"># optional, only used with 'html'</span>
        
        <span style="color: #ce9178;">"file_name"</span>: <span style="color: #ce9178;">"pdf-generated"</span>,
        <span style="color: #ce9178;">"options"</span>: {
            <span style="color: #ce9178;">"save_to_vault"</span>: <span style="color: #569cd6; font-weight: 500;">True</span>  <span style="color: #6a9955;"># optional, default is false</span>
        },
        <span style="color: #ce9178;">"ai_options"</span>: {
            <span style="color: #ce9178;">"layout_repair"</span>: <span style="color: #569cd6; font-weight: 500;">True</span>  <span style="color: #6a9955;"># optional, default is false</span>
        }
    }
)

<span style="color: #569cd6; font-weight: 500;">with</span> <span style="color: #dcdcaa;">open</span>(<span style="color: #ce9178;">"pdf-generated.pdf"</span>, <span style="color: #ce9178;">"wb"</span>) <span style="color: #569cd6; font-weight: 500;">as</span> f:
    f.<span style="color: #dcdcaa;">write</span>(res.content)`,
    nodejs: `<span style="color: #569cd6; font-weight: 500;">import</span> fetch <span style="color: #569cd6; font-weight: 500;">from</span> <span style="color: #ce9178;">"node-fetch"</span>;

<span style="color: #569cd6; font-weight: 500;">const</span> API_KEY = <span style="color: #ce9178;">"sk_XXXXXXXXXX"</span>;

<span style="color: #569cd6; font-weight: 500;">const</span> res = <span style="color: #569cd6; font-weight: 500;">await</span> fetch(<span style="color: #ce9178;">"https://picassopdf.com/api/v1/convert/pdf"</span>, {
  method: <span style="color: #ce9178;">"POST"</span>,
  headers: {
    <span style="color: #ce9178;">"Authorization"</span>: <span style="color: #ce9178;">\`Bearer \${API_KEY}\`</span>,
    <span style="color: #ce9178;">"Content-Type"</span>: <span style="color: #ce9178;">"application/json"</span>
  },
  body: <span style="color: #dcdcaa;">JSON</span>.<span style="color: #dcdcaa;">stringify</span>({
    <span style="color: #6a9955;">// Either 'url' or 'html' is required</span>
    url: <span style="color: #ce9178;">"https://en.wikipedia.org/wiki/PDF"</span>,
    html: <span style="color: #569cd6; font-weight: 500;">null</span>,
    css: <span style="color: #569cd6; font-weight: 500;">null</span>,        <span style="color: #6a9955;">// optional, only used with 'html'</span>
    javascript: <span style="color: #569cd6; font-weight: 500;">null</span>, <span style="color: #6a9955;">// optional, only used with 'html'</span>

    file_name: <span style="color: #ce9178;">"pdf-generated"</span>,
    options: {
      save_to_vault: <span style="color: #569cd6; font-weight: 500;">true</span> <span style="color: #6a9955;">// optional, default is false</span>
    },
    ai_options: {
      layout_repair: <span style="color: #569cd6; font-weight: 500;">true</span> <span style="color: #6a9955;">// optional, default is false</span>
    }
  })
});

<span style="color: #569cd6; font-weight: 500;">const</span> buffer = <span style="color: #dcdcaa;">Buffer</span>.<span style="color: #dcdcaa;">from</span>(<span style="color: #569cd6; font-weight: 500;">await</span> res.<span style="color: #dcdcaa;">arrayBuffer</span>());
<span style="color: #569cd6; font-weight: 500;">await</span> fs.<span style="color: #dcdcaa;">promises</span>.<span style="color: #dcdcaa;">writeFile</span>(<span style="color: #ce9178;">"pdf-generated.pdf"</span>, buffer);`,
    php: `<span style="color: #d4d4d4;">&lt;?php</span>
<span style="color: #6a9955;">// use your real api key</span>
$apiKey = <span style="color: #ce9178;">'sk_XXXXXXXXXX'</span>;

<span style="color: #6a9955;">// json required fields: 'html' OR 'link'</span>
<span style="color: #6a9955;">// json optional fields: 'css', 'javascript'</span>

$ch = <span style="color: #dcdcaa;">curl_init</span>();

<span style="color: #dcdcaa;">curl_setopt</span>($ch, CURLOPT_URL, <span style="color: #ce9178;">'https://picassopdf.com/api/v1/convert/pdf'</span>);
<span style="color: #dcdcaa;">curl_setopt</span>($ch, CURLOPT_POST, <span style="color: #569cd6; font-weight: 500;">true</span>);
<span style="color: #dcdcaa;">curl_setopt</span>($ch, CURLOPT_POSTFIELDS, <span style="color: #dcdcaa;">json_encode</span>([
    <span style="color: #ce9178;">'url'</span> => <span style="color: #ce9178;">'https://en.wikipedia.org/wiki/PDF'</span>
]));
<span style="color: #dcdcaa;">curl_setopt</span>($ch, CURLOPT_HTTPHEADER, [
    <span style="color: #ce9178;">'Content-Type: application/json'</span>,
    <span style="color: #ce9178;">'Authorization: Bearer '</span> . $apiKey
]);
<span style="color: #dcdcaa;">curl_setopt</span>($ch, CURLOPT_RETURNTRANSFER, <span style="color: #569cd6; font-weight: 500;">true</span>);

$response = <span style="color: #dcdcaa;">curl_exec</span>($ch);
<span style="color: #dcdcaa;">curl_close</span>($ch);

<span style="color: #dcdcaa;">file_put_contents</span>(<span style="color: #ce9178;">'wikipedia.pdf'</span>, $response);`,
    ruby: `<span style="color: #569cd6; font-weight: 500;">require</span> <span style="color: #ce9178;">"net/http"</span>
<span style="color: #569cd6; font-weight: 500;">require</span> <span style="color: #ce9178;">"json"</span>

api_key = <span style="color: #ce9178;">"sk_XXXXXXXXXX"</span>
uri = <span style="color: #dcdcaa;">URI</span>(<span style="color: #ce9178;">"https://picassopdf.com/api/v1/convert/pdf"</span>)

body = {
  <span style="color: #6a9955;"># Either 'url' or 'html' is required</span>
  url: <span style="color: #ce9178;">"https://en.wikipedia.org/wiki/PDF"</span>,
  html: <span style="color: #569cd6; font-weight: 500;">nil</span>,
  css: <span style="color: #569cd6; font-weight: 500;">nil</span>,        <span style="color: #6a9955;"># optional, only used with 'html'</span>
  javascript: <span style="color: #569cd6; font-weight: 500;">nil</span>, <span style="color: #6a9955;"># optional, only used with 'html'</span>

  file_name: <span style="color: #ce9178;">"pdf-generated"</span>,
  options: { save_to_vault: <span style="color: #569cd6; font-weight: 500;">true</span> },  <span style="color: #6a9955;"># optional, default is false</span>
  ai_options: { layout_repair: <span style="color: #569cd6; font-weight: 500;">true</span> } <span style="color: #6a9955;"># optional, default is false</span>
}

req = <span style="color: #dcdcaa;">Net::HTTP::Post</span>.<span style="color: #dcdcaa;">new</span>(uri)
req[<span style="color: #ce9178;">"Authorization"</span>] = <span style="color: #ce9178;">"Bearer #{api_key}"</span>
req[<span style="color: #ce9178;">"Content-Type"</span>] = <span style="color: #ce9178;">"application/json"</span>
req.body = body.<span style="color: #dcdcaa;">to_json</span>

res = <span style="color: #dcdcaa;">Net::HTTP</span>.<span style="color: #dcdcaa;">start</span>(uri.hostname, uri.port, use_ssl: <span style="color: #569cd6; font-weight: 500;">true</span>) <span style="color: #569cd6; font-weight: 500;">do</span> |http|
  http.<span style="color: #dcdcaa;">request</span>(req)
<span style="color: #569cd6; font-weight: 500;">end</span>

<span style="color: #dcdcaa;">File</span>.<span style="color: #dcdcaa;">open</span>(<span style="color: #ce9178;">"pdf-generated.pdf"</span>, <span style="color: #ce9178;">"wb"</span>) { |f| f.<span style="color: #dcdcaa;">write</span>(res.body) }`,
    java: `<span style="color: #569cd6; font-weight: 500;">import</span> java.net.http.*;
<span style="color: #569cd6; font-weight: 500;">import</span> java.net.URI;
<span style="color: #569cd6; font-weight: 500;">import</span> java.nio.file.*;
<span style="color: #569cd6; font-weight: 500;">import</span> java.nio.charset.StandardCharsets;

<span style="color: #569cd6; font-weight: 500;">public</span> <span style="color: #569cd6; font-weight: 500;">class</span> <span style="color: #dcdcaa;">PdfExample</span> {
    <span style="color: #569cd6; font-weight: 500;">public</span> <span style="color: #569cd6; font-weight: 500;">static</span> <span style="color: #569cd6; font-weight: 500;">void</span> <span style="color: #dcdcaa;">main</span>(<span style="color: #dcdcaa;">String</span>[] args) <span style="color: #569cd6; font-weight: 500;">throws</span> <span style="color: #dcdcaa;">Exception</span> {
        <span style="color: #dcdcaa;">String</span> API_KEY = <span style="color: #ce9178;">"sk_XXXXXXXXXX"</span>;

        <span style="color: #dcdcaa;">String</span> json = <span style="color: #ce9178;">"""
        {
          "url": "https://en.wikipedia.org/wiki/PDF",
          "html": null,
          "css": null,
          "javascript": null,
          "file_name": "pdf-generated",
          "options": { "save_to_vault": true },
          "ai_options": { "layout_repair": true }
        }
        """</span>;

        <span style="color: #dcdcaa;">HttpRequest</span> request = <span style="color: #dcdcaa;">HttpRequest</span>.<span style="color: #dcdcaa;">newBuilder</span>()
            .<span style="color: #dcdcaa;">uri</span>(<span style="color: #dcdcaa;">URI</span>.<span style="color: #dcdcaa;">create</span>(<span style="color: #ce9178;">"https://picassopdf.com/api/v1/convert/pdf"</span>))
            .<span style="color: #dcdcaa;">header</span>(<span style="color: #ce9178;">"Authorization"</span>, <span style="color: #ce9178;">"Bearer "</span> + API_KEY)
            .<span style="color: #dcdcaa;">header</span>(<span style="color: #ce9178;">"Content-Type"</span>, <span style="color: #ce9178;">"application/json"</span>)
            .<span style="color: #dcdcaa;">POST</span>(<span style="color: #dcdcaa;">HttpRequest</span>.<span style="color: #dcdcaa;">BodyPublishers</span>.<span style="color: #dcdcaa;">ofString</span>(json, <span style="color: #dcdcaa;">StandardCharsets</span>.UTF_8))
            .<span style="color: #dcdcaa;">build</span>();

        <span style="color: #dcdcaa;">HttpClient</span> client = <span style="color: #dcdcaa;">HttpClient</span>.<span style="color: #dcdcaa;">newHttpClient</span>();
        <span style="color: #dcdcaa;">HttpResponse</span>&lt;<span style="color: #569cd6; font-weight: 500;">byte</span>[]&gt; response = client.<span style="color: #dcdcaa;">send</span>(request, <span style="color: #dcdcaa;">HttpResponse</span>.<span style="color: #dcdcaa;">BodyHandlers</span>.<span style="color: #dcdcaa;">ofByteArray</span>());

        <span style="color: #dcdcaa;">Files</span>.<span style="color: #dcdcaa;">write</span>(<span style="color: #dcdcaa;">Path</span>.<span style="color: #dcdcaa;">of</span>(<span style="color: #ce9178;">"pdf-generated.pdf"</span>), response.<span style="color: #dcdcaa;">body</span>());
    }
}`,
    csharp: `<span style="color: #569cd6; font-weight: 500;">using</span> System.Net.Http;
<span style="color: #569cd6; font-weight: 500;">using</span> System.Text;
<span style="color: #569cd6; font-weight: 500;">using</span> System.Text.Json;

<span style="color: #569cd6; font-weight: 500;">class</span> <span style="color: #dcdcaa;">Program</span> {
    <span style="color: #569cd6; font-weight: 500;">static</span> <span style="color: #569cd6; font-weight: 500;">async</span> <span style="color: #569cd6; font-weight: 500;">Task</span> <span style="color: #dcdcaa;">Main</span>() {
        <span style="color: #569cd6; font-weight: 500;">var</span> apiKey = <span style="color: #ce9178;">"sk_XXXXXXXXXX"</span>;
        <span style="color: #569cd6; font-weight: 500;">var</span> client = <span style="color: #569cd6; font-weight: 500;">new</span> <span style="color: #dcdcaa;">HttpClient</span>();

        <span style="color: #569cd6; font-weight: 500;">var</span> payload = <span style="color: #569cd6; font-weight: 500;">new</span> {
            <span style="color: #6a9955;">// Either 'url' or 'html' is required</span>
            url = <span style="color: #ce9178;">"https://en.wikipedia.org/wiki/PDF"</span>,
            html = (<span style="color: #569cd6; font-weight: 500;">string?</span>)<span style="color: #569cd6; font-weight: 500;">null</span>,
            css = (<span style="color: #569cd6; font-weight: 500;">string?</span>)<span style="color: #569cd6; font-weight: 500;">null</span>,        <span style="color: #6a9955;">// optional, only used with 'html'</span>
            javascript = (<span style="color: #569cd6; font-weight: 500;">string?</span>)<span style="color: #569cd6; font-weight: 500;">null</span>, <span style="color: #6a9955;">// optional, only used with 'html'</span>

            file_name = <span style="color: #ce9178;">"pdf-generated"</span>,
            options = <span style="color: #569cd6; font-weight: 500;">new</span> { save_to_vault = <span style="color: #569cd6; font-weight: 500;">true</span> },  <span style="color: #6a9955;">// optional, default is false</span>
            ai_options = <span style="color: #569cd6; font-weight: 500;">new</span> { layout_repair = <span style="color: #569cd6; font-weight: 500;">true</span> } <span style="color: #6a9955;">// optional, default is false</span>
        };

        <span style="color: #569cd6; font-weight: 500;">var</span> request = <span style="color: #569cd6; font-weight: 500;">new</span> <span style="color: #dcdcaa;">HttpRequestMessage</span>(<span style="color: #dcdcaa;">HttpMethod</span>.Post, <span style="color: #ce9178;">"https://picassopdf.com/api/v1/convert/pdf"</span>) {
            Headers = { { <span style="color: #ce9178;">"Authorization"</span>, <span style="color: #ce9178;">$"Bearer {apiKey}"</span> } },
            Content = <span style="color: #569cd6; font-weight: 500;">new</span> <span style="color: #dcdcaa;">StringContent</span>(<span style="color: #dcdcaa;">JsonSerializer</span>.<span style="color: #dcdcaa;">Serialize</span>(payload), <span style="color: #dcdcaa;">Encoding</span>.UTF8, <span style="color: #ce9178;">"application/json"</span>)
        };

        <span style="color: #569cd6; font-weight: 500;">var</span> response = <span style="color: #569cd6; font-weight: 500;">await</span> client.<span style="color: #dcdcaa;">SendAsync</span>(request);
        <span style="color: #569cd6; font-weight: 500;">var</span> bytes = <span style="color: #569cd6; font-weight: 500;">await</span> response.Content.<span style="color: #dcdcaa;">ReadAsByteArrayAsync</span>();

        <span style="color: #569cd6; font-weight: 500;">await</span> <span style="color: #dcdcaa;">File</span>.<span style="color: #dcdcaa;">WriteAllBytesAsync</span>(<span style="color: #ce9178;">"pdf-generated.pdf"</span>, bytes);
    }
}`,
    go: `<span style="color: #569cd6; font-weight: 500;">package</span> main

<span style="color: #569cd6; font-weight: 500;">import</span> (
    <span style="color: #ce9178;">"bytes"</span>
    <span style="color: #ce9178;">"encoding/json"</span>
    <span style="color: #ce9178;">"fmt"</span>
    <span style="color: #ce9178;">"net/http"</span>
)

<span style="color: #6a9955;">// use your real api key</span>
<span style="color: #569cd6; font-weight: 500;">const</span> apiKey = <span style="color: #ce9178;">"sk_XXXXXXXXXX"</span>

<span style="color: #6a9955;">// json required fields: 'html' OR 'link'</span>
<span style="color: #6a9955;">// json optional fields: 'css', 'javascript'</span>

<span style="color: #569cd6; font-weight: 500;">func</span> <span style="color: #dcdcaa;">main</span>() {
    data := <span style="color: #569cd6; font-weight: 500;">map</span>[<span style="color: #569cd6; font-weight: 500;">string</span>]<span style="color: #569cd6; font-weight: 500;">interface</span>{}{
        <span style="color: #ce9178;">"html"</span>: <span style="color: #ce9178;">"&lt;h1&gt;Go PDF&lt;/h1&gt;&lt;p&gt;Generated with Go!&lt;/p&gt;"</span>,
    }
    jsonData, _ := json.<span style="color: #dcdcaa;">Marshal</span>(data)

    req, _ := http.<span style="color: #dcdcaa;">NewRequest</span>(<span style="color: #ce9178;">"POST"</span>, <span style="color: #ce9178;">"https://picassopdf.com/api/v1/convert/pdf"</span>, 
        bytes.<span style="color: #dcdcaa;">NewBuffer</span>(jsonData))
    req.Header.<span style="color: #dcdcaa;">Set</span>(<span style="color: #ce9178;">"Authorization"</span>, <span style="color: #ce9178;">"Bearer "</span>+apiKey)
    req.Header.<span style="color: #dcdcaa;">Set</span>(<span style="color: #ce9178;">"Content-Type"</span>, <span style="color: #ce9178;">"application/json"</span>)

    client := &http.Client{}
    resp, _ := client.<span style="color: #dcdcaa;">Do</span>(req)
    <span style="color: #569cd6; font-weight: 500;">defer</span> resp.Body.<span style="color: #dcdcaa;">Close</span>()
}`,
  };

  constructor(private router: Router, private sanitizer: DomSanitizer, private apiKeysService: apiKeysService) {}

  ngOnInit(): void {
    // Load night mode preference from localStorage
    const savedNightMode = localStorage.getItem('nightMode');
    this.isNightMode = savedNightMode === 'true';
    this.applyNightMode();
    
    // Listen for night mode changes from other tabs
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Set up interval to check for night mode changes from the same tab
    this.checkNightModeInterval = setInterval(() => {
      const currentNightMode = localStorage.getItem('nightMode') === 'true';
      if (currentNightMode !== this.isNightMode) {
        this.isNightMode = currentNightMode;
        this.applyNightMode();
      }
    }, 100); // Check every 100ms
    
    // Load user data and then API keys
    this.me();
  }

  ngOnDestroy() {
    // Clean up event listeners and intervals
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    if (this.checkNightModeInterval) {
      clearInterval(this.checkNightModeInterval);
    }
  }

  me() {
    this.authService.me().subscribe({
      next: (response: any) => {
        console.log('User data received:', response.data);
        this.user = response.data;
        // Load API keys after user data is available
        this.loadApiKeys();
      },
      error: (error: any) => {
        console.error('Error fetching user data:', error);
      }
    })
  }

  createApiKey() {
    // Set loading state
    this.isCreatingApiKey = true;
    
    // Prepare the payload with essential data including user information
    const payload = {
      userId: this.user?._id || '',
      organizationId: this.user?.organizationId || '',
      name: this.newKeyName,
      description: '', // Empty description as requested
      permissions: ['pdf_conversion', 'html_to_pdf'], // Default permissions
      scopes: ['read', 'write'], // Default scopes
      rateLimits: {
        requestsPerMinute: 100,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        burstLimit: 50
      },
      keyPrefix: 'sk_live_', // Default to live key
      status: 'active',
      isActive: true
    };

    this.apiKeysService.createApiKey(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Add the new API key to the local array instead of reloading
          // Use the same structure that the backend returns when fetching (for consistency)
          const newApiKey: ApiKey = {
            _id: response.data._id,
            name: response.data.name,
            // Don't store the raw key - use the same display logic as the backend
            token: response.data.keyPrefix + response.data.keyId, // Construct display key
            key: undefined, // Don't store raw key for security
            fullKey: response.data.keyPrefix + response.data.keyId, // Use constructed display key
            keyId: response.data.keyId,
            keyVersion: response.data.keyVersion,
            lastUsed: response.data.lastUsed,
            createdAt: new Date(response.data.createdAt),
            lastModifiedAt: response.data.lastModifiedAt ? new Date(response.data.lastModifiedAt) : undefined,
            lastModifiedBy: response.data.lastModifiedBy,
            isActive: response.data.isActive,
            status: response.data.status,
            description: response.data.description,
            permissions: response.data.permissions,
            scopes: response.data.scopes,
            rateLimits: response.data.rateLimits,
            keyPrefix: response.data.keyPrefix,
            userId: response.data.userId,
            organizationId: response.data.organizationId,
            usage: response.data.usage,
            securityMetadata: response.data.securityMetadata
          };
          
          // Add to the array and maintain chronological order (newest first)
          this.apiKeys.push(newApiKey);
          // Sort by createdAt to maintain backend order (newest first)
          this.apiKeys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          console.log('API keys after sorting:', this.apiKeys.map(k => ({ name: k.name, createdAt: k.createdAt })));
          this.calculatePagination();
          
          this.resetCreateForm();
          this.showCreateModal = false;
        } else {
          this.error = response.message || 'Failed to create API key. Please try again.';
        }
        // Reset loading state
        this.isCreatingApiKey = false;
      },
      error: (error: any) => {
        console.error('Error creating API Key:', error);
        this.error = error.error?.message || 'Failed to create API key. Please try again.';
        // Reset loading state
        this.isCreatingApiKey = false;
      }
    });
  }

  loadApiKeys(): void {
    this.loading = true;
    this.error = null;

    // Pass user information to filter API keys by user
    const userParams: any = {
      userId: this.user?._id || ''
    };
    
    // Only add organizationId if it exists and is not empty
    if (this.user?.organizationId) {
      userParams.organizationId = this.user.organizationId;
    }

    console.log('Loading API keys with params:', userParams);

    this.apiKeysService.getApiKeys(userParams).subscribe({
      next: (response: any) => {
        console.log('API keys response:', response);
        if (response.success) {
          console.log('Backend returned API keys in order:', response.data.map((k: any) => ({ name: k.name, createdAt: k.createdAt })));
          this.apiKeys = this.processLoadedApiKeys(response.data || []);
          console.log('Frontend processed API keys in order:', this.apiKeys.map(k => ({ name: k.name, createdAt: k.createdAt })));
      this.calculatePagination();
        } else {
          // If the API returns success: false but it's just because there are no PDFs, treat it as empty
          this.apiKeys = [];
          this.totalPages = 0;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading API Keys:', error);
        // If it's a 404 or similar "not found" error, treat it as empty data
        if (error.status === 404 || error.status === 400) {
          this.apiKeys = [];
          this.totalPages = 0;
          this.loading = false;
        } else {
          this.error = 'Failed to load API keys. Please try again.';
          //this.toastr.error('Failed to load PDFs. Please try again.', 'Error');
      this.loading = false;
        }
      }
    });
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.apiKeys.length / this.itemsPerPage);
  }

  get paginatedApiKeys(): ApiKey[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.apiKeys.slice(startIndex, endIndex);
  }

  // Check if API key limit is reached
  get isApiKeyLimitReached(): boolean {
    return this.apiKeys.length >= this.MAX_API_KEYS;
  }

  // Get remaining API keys count
  get remainingApiKeys(): number {
    return Math.max(0, this.MAX_API_KEYS - this.apiKeys.length);
  }

  // Check if the current API key name is duplicate
  get isApiKeyNameDuplicate(): boolean {
    if (!this.newKeyName.trim()) return false;
    return this.apiKeys.some(key => 
      key.name.toLowerCase().trim() === this.newKeyName.toLowerCase().trim()
    );
  }

  // Check if the create button should be disabled
  get isCreateButtonDisabled(): boolean {
    return !this.newKeyName.trim() || 
           this.isApiKeyLimitReached || 
           this.isApiKeyNameDuplicate ||
           !!this.nameAvailabilityError;
  }

  // Check if the edit save button should be disabled
  get isEditSaveButtonDisabled(): boolean {
    return !this.editKeyName.trim() || 
           this.editKeyName.trim() === this.selectedApiKeyForEdit?.name ||
           !!this.editNameAvailabilityError;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  createNewApiKey(): void {
    if (!this.newKeyName.trim() || this.isApiKeyLimitReached || this.isCreatingApiKey) {
      return;
    }

    // Check if API key name already exists
    const existingKey = this.apiKeys.find(key => 
      key.name.toLowerCase().trim() === this.newKeyName.toLowerCase().trim()
    );

    if (existingKey) {
      this.error = 'An API key with this name already exists. Please choose a different name.';
      return;
    }

    // Call the actual API to create the key
    this.createApiKey();
  }

  resetCreateForm(): void {
    this.newKeyName = '';
    this.error = null; // Clear any errors when resetting form
    this.isCreatingApiKey = false; // Reset loading state
    this.nameAvailabilityError = ''; // Clear validation errors
  }

  // Clear error when user starts typing
  clearError(): void {
    this.error = null;
  }

  // Close create modal and reset form
  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetCreateForm();
  }

  // Process loaded API keys to ensure consistent display values
  private processLoadedApiKeys(apiKeys: any[]): ApiKey[] {
    // Backend already sorts by createdAt: -1 (newest first), so maintain that order
    return apiKeys.map(apiKey => ({
      ...apiKey,
      // Ensure consistent display values - use keyId + prefix for display
      token: apiKey.keyPrefix + apiKey.keyId,
      fullKey: apiKey.keyPrefix + apiKey.keyId,
      // Don't expose raw key for security
      key: undefined
    }));
  }

  regenerateApiKey(apiKey: ApiKey): void {
    this.selectedApiKeyForRegenerate = apiKey;
    this.regenerateKeyName = apiKey.name;
    this.showRegenerateModal = true;
  }

  confirmRegenerateApiKey(): void {
    if (!this.selectedApiKeyForRegenerate || !this.regenerateKeyName.trim()) {
      return;
    }

    this.apiKeysService.regenerateApiKey(this.selectedApiKeyForRegenerate._id, {
      userId: this.user?._id || '',
      name: this.regenerateKeyName.trim()
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
                      // Update the API key in the local array
            this.updateApiKeyInArray(this.selectedApiKeyForRegenerate!._id, {
              name: this.regenerateKeyName.trim(),
              // Use the same display logic for consistency - construct display key from keyId + prefix
              token: response.data.keyPrefix + response.data.keyId,
              key: undefined, // Don't store raw key for security
              fullKey: response.data.keyPrefix + response.data.keyId,
              lastUsed: null,
              lastModifiedAt: response.data.lastModifiedAt ? new Date(response.data.lastModifiedAt) : undefined,
              lastModifiedBy: response.data.lastModifiedBy,
              securityMetadata: response.data.securityMetadata,
              keyVersion: response.data.keyVersion
            });
          console.log('API Key regenerated successfully');
        } else {
          this.error = response.message || 'Failed to regenerate API key. Please try again.';
        }
        this.showRegenerateModal = false;
        this.selectedApiKeyForRegenerate = null;
        this.regenerateKeyName = '';
      },
      error: (error: any) => {
        console.error('Error regenerating API Key:', error);
        this.error = error.error?.message || 'Failed to regenerate API key. Please try again.';
      }
    });
  }

  toggleApiKeyStatus(apiKey: ApiKey): void {
    if (apiKey.isActive) {
      // Deactivate the API key
      this.apiKeysService.deactivateApiKey(apiKey._id, this.user?._id || '').subscribe({
        next: (response: any) => {
          if (response.success) {
            // Update the API key in the local array
            this.updateApiKeyInArray(apiKey._id, {
              isActive: false,
              status: 'inactive',
              lastModifiedAt: response.data.lastModifiedAt ? new Date(response.data.lastModifiedAt) : undefined,
              lastModifiedBy: response.data.lastModifiedBy
            });
          } else {
            this.error = response.message || 'Failed to deactivate API key. Please try again.';
          }
        },
        error: (error: any) => {
          console.error('Error deactivating API Key:', error);
          this.error = error.error?.message || 'Failed to deactivate API key. Please try again.';
        }
      });
    } else {
      // Activate the API key
      this.apiKeysService.activateApiKey(apiKey._id, this.user?._id || '').subscribe({
        next: (response: any) => {
          if (response.success) {
            // Update the API key in the local array
            this.updateApiKeyInArray(apiKey._id, {
              isActive: true,
              status: 'active',
              lastModifiedAt: response.data.lastModifiedAt ? new Date(response.data.lastModifiedAt) : undefined,
              lastModifiedBy: response.data.lastModifiedBy
            });
          } else {
            this.error = response.message || 'Failed to activate API key. Please try again.';
          }
        },
        error: (error: any) => {
          console.error('Error activating API Key:', error);
          this.error = error.error?.message || 'Failed to activate API key. Please try again.';
        }
      });
    }
  }

  generateApiToken(): string {
    // Generate a realistic API token
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'sk_';
    for (let i = 0; i < 40; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  copyToClipboard(token: string, apiKeyId: string): void {
    navigator.clipboard.writeText(token).then(() => {
      this.copiedApiKeyId = apiKeyId;
      setTimeout(() => {
        this.copiedApiKeyId = null;
      }, 2000);
    });
  }

  copyCodeExample(): void {
    const code = this.codeExamples[this.activeTab as keyof typeof this.codeExamples] || this.codeExamples.python;
    // Strip HTML tags for plain text copying
    const plainText = code.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(plainText).then(() => {
      this.showCopyFeedback();
    });
  }

  showCopyFeedback(): void {
    const copyButton = document.querySelector('.copy-button') as HTMLElement;
    if (copyButton) {
      const originalHTML = copyButton.innerHTML;
      copyButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      `;
      copyButton.style.color = '#10b981';
      
      setTimeout(() => {
        copyButton.innerHTML = originalHTML;
        copyButton.style.color = '';
      }, 2000);
    }
  }

  deleteApiKey(apiKey: ApiKey): void {
    this.selectedApiKeyForDelete = apiKey;
    this.showDeleteModal = true;
  }

  confirmDeleteApiKey(): void {
    if (this.selectedApiKeyForDelete) {
      this.apiKeysService.deleteApiKey(this.selectedApiKeyForDelete._id, this.user?._id || '').subscribe({
        next: (response: any) => {
          if (response.success) {
            // Remove from local array
            this.apiKeys = this.apiKeys.filter(key => key._id !== this.selectedApiKeyForDelete!._id);
      this.calculatePagination();
            this.showDeleteModal = false;
            this.selectedApiKeyForDelete = null;
          } else {
            this.error = response.message || 'Failed to delete API key. Please try again.';
          }
        },
        error: (error: any) => {
          console.error('Error deleting API Key:', error);
          this.error = error.error?.message || 'Failed to delete API key. Please try again.';
        }
      });
    }
  }

  deactivateApiKey(apiKey: ApiKey): void {
    this.apiKeysService.deactivateApiKey(apiKey._id, this.user?._id || '').subscribe({
      next: (response: any) => {
        if (response.success) {
          // Update the API key in the local array
          const index = this.apiKeys.findIndex(key => key._id === apiKey._id);
          if (index !== -1) {
            this.apiKeys[index].isActive = false;
            this.apiKeys[index].status = 'inactive';
          }
        } else {
          this.error = response.message || 'Failed to deactivate API key. Please try again.';
        }
      },
      error: (error: any) => {
        console.error('Error deactivating API Key:', error);
        this.error = error.error?.message || 'Failed to deactivate API key. Please try again.';
      }
    });
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Tab switching functionality
  switchTab(tabId: string): void {
    this.activeTab = tabId;
  }

  getCurrentCodeExample(): SafeHtml {
    const code = this.codeExamples[this.activeTab as keyof typeof this.codeExamples] || this.codeExamples.python;
    return this.sanitizer.bypassSecurityTrustHtml(code);
  }

  highlightSyntax(code: string, language: string): string {
    // Use inline styles for syntax highlighting like the landing page
    switch (language) {
      case 'javascript':
        return code
          .replace(/\b(const|let|var|function|await|async|if|else|return|console|log)\b/g, '<span style="color: #569cd6; font-weight: 500;">$1</span>')
          .replace(/(\/\/.*)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>')
          .replace(/'([^']*)'/g, '<span style="color: #ce9178;">\'$1\'</span>')
          .replace(/"([^"]*)"/g, '<span style="color: #ce9178;">"$1"</span>')
          .replace(/\b(\d+)\b/g, '<span style="color: #b5cea8;">$1</span>')
          .replace(/\b(true|false|null|undefined)\b/g, '<span style="color: #569cd6; font-weight: 500;">$1</span>')
          .replace(/\b(fetch|JSON|POST|GET)\b/g, '<span style="color: #dcdcaa;">$1</span>');
      
      case 'python':
        return code
          .replace(/\b(import|from|as|def|class|if|else|elif|return|print|True|False|None)\b/g, '<span style="color: #569cd6; font-weight: 500;">$1</span>')
          .replace(/(#.*)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>')
          .replace(/'([^']*)'/g, '<span style="color: #ce9178;">\'$1\'</span>')
          .replace(/"([^"]*)"/g, '<span style="color: #ce9178;">"$1"</span>')
          .replace(/\b(\d+)\b/g, '<span style="color: #b5cea8;">$1</span>')
          .replace(/\b(requests|json|post|get)\b/g, '<span style="color: #dcdcaa;">$1</span>');
      
      case 'php':
        return code
          .replace(/\b(<?php|function|class|if|else|return|echo|true|false|null)\b/g, '<span style="color: #569cd6; font-weight: 500;">$1</span>')
          .replace(/(\/\/.*)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>')
          .replace(/'([^']*)'/g, '<span style="color: #ce9178;">\'$1\'</span>')
          .replace(/"([^"]*)"/g, '<span style="color: #ce9178;">"$1"</span>')
          .replace(/\b(\d+)\b/g, '<span style="color: #b5cea8;">$1</span>')
          .replace(/\b(curl_init|curl_setopt|curl_exec|json_encode|json_decode)\b/g, '<span style="color: #dcdcaa;">$1</span>');
      
      case 'ruby':
        return code
          .replace(/\b(require|def|class|if|else|end|puts|true|false|nil)\b/g, '<span style="color: #569cd6; font-weight: 500;">$1</span>')
          .replace(/(#.*)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>')
          .replace(/'([^']*)'/g, '<span style="color: #ce9178;">\'$1\'</span>')
          .replace(/"([^"]*)"/g, '<span style="color: #ce9178;">"$1"</span>')
          .replace(/\b(\d+)\b/g, '<span style="color: #b5cea8;">$1</span>')
          .replace(/\b(URI|Net::HTTP|JSON|parse)\b/g, '<span style="color: #dcdcaa;">$1</span>');
      
      case 'java':
        return code
          .replace(/\b(import|public|class|static|void|String|int|boolean|true|false|null)\b/g, '<span style="color: #569cd6; font-weight: 500;">$1</span>')
          .replace(/(\/\/.*)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>')
          .replace(/'([^']*)'/g, '<span style="color: #ce9178;">\'$1\'</span>')
          .replace(/"([^"]*)"/g, '<span style="color: #ce9178;">"$1"</span>')
          .replace(/\b(\d+)\b/g, '<span style="color: #b5cea8;">$1</span>')
          .replace(/\b(HttpClient|HttpRequest|HttpResponse|URI|System)\b/g, '<span style="color: #dcdcaa;">$1</span>');
      
      case 'csharp':
        return code
          .replace(/\b(using|var|new|async|await|string|true|false|null)\b/g, '<span style="color: #569cd6; font-weight: 500;">$1</span>')
          .replace(/(\/\/.*)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>')
          .replace(/'([^']*)'/g, '<span style="color: #ce9178;">\'$1\'</span>')
          .replace(/"([^"]*)"/g, '<span style="color: #ce9178;">"$1"</span>')
          .replace(/\b(\d+)\b/g, '<span style="color: #b5cea8;">$1</span>')
          .replace(/\b(HttpClient|StringContent|Encoding|Console)\b/g, '<span style="color: #dcdcaa;">$1</span>');
      
      case 'go':
        return code
          .replace(/\b(package|import|func|main|var|const|true|false|nil)\b/g, '<span style="color: #569cd6; font-weight: 500;">$1</span>')
          .replace(/(\/\/.*)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>')
          .replace(/'([^']*)'/g, '<span style="color: #ce9178;">\'$1\'</span>')
          .replace(/"([^"]*)"/g, '<span style="color: #ce9178;">"$1"</span>')
          .replace(/\b(\d+)\b/g, '<span style="color: #b5cea8;">$1</span>')
          .replace(/\b(fmt|json|http|bytes|encoding)\b/g, '<span style="color: #dcdcaa;">$1</span>');
      
      default:
        return code;
    }
  }

  // Edit API key name functionality
  editApiKeyName(apiKey: ApiKey): void {
    this.selectedApiKeyForEdit = apiKey;
    this.editKeyName = apiKey.name;
    this.editNameAvailabilityError = '';
    this.showEditModal = true;
  }

  // Save API key name changes
  saveApiKeyName(): void {
    if (this.selectedApiKeyForEdit && this.editKeyName.trim() && this.editKeyName.trim() !== this.selectedApiKeyForEdit.name) {
      this.apiKeysService.editApiKey(this.selectedApiKeyForEdit._id, {
        userId: this.user?._id || '',
        name: this.editKeyName.trim(),
        description: this.selectedApiKeyForEdit.description
      }).subscribe({
        next: (response: any) => {
          if (response.success && this.selectedApiKeyForEdit) {
            // Update the API key in the local array
            this.updateApiKeyInArray(this.selectedApiKeyForEdit._id, {
              name: this.editKeyName.trim(),
              description: response.data.description,
              lastModifiedAt: response.data.lastModifiedAt ? new Date(response.data.lastModifiedAt) : undefined,
              lastModifiedBy: response.data.lastModifiedBy
            });
            console.log('API Key name updated successfully:', this.editKeyName.trim());
          } else {
            this.error = response.message || 'Failed to update API key name. Please try again.';
          }
          this.showEditModal = false;
          this.selectedApiKeyForEdit = null;
          this.editKeyName = '';
        },
        error: (error: any) => {
          console.error('Error updating API Key name:', error);
          this.error = error.error?.message || 'Failed to update API key name. Please try again.';
        }
      });
    } else {
      this.showEditModal = false;
      this.selectedApiKeyForEdit = null;
      this.editKeyName = '';
    }
  }

  // Helper method to update API key in local array
  private updateApiKeyInArray(apiKeyId: string, updates: Partial<ApiKey>): void {
    const index = this.apiKeys.findIndex(key => key._id === apiKeyId);
    if (index !== -1) {
      this.apiKeys[index] = { ...this.apiKeys[index], ...updates };
    }
  }

  // More options functionality
  showMoreOptions(apiKey: ApiKey): void {
    // This could open a dropdown menu with options like edit, regenerate, etc.
    console.log('More options for API key:', apiKey._id);
  }

  // Documentation button functionality
  openDocumentation(): void {
    // Open documentation page in a new tab
    window.open('/docs', '_blank', 'noopener,noreferrer');
  }

  applyNightMode() {
    const apiKeysContainer = document.querySelector('.api-keys-container');
    
    if (this.isNightMode) {
      apiKeysContainer?.classList.add('night-mode');
    } else {
      apiKeysContainer?.classList.remove('night-mode');
    }
  }

  handleStorageChange(event: StorageEvent) {
    if (event.key === 'nightMode') {
      this.isNightMode = event.newValue === 'true';
      this.applyNightMode();
    }
  }

  // Real-time validation methods
  onNewKeyNameChange(): void {
    this.nameAvailabilityError = '';
    if (this.newKeyName.trim()) {
      this.checkNameAvailability(this.newKeyName.trim(), 'create');
    }
  }

  onEditKeyNameChange(): void {
    this.editNameAvailabilityError = '';
    if (this.editKeyName.trim() && this.editKeyName.trim() !== this.selectedApiKeyForEdit?.name) {
      this.checkNameAvailability(this.editKeyName.trim(), 'edit');
    }
  }

  private checkNameAvailability(name: string, type: 'create' | 'edit'): void {
    if (!name.trim() || !this.user?._id) return;

    this.isCheckingNameAvailability = true;
    
    this.apiKeysService.checkApiKeyNameAvailability(this.user._id, name.trim()).subscribe({
      next: (response: any) => {
        this.isCheckingNameAvailability = false;
        if (response.success && response.available === false) {
          if (type === 'create') {
            this.nameAvailabilityError = 'An API key with this name already exists';
          } else {
            this.editNameAvailabilityError = 'An API key with this name already exists';
          }
        } else {
          if (type === 'create') {
            this.nameAvailabilityError = '';
          } else {
            this.editNameAvailabilityError = '';
          }
        }
      },
      error: (error: any) => {
        this.isCheckingNameAvailability = false;
        console.error('Error checking name availability:', error);
        // Don't show error to user for validation failures, just allow the action
        if (type === 'create') {
          this.nameAvailabilityError = '';
        } else {
          this.editNameAvailabilityError = '';
        }
      }
    });
  }

  clearValidationErrors(): void {
    this.nameAvailabilityError = '';
    this.editNameAvailabilityError = '';
  }
}
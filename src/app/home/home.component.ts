import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StripeCustomService } from '../core/services/stripe-custom.service';
import { ToastrService } from 'ngx-toastr';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  // Typing effect properties
  currentDataType = '';
  private typingInterval: any;
  private typingSpeed = 150; // milliseconds per character
  private deleteSpeed = 100; // milliseconds per character when deleting
  private pauseTime = 2000; // pause time at the end before restarting

  // Code example properties
  activeTab = 'python';
  @ViewChild('codeElement', { static: false }) codeElement!: ElementRef;
  @ViewChild('conversionCounter', { static: false }) conversionCounter!: ElementRef;

  // Interactive pricing properties
  monthlyConversions = 1000;
  pricePerCredit: number = 0.005;
  currentPlan: string = 'Free';
  isProcessingPayment: boolean = false;


  // FAQ properties
  faqItems = [
    {
      question: 'What HTML formats does PicassoPDF support?',
      answer: 'PicassoPDF supports raw HTML code, URL links, and various HTML frameworks. You can paste your HTML directly or provide a URL to any webpage.',
      isExpanded: false
    },
    {
      question: 'How long does PDF generation take?',
      answer: "PDF generation typically takes 1-3 seconds depending on the complexity of your HTML. You'll receive your PDF almost instantly.",
      isExpanded: false
    },
    {
      question: 'Can I customize the PDF styling?',
      answer: 'Yes! You can inject custom CSS, set custom headers and footers, and control page formatting to match your brand perfectly.',
      isExpanded: false
    },
    {
      question: 'What PDF formats are supported for export?',
      answer: 'We support standard PDF format with customizable page sizes (A4, Letter, etc.), margins, and quality settings.',
      isExpanded: false
    },
    {
      question: 'Can I add custom headers and footers?',
      answer: 'Absolutely! You can add custom headers and footers, page numbers, and branding elements to make your PDFs look professional.',
      isExpanded: false
    },
    {
      question: 'Do you support JavaScript rendering?',
      answer: 'Yes, we support JavaScript execution and can wait for dynamic content to load before generating your PDF.',
      isExpanded: false
    },
    {
      question: 'Can I convert multiple pages at once?',
      answer: 'Premium users can convert multiple URLs or HTML files in batch, with our parallel processing system handling large volumes efficiently.',
      isExpanded: false
    },
    {
      question: 'Is my content secure?',
      answer: 'Yes, we take security seriously. Your HTML content and generated PDFs are processed securely and you have full control over your data.',
      isExpanded: false
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private stripeCustomService: StripeCustomService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // If user is already logged in, redirect to dashboard
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/app/dashboard']);
    }
    
    // Start typing effect
    this.startTypingEffect();
    
    // Start the lottery counter animation
    this.startLotteryCounter();
    
    // Initialize recommended plan
    this.updatePricing();
    
    // Initialize slider background
    this.updateSliderBackground();
  }

  ngOnDestroy() {
    // Clean up interval when component is destroyed
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }

  startTypingEffect() {
    const text = 'URLs & HTML';
    let currentIndex = 0;
    let isDeleting = false;
    
    const typeText = () => {
      if (!isDeleting) {
        // Typing phase
        if (currentIndex < text.length) {
          this.currentDataType = text.substring(0, currentIndex + 1);
          currentIndex++;
          setTimeout(typeText, this.typingSpeed);
        } else {
          // Finished typing, pause then start deleting
          setTimeout(() => {
            isDeleting = true;
            typeText();
          }, this.pauseTime);
        }
      } else {
        // Deleting phase
        if (currentIndex > 0) {
          this.currentDataType = text.substring(0, currentIndex - 1);
          currentIndex--;
          setTimeout(typeText, this.deleteSpeed);
        } else {
          // Finished deleting, pause then start typing again
          setTimeout(() => {
            isDeleting = false;
            typeText();
          }, this.pauseTime);
        }
      }
    };
    
    // Start the typing effect
    typeText();
  }

  startLotteryCounter() {
    const targetNumber = 250000;
    const duration = 2000; // 2 seconds (faster)
    const steps = 80; // 80 steps for smoother animation
    const stepDuration = duration / steps;
    let currentStep = 0;

    const animate = () => {
      if (currentStep >= steps) {
        // Animation complete, set final number
        if (this.conversionCounter) {
          this.conversionCounter.nativeElement.textContent = targetNumber.toLocaleString();
        }
        return;
      }

      // Calculate current number based on step
      const progress = currentStep / steps;
      const currentNumber = Math.floor(targetNumber * progress);
      
      // Add some randomness for lottery effect
      const randomOffset = Math.floor(Math.random() * 1000) - 500;
      const displayNumber = Math.max(1, currentNumber + randomOffset);
      
      if (this.conversionCounter) {
        this.conversionCounter.nativeElement.textContent = displayNumber.toLocaleString();
      }

      currentStep++;
      setTimeout(animate, stepDuration);
    };

    // Start the animation immediately
    animate();
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

  goToDocs() {
    window.open('/docs', '_blank');
  }

  async startCustomSubscription() {
    console.log('startCustomSubscription called');
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

      const subscriptionRequest = {
        credits: credits,
        userId: userId,
        price: totalPrice,
        customerEmail: customerEmail
      };

      // Create Stripe checkout session
      console.log('Creating subscription request:', subscriptionRequest);
      console.log('StripeCustomService available:', !!this.stripeCustomService);
      console.log('Service method available:', !!this.stripeCustomService.createCustomSubscription);
      
      const response = await this.stripeCustomService.createCustomSubscription(subscriptionRequest).toPromise();
      console.log('Stripe response:', response);
      
      if (response && response.session && response.session.url) {
        // Redirect to Stripe checkout
        window.location.href = response.session.url;
      } else {
        this.toastr.error('Failed to create checkout session. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating custom subscription:', error);
      console.error('Error details:', error);
      console.error('Error response:', error?.error);
      console.error('Error status:', error?.status);
      console.error('Error message:', error?.message);
      this.toastr.error('An error occurred while processing your request. Please try again.');
    } finally {
      this.isProcessingPayment = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  toggleFaq(index: number) {
    this.faqItems[index].isExpanded = !this.faqItems[index].isExpanded;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getCodeSnippet(): SafeHtml {
    const snippets = {
      python: `<span style="color: #569cd6; font-weight: 500;">import</span> requests

API_KEY = <span style="color: #ce9178;">"sk_XXXXXXXXXX"</span>

res = requests.<span style="color: #dcdcaa;">post</span>(
    <span style="color: #ce9178;">"https://api.picassopdf.com/v1/convert"</span>,
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

<span style="color: #569cd6; font-weight: 500;">const</span> res = <span style="color: #569cd6; font-weight: 500;">await</span> fetch(<span style="color: #ce9178;">"https://api.picassopdf.com/v1/convert"</span>, {
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

<span style="color: #6a9955;">// json required fields: 'html' OR 'url'</span>
<span style="color: #6a9955;">// json optional fields: 'css', 'javascript'</span>

$ch = <span style="color: #dcdcaa;">curl_init</span>();

<span style="color: #dcdcaa;">curl_setopt</span>($ch, CURLOPT_URL, <span style="color: #ce9178;">'https://api.picassopdf.com/v1/convert'</span>);
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
uri = <span style="color: #dcdcaa;">URI</span>(<span style="color: #ce9178;">"https://api.picassopdf.com/v1/convert"</span>)

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

        <span style="color: #569cd6; font-weight: 500;">var</span> request = <span style="color: #569cd6; font-weight: 500;">new</span> <span style="color: #dcdcaa;">HttpRequestMessage</span>(<span style="color: #dcdcaa;">HttpMethod</span>.Post, <span style="color: #ce9178;">"https://api.picassopdf.com/v1/convert"</span>) {
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

<span style="color: #6a9955;">// json required fields: 'html' OR 'url'</span>
<span style="color: #6a9955;">// json optional fields: 'css', 'javascript'</span>

<span style="color: #569cd6; font-weight: 500;">func</span> <span style="color: #dcdcaa;">main</span>() {
    data := <span style="color: #569cd6; font-weight: 500;">map</span>[<span style="color: #569cd6; font-weight: 500;">string</span>]<span style="color: #569cd6; font-weight: 500;">interface</span>{}{
        <span style="color: #ce9178;">"html"</span>: <span style="color: #ce9178;">"&lt;h1&gt;Go PDF&lt;/h1&gt;&lt;p&gt;Generated with Go!&lt;/p&gt;"</span>,
    }
    jsonData, _ := json.<span style="color: #dcdcaa;">Marshal</span>(data)

    req, _ := http.<span style="color: #dcdcaa;">NewRequest</span>(<span style="color: #ce9178;">"POST"</span>, <span style="color: #ce9178;">"https://api.picassopdf.com/v1/convert"</span>, 
        bytes.<span style="color: #dcdcaa;">NewBuffer</span>(jsonData))
    req.Header.<span style="color: #dcdcaa;">Set</span>(<span style="color: #ce9178;">"Authorization"</span>, <span style="color: #ce9178;">"Bearer "</span>+apiKey)
    req.Header.<span style="color: #dcdcaa;">Set</span>(<span style="color: #ce9178;">"Content-Type"</span>, <span style="color: #ce9178;">"application/json"</span>)

    client := &http.Client{}
    resp, _ := client.<span style="color: #dcdcaa;">Do</span>(req)
    <span style="color: #569cd6; font-weight: 500;">defer</span> resp.Body.<span style="color: #dcdcaa;">Close</span>()
}`,
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
            .<span style="color: #dcdcaa;">uri</span>(<span style="color: #dcdcaa;">URI</span>.<span style="color: #dcdcaa;">create</span>(<span style="color: #ce9178;">"https://api.picassopdf.com/v1/convert"</span>))
            .<span style="color: #dcdcaa;">header</span>(<span style="color: #ce9178;">"Authorization"</span>, <span style="color: #ce9178;">"Bearer "</span> + API_KEY)
            .<span style="color: #dcdcaa;">header</span>(<span style="color: #ce9178;">"Content-Type"</span>, <span style="color: #ce9178;">"application/json"</span>)
            .<span style="color: #dcdcaa;">POST</span>(<span style="color: #dcdcaa;">HttpRequest</span>.<span style="color: #dcdcaa;">BodyPublishers</span>.<span style="color: #dcdcaa;">ofString</span>(json, <span style="color: #dcdcaa;">StandardCharsets</span>.UTF_8))
            .<span style="color: #dcdcaa;">build</span>();

        <span style="color: #dcdcaa;">HttpClient</span> client = <span style="color: #dcdcaa;">HttpClient</span>.<span style="color: #dcdcaa;">newHttpClient</span>();
        <span style="color: #dcdcaa;">HttpResponse</span>&lt;<span style="color: #569cd6; font-weight: 500;">byte</span>[]&gt; response = client.<span style="color: #dcdcaa;">send</span>(request, <span style="color: #dcdcaa;">HttpResponse</span>.<span style="color: #dcdcaa;">BodyHandlers</span>.<span style="color: #dcdcaa;">ofByteArray</span>());

        <span style="color: #dcdcaa;">Files</span>.<span style="color: #dcdcaa;">write</span>(<span style="color: #dcdcaa;">Path</span>.<span style="color: #dcdcaa;">of</span>(<span style="color: #ce9178;">"pdf-generated.pdf"</span>), response.<span style="color: #dcdcaa;">body</span>());
    }
}`,
    };
    
    const snippet = snippets[this.activeTab as keyof typeof snippets] || snippets.python;
    return this.sanitizer.bypassSecurityTrustHtml(snippet);
  }

  updatePricing() {
    // Update slider background
    this.updateSliderBackground();
  }

  setCredits(credits: number) {
    this.monthlyConversions = credits;
    this.updatePricing();
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

  updateSliderBackground() {
    setTimeout(() => {
      const slider = document.querySelector('.conversion-slider') as HTMLInputElement;
      if (slider) {
        const percentage = (this.monthlyConversions / 100000) * 100;
        slider.style.background = `linear-gradient(to right, var(--primary-red) 0%, var(--primary-red) ${percentage}%, #e9ecef ${percentage}%, #e9ecef 100%)`;
      }
    }, 0);
  }

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

  parseInt(value: string): number {
    return parseInt(value, 10);
  }

  onInputChange(event: any) {
    const value = event.target.value.replace(/[^0-9]/g, ''); // Remove all non-numeric characters
    const numValue = parseInt(value) || 0;
    
    if (numValue >= 1000 && numValue <= 1000000) {
      this.monthlyConversions = numValue;
      this.updatePricing();
      // Format the display with commas
      event.target.value = this.formatNumberWithCommas(numValue);
    }
  }

  onInputBlur(event: any) {
    // On blur, ensure the input shows the formatted number with commas
    event.target.value = this.formatNumberWithCommas(this.monthlyConversions);
  }

  formatNumberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  parseFormattedNumber(formattedValue: string): number {
    // Parse formatted numbers like "1k", "2.5k", "1M" back to raw numbers
    const cleanValue = formattedValue.replace(/[^0-9.kM]/g, '');
    
    if (cleanValue.includes('M')) {
      return Math.round(parseFloat(cleanValue.replace('M', '')) * 1000000);
    } else if (cleanValue.includes('k')) {
      return Math.round(parseFloat(cleanValue.replace('k', '')) * 1000);
    } else {
      return parseInt(cleanValue) || 0;
    }
  }

  copyCode() {
    if (this.codeElement && this.codeElement.nativeElement) {
      const text = this.codeElement.nativeElement.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        // Visual feedback - change button text temporarily
        const copyButton = document.querySelector('.copy-button') as HTMLElement;
        if (copyButton) {
          const originalHTML = copyButton.innerHTML;
          copyButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27ca3f" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          `;
          setTimeout(() => {
            copyButton.innerHTML = originalHTML;
          }, 2000);
        }
        console.log('Code copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy code: ', err);
      });
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}


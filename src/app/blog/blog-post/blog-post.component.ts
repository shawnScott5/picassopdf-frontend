import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: Date;
  readTime: number;
  tags: string[];
  slug: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent implements OnInit {
  blogPost: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];

  // Sample blog posts data (in a real app, this would come from a service)
  private blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'How to Convert HTML to PDF with JavaScript: Complete Guide',
      excerpt: 'Learn how to convert HTML to PDF using JavaScript with our comprehensive guide. Includes code examples, best practices, and API integration.',
      content: `
        <h2>Introduction</h2>
        <p>Converting HTML to PDF is a common requirement in web development. Whether you're generating reports, creating invoices, or archiving web content, having a reliable PDF generation solution is essential.</p>
        
        <h2>Why Use JavaScript for PDF Generation?</h2>
        <p>JavaScript offers several advantages for PDF generation:</p>
        <ul>
          <li>Client-side processing reduces server load</li>
          <li>Real-time preview capabilities</li>
          <li>Easy integration with existing web applications</li>
          <li>Rich formatting options</li>
        </ul>
        
        <h2>Getting Started with PicassoPDF API</h2>
        <p>Our PicassoPDF API makes HTML to PDF conversion simple and reliable. Here's how to get started:</p>
        
        <h3>1. Get Your API Key</h3>
        <p>First, sign up for a PicassoPDF account and get your API key from the dashboard.</p>
        
        <h3>2. Basic Implementation</h3>
        <pre><code>const response = await fetch('https://api.picassopdf.com/v1/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com',
    format: 'pdf',
    options: {
      pageSize: 'A4',
      margin: '20mm',
      printBackground: true
    }
  })
});

const result = await response.json();
console.log('PDF URL:', result.url);</code></pre>
        
        <h2>Advanced Features</h2>
        <p>PicassoPDF offers advanced features for professional PDF generation:</p>
        <ul>
          <li>Custom page sizes and orientations</li>
          <li>Header and footer customization</li>
          <li>Watermark support</li>
          <li>Password protection</li>
          <li>Batch processing</li>
        </ul>
        
        <h2>Best Practices</h2>
        <p>Follow these best practices for optimal PDF generation:</p>
        <ol>
          <li>Optimize your HTML for print media</li>
          <li>Use appropriate CSS for page breaks</li>
          <li>Test with different content lengths</li>
          <li>Handle errors gracefully</li>
          <li>Cache results when possible</li>
        </ol>
        
        <h2>Conclusion</h2>
        <p>Converting HTML to PDF with JavaScript is straightforward when you have the right tools. PicassoPDF API provides a reliable, feature-rich solution for all your PDF generation needs.</p>
      `,
      author: 'PicassoPDF Team',
      publishDate: new Date('2024-01-15'),
      readTime: 8,
      tags: ['JavaScript', 'PDF Generation', 'HTML to PDF', 'API'],
      slug: 'convert-html-to-pdf-javascript-guide',
      seoTitle: 'Convert HTML to PDF with JavaScript - Complete Tutorial | PicassoPDF',
      seoDescription: 'Learn how to convert HTML to PDF using JavaScript. Complete guide with code examples, best practices, and API integration for developers.'
    },
    {
      id: '2',
      title: 'Best PDF Generation APIs in 2024: Complete Comparison',
      excerpt: 'Compare the top PDF generation APIs available in 2024. Features, pricing, and performance analysis to help you choose the right solution.',
      content: `
        <h2>Introduction</h2>
        <p>Choosing the right PDF generation API can significantly impact your application's performance and user experience. In this comprehensive comparison, we'll analyze the top PDF generation APIs available in 2024.</p>
        
        <h2>Top PDF Generation APIs</h2>
        
        <h3>1. PicassoPDF</h3>
        <p>PicassoPDF offers a modern, developer-friendly API with excellent performance and competitive pricing.</p>
        <ul>
          <li>Fast conversion speeds</li>
          <li>AI-assisted layout repair</li>
          <li>Comprehensive documentation</li>
          <li>Flexible pricing plans</li>
        </ul>
        
        <h3>2. PDFShift</h3>
        <p>A reliable option with good performance and reasonable pricing.</p>
        
        <h3>3. HTML/CSS to PDF API</h3>
        <p>Another solid choice for basic PDF generation needs.</p>
        
        <h2>Feature Comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>PicassoPDF</th>
              <th>PDFShift</th>
              <th>HTML/CSS to PDF</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Conversion Speed</td>
              <td>Fast</td>
              <td>Good</td>
              <td>Average</td>
            </tr>
            <tr>
              <td>AI Layout Repair</td>
              <td>Yes</td>
              <td>No</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Custom Headers/Footers</td>
              <td>Yes</td>
              <td>Yes</td>
              <td>Limited</td>
            </tr>
          </tbody>
        </table>
        
        <h2>Pricing Analysis</h2>
        <p>When comparing pricing, consider not just the cost per conversion, but also the value provided by features like AI-assisted layout repair and superior performance.</p>
        
        <h2>Conclusion</h2>
        <p>While there are several good options available, PicassoPDF stands out for its combination of performance, features, and developer experience.</p>
      `,
      author: 'PicassoPDF Team',
      publishDate: new Date('2024-01-10'),
      readTime: 12,
      tags: ['PDF API', 'Comparison', 'Review', '2024'],
      slug: 'best-pdf-generation-apis-2024',
      seoTitle: 'Best PDF Generation APIs 2024 - Complete Comparison | PicassoPDF',
      seoDescription: 'Compare the best PDF generation APIs in 2024. Features, pricing, and performance analysis to help developers choose the right solution.'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meta: Meta,
    private title: Title
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      this.loadBlogPost(slug);
    });
  }

  loadBlogPost(slug: string) {
    this.blogPost = this.blogPosts.find(post => post.slug === slug) || null;
    
    if (this.blogPost) {
      // Set SEO meta tags
      this.title.setTitle(this.blogPost.seoTitle || this.blogPost.title);
      this.meta.updateTag({ name: 'description', content: this.blogPost.seoDescription || this.blogPost.excerpt });
      this.meta.updateTag({ property: 'og:title', content: this.blogPost.title });
      this.meta.updateTag({ property: 'og:description', content: this.blogPost.excerpt });
      this.meta.updateTag({ property: 'og:type', content: 'article' });
      
      // Load related posts
      this.loadRelatedPosts();
    } else {
      // Post not found, redirect to blog listing
      this.router.navigate(['/blog']);
    }
  }

  loadRelatedPosts() {
    if (!this.blogPost) return;
    
    // Find posts with similar tags
    this.relatedPosts = this.blogPosts
      .filter(post => post.id !== this.blogPost!.id)
      .filter(post => post.tags.some(tag => this.blogPost!.tags.includes(tag)))
      .slice(0, 3);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/blog']);
  }

  shareOnTwitter() {
    if (this.blogPost) {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(this.blogPost.title);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
  }

  shareOnLinkedIn() {
    if (this.blogPost) {
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(this.blogPost.title);
      const summary = encodeURIComponent(this.blogPost.excerpt);
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
      window.open(linkedInUrl, '_blank', 'width=600,height=400');
    }
  }
}

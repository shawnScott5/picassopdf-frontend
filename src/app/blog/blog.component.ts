import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'How to Convert HTML to PDF with JavaScript: Complete Guide',
      excerpt: 'Learn how to convert HTML to PDF using JavaScript with our comprehensive guide. Includes code examples, best practices, and API integration.',
      content: 'Full blog post content here...',
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
      content: 'Full blog post content here...',
      author: 'PicassoPDF Team',
      publishDate: new Date('2024-01-10'),
      readTime: 12,
      tags: ['PDF API', 'Comparison', 'Review', '2024'],
      slug: 'best-pdf-generation-apis-2024',
      seoTitle: 'Best PDF Generation APIs 2024 - Complete Comparison | PicassoPDF',
      seoDescription: 'Compare the best PDF generation APIs in 2024. Features, pricing, and performance analysis to help developers choose the right solution.'
    },
    {
      id: '3',
      title: 'Building a PDF Generator with React: Step-by-Step Tutorial',
      excerpt: 'Create a PDF generator application using React and our PDF API. Learn how to build a complete solution with file upload and download features.',
      content: 'Full blog post content here...',
      author: 'PicassoPDF Team',
      publishDate: new Date('2024-01-05'),
      readTime: 15,
      tags: ['React', 'PDF Generation', 'Tutorial', 'Frontend'],
      slug: 'building-pdf-generator-react-tutorial',
      seoTitle: 'Build PDF Generator with React - Step by Step Tutorial | PicassoPDF',
      seoDescription: 'Learn how to build a PDF generator with React. Complete tutorial with code examples, file handling, and API integration.'
    },
    {
      id: '4',
      title: 'PDF Generation Best Practices: Performance and Quality Tips',
      excerpt: 'Optimize your PDF generation process with these expert tips. Learn about performance optimization, quality settings, and common pitfalls.',
      content: 'Full blog post content here...',
      author: 'PicassoPDF Team',
      publishDate: new Date('2024-01-01'),
      readTime: 10,
      tags: ['Best Practices', 'Performance', 'Optimization', 'PDF Quality'],
      slug: 'pdf-generation-best-practices',
      seoTitle: 'PDF Generation Best Practices - Performance & Quality Tips | PicassoPDF',
      seoDescription: 'Master PDF generation with these expert best practices. Learn performance optimization, quality settings, and avoid common pitfalls.'
    }
  ];

  filteredPosts: BlogPost[] = [];
  selectedTag: string = '';

  ngOnInit() {
    this.filteredPosts = this.blogPosts;
  }

  filterByTag(tag: string) {
    this.selectedTag = tag;
    if (tag === '') {
      this.filteredPosts = this.blogPosts;
    } else {
      this.filteredPosts = this.blogPosts.filter(post => 
        post.tags.some(postTag => postTag.toLowerCase().includes(tag.toLowerCase()))
      );
    }
  }

  getAllTags(): string[] {
    const allTags = this.blogPosts.flatMap(post => post.tags);
    return [...new Set(allTags)];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss']
})
export class DocumentationComponent implements OnInit, OnDestroy {
  activeSection = 'introduction';

  constructor() {}

  ngOnInit(): void {
    // Set up scroll spy for navigation
    this.setupScrollSpy();
  }

  ngOnDestroy() {
    // Clean up event listeners
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  setupScrollSpy(): void {
    const sections = document.querySelectorAll('.doc-section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          this.activeSection = sectionId;
          
          // Update active nav link
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      observer.observe(section);
    });
  }

  copyCode(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      const text = element.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        this.showCopyFeedback(elementId);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  }

  showCopyFeedback(elementId: string): void {
    const button = document.querySelector(`[onclick="copyCode('${elementId}')"]`) as HTMLElement;
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-check"></i>';
      button.style.color = '#10b981';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.color = '';
      }, 2000);
    }
  }



  // Handle keyboard navigation
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      // Close any open modals or dropdowns
    }
  }
}

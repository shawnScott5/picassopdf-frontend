import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  result?: any;
  error?: string;
  aiAgent?: boolean;
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: string;
  htmlContent: string;
  cssContent?: string;
  jsContent?: string;
  linkUrl?: string;
  expectedBehavior: string;
}

@Component({
  selector: 'app-test-api',
  templateUrl: './test-api.component.html',
  styleUrls: ['./test-api.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class TestApiComponent implements OnInit, OnDestroy {
  private isInitialized = false;
  testForm!: FormGroup;
  isRunning = false;
  testResults: TestResult[] = [];
  selectedTestCase: TestCase | null = null;
  selectedTestCases: TestCase[] = [];
  isProductionTesting = false;
  productionUrl = 'https://api.picassopdf.com/api/conversions/convert-html-to-pdf';
  
  // Comprehensive test cases for different document types
  testCases: TestCase[] = [
    {
      id: 'service-contract',
      name: 'Service Contract',
      description: 'Professional service agreement with legal terms and conditions',
      category: 'Contracts',
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service Agreement - TechCorp Solutions</title>
</head>
<body>
    <div class="contract-header">
        <h1>SERVICE AGREEMENT</h1>
        <div class="contract-info">
            <p><strong>Agreement Date:</strong> January 15, 2024</p>
            <p><strong>Contract ID:</strong> SC-2024-001</p>
        </div>
    </div>
    
    <div class="parties-section">
        <h2>PARTIES</h2>
        <div class="party-info">
            <h3>Service Provider:</h3>
            <p><strong>TechCorp Solutions LLC</strong><br>
            123 Business Avenue, Suite 100<br>
            San Francisco, CA 94105<br>
            Phone: (555) 123-4567<br>
            Email: contracts@techcorp.com</p>
        </div>
        
        <div class="party-info">
            <h3>Client:</h3>
            <p><strong>Innovation Industries Inc.</strong><br>
            456 Corporate Drive<br>
            New York, NY 10001<br>
            Phone: (555) 987-6543<br>
            Email: procurement@innovation.com</p>
        </div>
    </div>
    
    <div class="terms-section">
        <h2>TERMS AND CONDITIONS</h2>
        
        <h3>1. SCOPE OF SERVICES</h3>
        <p>TechCorp Solutions LLC agrees to provide the following services to Innovation Industries Inc.:</p>
        <ul>
            <li>Cloud infrastructure setup and management</li>
            <li>Data migration and security implementation</li>
            <li>24/7 technical support and monitoring</li>
            <li>Monthly performance reports and optimization</li>
        </ul>
        
        <h3>2. TERM AND TERMINATION</h3>
        <p>This agreement shall commence on February 1, 2024, and continue for a period of twelve (12) months. Either party may terminate this agreement with thirty (30) days written notice.</p>
        
        <h3>3. COMPENSATION</h3>
        <p>The total compensation for services rendered under this agreement shall be $150,000, payable in monthly installments of $12,500. Payment is due within 15 days of invoice receipt.</p>
        
        <h3>4. CONFIDENTIALITY</h3>
        <p>Both parties agree to maintain strict confidentiality regarding all proprietary information shared during the course of this agreement.</p>
        
        <h3>5. LIABILITY</h3>
        <p>TechCorp Solutions LLC's liability shall not exceed the total amount paid under this agreement. Neither party shall be liable for indirect or consequential damages.</p>
    </div>
    
    <div class="signature-section">
        <h2>SIGNATURES</h2>
        <div class="signature-block">
            <p><strong>TechCorp Solutions LLC</strong></p>
            <div class="signature-line">
                <p>Signature: _________________________</p>
                <p>Name: John Smith, CEO</p>
                <p>Date: _________________________</p>
            </div>
        </div>
        
        <div class="signature-block">
            <p><strong>Innovation Industries Inc.</strong></p>
            <div class="signature-line">
                <p>Signature: _________________________</p>
                <p>Name: Sarah Johnson, CTO</p>
                <p>Date: _________________________</p>
            </div>
        </div>
    </div>
</body>
</html>`,
      cssContent: `body {
    font-family: 'Times New Roman', serif;
    line-height: 1.6;
    margin: 0;
    padding: 40px;
    color: #333;
    background: #fff;
}

.contract-header {
    text-align: center;
    border-bottom: 3px solid #2c3e50;
    padding-bottom: 20px;
    margin-bottom: 30px;
}

.contract-header h1 {
    font-size: 2.5em;
    color: #2c3e50;
    margin: 0 0 15px 0;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.contract-info {
    display: flex;
    justify-content: space-between;
    max-width: 500px;
    margin: 0 auto;
}

.parties-section {
    margin-bottom: 30px;
}

.parties-section h2 {
    background: #34495e;
    color: white;
    padding: 10px 15px;
    margin: 0 0 20px 0;
    font-size: 1.3em;
    text-transform: uppercase;
}

.party-info {
    margin-bottom: 25px;
    padding: 15px;
    border-left: 4px solid #3498db;
    background: #f8f9fa;
}

.party-info h3 {
    color: #2c3e50;
    margin: 0 0 10px 0;
    font-size: 1.1em;
}

.terms-section h2 {
    background: #34495e;
    color: white;
    padding: 10px 15px;
    margin: 30px 0 20px 0;
    font-size: 1.3em;
    text-transform: uppercase;
}

.terms-section h3 {
    color: #2c3e50;
    margin: 25px 0 10px 0;
    font-size: 1.2em;
    border-bottom: 1px solid #bdc3c7;
    padding-bottom: 5px;
}

.terms-section ul {
    margin: 15px 0;
    padding-left: 25px;
}

.terms-section li {
    margin-bottom: 8px;
}

.signature-section {
    margin-top: 50px;
    page-break-inside: avoid;
}

.signature-section h2 {
    background: #34495e;
    color: white;
    padding: 10px 15px;
    margin: 0 0 20px 0;
    font-size: 1.3em;
    text-transform: uppercase;
}

.signature-block {
    margin-bottom: 30px;
    padding: 20px;
    border: 2px solid #bdc3c7;
    background: #f8f9fa;
}

.signature-line {
    margin-top: 20px;
}

.signature-line p {
    margin: 10px 0;
    font-size: 1.1em;
}

@media print {
    body {
        padding: 20px;
    }
    
    .signature-section {
        page-break-inside: avoid;
    }
}`,
      expectedBehavior: 'Should render professional contract layout with proper typography and spacing'
    },
    {
      id: 'business-invoice',
      name: 'Business Invoice',
      description: 'Professional invoice with line items, taxes, and payment terms',
      category: 'Invoices',
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - Digital Solutions Inc.</title>
</head>
<body>
    <div class="invoice-container">
        <header class="invoice-header">
            <div class="company-info">
                <h1>Digital Solutions Inc.</h1>
                <p>123 Technology Drive<br>
                San Francisco, CA 94105<br>
                Phone: (555) 123-4567<br>
                Email: billing@digitalsolutions.com</p>
            </div>
            <div class="invoice-details">
                <h2>INVOICE</h2>
                <div class="invoice-meta">
                    <p><strong>Invoice #:</strong> INV-2024-001</p>
                    <p><strong>Date:</strong> January 15, 2024</p>
                    <p><strong>Due Date:</strong> February 14, 2024</p>
                    <p><strong>Payment Terms:</strong> Net 30</p>
                </div>
            </div>
        </header>
        
        <div class="billing-section">
            <div class="bill-to">
                <h3>Bill To:</h3>
                <p><strong>Acme Corporation</strong><br>
                Attn: Accounts Payable<br>
                456 Business Boulevard<br>
                New York, NY 10001<br>
                Phone: (555) 987-6543</p>
            </div>
            <div class="ship-to">
                <h3>Ship To:</h3>
                <p><strong>Acme Corporation</strong><br>
                IT Department<br>
                456 Business Boulevard<br>
                New York, NY 10001</p>
            </div>
        </div>
        
        <div class="services-section">
            <h3>Services Provided</h3>
            <table class="services-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Cloud Infrastructure Setup</td>
                        <td>1</td>
                        <td>$5,000.00</td>
                        <td>$5,000.00</td>
                    </tr>
                    <tr>
                        <td>Database Migration Services</td>
                        <td>40 hours</td>
                        <td>$150.00</td>
                        <td>$6,000.00</td>
                    </tr>
                    <tr>
                        <td>Security Implementation</td>
                        <td>1</td>
                        <td>$3,500.00</td>
                        <td>$3,500.00</td>
                    </tr>
                    <tr>
                        <td>Training and Documentation</td>
                        <td>16 hours</td>
                        <td>$125.00</td>
                        <td>$2,000.00</td>
                    </tr>
                    <tr>
                        <td>Monthly Support (3 months)</td>
                        <td>3</td>
                        <td>$1,500.00</td>
                        <td>$4,500.00</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="totals-section">
            <div class="totals-table">
                <div class="total-row">
                    <span class="label">Subtotal:</span>
                    <span class="amount">$21,000.00</span>
                </div>
                <div class="total-row">
                    <span class="label">Tax (8.5%):</span>
                    <span class="amount">$1,785.00</span>
                </div>
                <div class="total-row total-final">
                    <span class="label">Total Amount Due:</span>
                    <span class="amount">$22,785.00</span>
                </div>
            </div>
        </div>
        
        <div class="payment-section">
            <h3>Payment Information</h3>
            <div class="payment-methods">
                <div class="payment-method">
                    <h4>Bank Transfer</h4>
                    <p>Account: 1234567890<br>
                    Routing: 021000021<br>
                    Bank: First National Bank</p>
                </div>
                <div class="payment-method">
                    <h4>Check</h4>
                    <p>Make checks payable to:<br>
                    Digital Solutions Inc.<br>
                    Mail to billing address above</p>
                </div>
                <div class="payment-method">
                    <h4>Online Payment</h4>
                    <p>Pay securely online at:<br>
                    <a href="#">www.digitalsolutions.com/pay</a><br>
                    Reference: INV-2024-001</p>
                </div>
            </div>
        </div>
        
        <footer class="invoice-footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>Questions about this invoice? Contact us at billing@digitalsolutions.com or (555) 123-4567</p>
            <div class="footer-note">
                <p><em>This invoice is due within 30 days of the invoice date. Late payments may be subject to a 1.5% monthly service charge.</em></p>
            </div>
        </footer>
    </div>
</body>
</html>`,
      cssContent: `body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 20px;
    background: #f5f5f5;
    color: #333;
}

.invoice-container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    border-radius: 8px;
}

.invoice-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 3px solid #2c3e50;
}

.company-info h1 {
    color: #2c3e50;
    font-size: 2.2em;
    margin: 0 0 15px 0;
    font-weight: bold;
}

.company-info p {
    margin: 5px 0;
    line-height: 1.4;
    color: #666;
}

.invoice-details h2 {
    color: #2c3e50;
    font-size: 2.5em;
    margin: 0 0 20px 0;
    text-align: right;
    font-weight: bold;
}

.invoice-meta {
    text-align: right;
}

.invoice-meta p {
    margin: 8px 0;
    font-size: 1.1em;
}

.billing-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
    gap: 40px;
}

.bill-to, .ship-to {
    flex: 1;
}

.bill-to h3, .ship-to h3 {
    color: #2c3e50;
    font-size: 1.3em;
    margin: 0 0 15px 0;
    padding-bottom: 5px;
    border-bottom: 2px solid #3498db;
}

.bill-to p, .ship-to p {
    margin: 5px 0;
    line-height: 1.4;
}

.services-section {
    margin-bottom: 30px;
}

.services-section h3 {
    color: #2c3e50;
    font-size: 1.4em;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #3498db;
}

.services-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.services-table th {
    background: #34495e;
    color: white;
    padding: 15px 10px;
    text-align: left;
    font-weight: bold;
    border: 1px solid #2c3e50;
}

.services-table td {
    padding: 12px 10px;
    border: 1px solid #ddd;
    vertical-align: top;
}

.services-table tbody tr:nth-child(even) {
    background: #f8f9fa;
}

.services-table tbody tr:hover {
    background: #e3f2fd;
}

.totals-section {
    margin-bottom: 40px;
}

.totals-table {
    max-width: 300px;
    margin-left: auto;
}

.total-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 15px;
    border-bottom: 1px solid #ddd;
}

.total-row .label {
    font-weight: bold;
    color: #2c3e50;
}

.total-row .amount {
    font-weight: bold;
    color: #2c3e50;
}

.total-final {
    background: #2c3e50;
    color: white;
    font-size: 1.2em;
    border-radius: 5px;
    margin-top: 10px;
}

.total-final .label,
.total-final .amount {
    color: white;
}

.payment-section {
    margin-bottom: 30px;
}

.payment-section h3 {
    color: #2c3e50;
    font-size: 1.4em;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #3498db;
}

.payment-methods {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.payment-method {
    padding: 20px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    background: #f8f9fa;
}

.payment-method h4 {
    color: #2c3e50;
    margin: 0 0 15px 0;
    font-size: 1.1em;
}

.payment-method p {
    margin: 8px 0;
    line-height: 1.4;
    font-size: 0.95em;
}

.payment-method a {
    color: #3498db;
    text-decoration: none;
}

.payment-method a:hover {
    text-decoration: underline;
}

.invoice-footer {
    text-align: center;
    padding-top: 30px;
    border-top: 2px solid #e9ecef;
    margin-top: 30px;
}

.invoice-footer p {
    margin: 10px 0;
    line-height: 1.4;
}

.footer-note {
    margin-top: 20px;
    padding: 15px;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 5px;
}

.footer-note p {
    margin: 0;
    color: #856404;
    font-size: 0.9em;
}

@media print {
    body {
        background: white;
        padding: 0;
    }
    
    .invoice-container {
        box-shadow: none;
        border-radius: 0;
        padding: 20px;
    }
}`,
      expectedBehavior: 'Should render professional invoice with proper table formatting and totals'
    },
    {
      id: 'broken-html',
      name: 'Broken HTML',
      description: 'HTML with unclosed tags and malformed structure',
      category: 'Needs AI Repair',
      htmlContent: `<!DOCTYPE html><html><head><title>Broken HTML Test</title></head><body><div><p>This paragraph is not closed<div>Nested div without closing<span>Span inside div</div><img src="nonexistent.jpg" alt="Missing image"><table><tr><td>Cell 1<td>Cell 2</tr></table></div></body></html>`,
      expectedBehavior: 'Should be repaired by AI agent'
    },
    {
      id: 'business-proposal',
      name: 'Business Proposal',
      description: 'Professional business proposal with executive summary, methodology, and pricing',
      category: 'Proposals',
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Proposal - Cloud Migration Services</title>
</head>
<body>
    <div class="proposal-container">
        <header class="proposal-header">
            <div class="company-logo">
                <h1>CloudTech Solutions</h1>
                <p>Transforming Business Through Technology</p>
            </div>
            <div class="proposal-info">
                <h2>BUSINESS PROPOSAL</h2>
                <div class="proposal-meta">
                    <p><strong>Proposal Date:</strong> January 15, 2024</p>
                    <p><strong>Valid Until:</strong> February 15, 2024</p>
                    <p><strong>Proposal #:</strong> PRO-2024-001</p>
                </div>
            </div>
        </header>
        
        <div class="client-section">
            <h3>Prepared for:</h3>
            <p><strong>Global Manufacturing Corp.</strong><br>
            Attn: IT Director, John Anderson<br>
            789 Industrial Way<br>
            Chicago, IL 60601<br>
            Phone: (312) 555-0123</p>
        </div>
        
        <div class="executive-summary">
            <h2>Executive Summary</h2>
            <p>CloudTech Solutions is pleased to present this comprehensive proposal for your cloud migration initiative. Our team of certified cloud architects and engineers will help Global Manufacturing Corp. transition from on-premises infrastructure to a scalable, secure, and cost-effective cloud environment.</p>
            
            <div class="key-benefits">
                <h3>Key Benefits:</h3>
                <ul>
                    <li><strong>Cost Reduction:</strong> 40% reduction in infrastructure costs within 12 months</li>
                    <li><strong>Scalability:</strong> On-demand resource allocation for seasonal demands</li>
                    <li><strong>Security:</strong> Enterprise-grade security with 99.9% uptime guarantee</li>
                    <li><strong>Compliance:</strong> Full compliance with industry regulations</li>
                </ul>
            </div>
        </div>
        
        <div class="methodology-section">
            <h2>Proposed Methodology</h2>
            
            <div class="phase">
                <h3>Phase 1: Assessment & Planning (Weeks 1-2)</h3>
                <ul>
                    <li>Current infrastructure audit and documentation</li>
                    <li>Application dependency mapping</li>
                    <li>Security and compliance requirements analysis</li>
                    <li>Migration strategy development</li>
                </ul>
            </div>
            
            <div class="phase">
                <h3>Phase 2: Infrastructure Setup (Weeks 3-4)</h3>
                <ul>
                    <li>Cloud environment provisioning</li>
                    <li>Network architecture design and implementation</li>
                    <li>Security policies and access controls setup</li>
                    <li>Backup and disaster recovery configuration</li>
                </ul>
            </div>
            
            <div class="phase">
                <h3>Phase 3: Migration & Testing (Weeks 5-8)</h3>
                <ul>
                    <li>Application migration in batches</li>
                    <li>Data migration with zero downtime</li>
                    <li>Performance testing and optimization</li>
                    <li>User acceptance testing</li>
                </ul>
            </div>
            
            <div class="phase">
                <h3>Phase 4: Go-Live & Support (Weeks 9-12)</h3>
                <ul>
                    <li>Production cutover and monitoring</li>
                    <li>Staff training and documentation</li>
                    <li>24/7 support for first 30 days</li>
                    <li>Performance optimization and tuning</li>
                </ul>
            </div>
        </div>
        
        <div class="pricing-section">
            <h2>Investment & Pricing</h2>
            <div class="pricing-table">
                <table>
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Description</th>
                            <th>Investment</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Assessment & Planning</td>
                            <td>Infrastructure audit and migration strategy</td>
                            <td>$25,000</td>
                        </tr>
                        <tr>
                            <td>Infrastructure Setup</td>
                            <td>Cloud environment and security configuration</td>
                            <td>$35,000</td>
                        </tr>
                        <tr>
                            <td>Migration Services</td>
                            <td>Application and data migration</td>
                            <td>$75,000</td>
                        </tr>
                        <tr>
                            <td>Training & Support</td>
                            <td>Staff training and 30-day support</td>
                            <td>$15,000</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="2"><strong>Total Project Investment</strong></td>
                            <td><strong>$150,000</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="payment-terms">
                <h3>Payment Terms:</h3>
                <ul>
                    <li>25% upon contract signing</li>
                    <li>25% upon completion of Phase 1</li>
                    <li>25% upon completion of Phase 2</li>
                    <li>25% upon successful go-live</li>
                </ul>
            </div>
        </div>
        
        <div class="timeline-section">
            <h2>Project Timeline</h2>
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-date">Weeks 1-2</div>
                    <div class="timeline-content">
                        <h4>Assessment & Planning</h4>
                        <p>Infrastructure audit and migration strategy development</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">Weeks 3-4</div>
                    <div class="timeline-content">
                        <h4>Infrastructure Setup</h4>
                        <p>Cloud environment provisioning and security setup</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">Weeks 5-8</div>
                    <div class="timeline-content">
                        <h4>Migration & Testing</h4>
                        <p>Application migration and comprehensive testing</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">Weeks 9-12</div>
                    <div class="timeline-content">
                        <h4>Go-Live & Support</h4>
                        <p>Production deployment and ongoing support</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="next-steps">
            <h2>Next Steps</h2>
            <ol>
                <li>Review this proposal with your technical team</li>
                <li>Schedule a technical discussion with our architects</li>
                <li>Sign the service agreement to begin Phase 1</li>
                <li>Kickoff meeting scheduled within 5 business days</li>
            </ol>
        </div>
        
        <footer class="proposal-footer">
            <p><strong>Thank you for considering CloudTech Solutions for your cloud migration needs.</strong></p>
            <p>Questions? Contact us at proposals@cloudtech.com or (555) 123-4567</p>
        </footer>
    </div>
</body>
</html>`,
      cssContent: `body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 20px;
    background: #f5f5f5;
    color: #333;
    line-height: 1.6;
}

.proposal-container {
    max-width: 900px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    border-radius: 8px;
}

.proposal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 3px solid #2c3e50;
}

.company-logo h1 {
    color: #2c3e50;
    font-size: 2.5em;
    margin: 0 0 10px 0;
    font-weight: bold;
}

.company-logo p {
    color: #7f8c8d;
    font-style: italic;
    margin: 0;
    font-size: 1.1em;
}

.proposal-info h2 {
    color: #2c3e50;
    font-size: 2.2em;
    margin: 0 0 20px 0;
    text-align: right;
    font-weight: bold;
}

.proposal-meta {
    text-align: right;
}

.proposal-meta p {
    margin: 8px 0;
    font-size: 1.1em;
}

.client-section {
    margin-bottom: 40px;
    padding: 20px;
    background: #f8f9fa;
    border-left: 4px solid #3498db;
    border-radius: 5px;
}

.client-section h3 {
    color: #2c3e50;
    margin: 0 0 15px 0;
    font-size: 1.3em;
}

.client-section p {
    margin: 5px 0;
    line-height: 1.4;
}

.executive-summary {
    margin-bottom: 40px;
}

.executive-summary h2 {
    color: #2c3e50;
    font-size: 1.8em;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #3498db;
}

.key-benefits {
    margin-top: 25px;
    padding: 20px;
    background: #e8f5e8;
    border-radius: 8px;
    border: 1px solid #c3e6c3;
}

.key-benefits h3 {
    color: #2c3e50;
    margin: 0 0 15px 0;
    font-size: 1.3em;
}

.key-benefits ul {
    margin: 0;
    padding-left: 25px;
}

.key-benefits li {
    margin-bottom: 10px;
    line-height: 1.5;
}

.methodology-section {
    margin-bottom: 40px;
}

.methodology-section h2 {
    color: #2c3e50;
    font-size: 1.8em;
    margin: 0 0 25px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #3498db;
}

.phase {
    margin-bottom: 25px;
    padding: 20px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    background: #f8f9fa;
}

.phase h3 {
    color: #2c3e50;
    margin: 0 0 15px 0;
    font-size: 1.3em;
    border-bottom: 1px solid #bdc3c7;
    padding-bottom: 5px;
}

.phase ul {
    margin: 0;
    padding-left: 25px;
}

.phase li {
    margin-bottom: 8px;
    line-height: 1.5;
}

.pricing-section {
    margin-bottom: 40px;
}

.pricing-section h2 {
    color: #2c3e50;
    font-size: 1.8em;
    margin: 0 0 25px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #3498db;
}

.pricing-table table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 25px;
}

.pricing-table th {
    background: #34495e;
    color: white;
    padding: 15px 10px;
    text-align: left;
    font-weight: bold;
    border: 1px solid #2c3e50;
}

.pricing-table td {
    padding: 12px 10px;
    border: 1px solid #ddd;
    vertical-align: top;
}

.pricing-table tbody tr:nth-child(even) {
    background: #f8f9fa;
}

.total-row {
    background: #2c3e50 !important;
    color: white !important;
    font-weight: bold;
}

.total-row td {
    color: white !important;
    font-weight: bold;
}

.payment-terms {
    padding: 20px;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
}

.payment-terms h3 {
    color: #856404;
    margin: 0 0 15px 0;
    font-size: 1.2em;
}

.payment-terms ul {
    margin: 0;
    padding-left: 25px;
}

.payment-terms li {
    margin-bottom: 8px;
    color: #856404;
}

.timeline-section {
    margin-bottom: 40px;
}

.timeline-section h2 {
    color: #2c3e50;
    font-size: 1.8em;
    margin: 0 0 25px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #3498db;
}

.timeline {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    background: #f8f9fa;
}

.timeline-date {
    background: #3498db;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-weight: bold;
    min-width: 100px;
    text-align: center;
}

.timeline-content h4 {
    color: #2c3e50;
    margin: 0 0 8px 0;
    font-size: 1.2em;
}

.timeline-content p {
    margin: 0;
    color: #666;
}

.next-steps {
    margin-bottom: 40px;
}

.next-steps h2 {
    color: #2c3e50;
    font-size: 1.8em;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #3498db;
}

.next-steps ol {
    margin: 0;
    padding-left: 25px;
}

.next-steps li {
    margin-bottom: 12px;
    line-height: 1.5;
}

.proposal-footer {
    text-align: center;
    padding-top: 30px;
    border-top: 2px solid #e9ecef;
    margin-top: 30px;
}

.proposal-footer p {
    margin: 10px 0;
    line-height: 1.4;
}

@media print {
    body {
        background: white;
        padding: 0;
    }
    
    .proposal-container {
        box-shadow: none;
        border-radius: 0;
        padding: 20px;
    }
}`,
      expectedBehavior: 'Should render professional business proposal with clear sections and timeline'
    },
    {
      id: 'pitch-deck',
      name: 'Pitch Deck',
      description: 'Startup pitch deck with slides, charts, and investor presentation',
      category: 'Pitch Decks',
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pitch Deck - TechStart Solutions</title>
</head>
<body>
    <div class="pitch-deck">
        <!-- Slide 1: Title -->
        <div class="slide title-slide">
            <div class="slide-content">
                <h1>TechStart Solutions</h1>
                <h2>Revolutionizing Enterprise Software</h2>
                <div class="presenter-info">
                    <p><strong>Presented by:</strong> Sarah Chen, CEO & Founder</p>
                    <p><strong>Date:</strong> January 2024</p>
                </div>
            </div>
        </div>
        
        <!-- Slide 2: Problem -->
        <div class="slide problem-slide">
            <div class="slide-content">
                <h2>The Problem</h2>
                <div class="problem-stats">
                    <div class="stat-item">
                        <div class="stat-number">73%</div>
                        <div class="stat-label">of enterprises struggle with legacy systems</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">$2.3T</div>
                        <div class="stat-label">annual cost of technical debt</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">45%</div>
                        <div class="stat-label">of IT budgets spent on maintenance</div>
                    </div>
                </div>
                <div class="problem-description">
                    <p>Enterprise software is outdated, expensive, and difficult to maintain. Companies are trapped in cycles of technical debt that prevent innovation and growth.</p>
                </div>
            </div>
        </div>
        
        <!-- Slide 3: Solution -->
        <div class="slide solution-slide">
            <div class="slide-content">
                <h2>Our Solution</h2>
                <div class="solution-features">
                    <div class="feature-card">
                        <div class="feature-icon">🚀</div>
                        <h3>Modern Architecture</h3>
                        <p>Cloud-native, microservices-based platform built for scale</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🔧</div>
                        <h3>Easy Integration</h3>
                        <p>Seamless integration with existing enterprise systems</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">💰</div>
                        <h3>Cost Effective</h3>
                        <p>Reduce operational costs by up to 60%</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Slide 4: Market -->
        <div class="slide market-slide">
            <div class="slide-content">
                <h2>Market Opportunity</h2>
                <div class="market-data">
                    <div class="market-size">
                        <h3>Total Addressable Market</h3>
                        <div class="market-number">$180B</div>
                        <p>Global enterprise software market</p>
                    </div>
                    <div class="market-growth">
                        <h3>Market Growth</h3>
                        <div class="growth-chart">
                            <div class="chart-bar" style="height: 60%;">2021</div>
                            <div class="chart-bar" style="height: 70%;">2022</div>
                            <div class="chart-bar" style="height: 80%;">2023</div>
                            <div class="chart-bar" style="height: 100%;">2024</div>
                        </div>
                        <p>15% CAGR projected through 2027</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Slide 5: Traction -->
        <div class="slide traction-slide">
            <div class="slide-content">
                <h2>Traction & Metrics</h2>
                <div class="traction-grid">
                    <div class="metric-card">
                        <div class="metric-number">$2.5M</div>
                        <div class="metric-label">Annual Recurring Revenue</div>
                        <div class="metric-growth">+150% YoY</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-number">45</div>
                        <div class="metric-label">Enterprise Customers</div>
                        <div class="metric-growth">+200% YoY</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-number">98%</div>
                        <div class="metric-label">Customer Satisfaction</div>
                        <div class="metric-growth">Industry Leading</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-number">$50K</div>
                        <div class="metric-label">Average Contract Value</div>
                        <div class="metric-growth">+25% YoY</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Slide 6: Business Model -->
        <div class="slide business-model-slide">
            <div class="slide-content">
                <h2>Business Model</h2>
                <div class="revenue-streams">
                    <div class="revenue-item">
                        <h3>SaaS Subscriptions</h3>
                        <p>Monthly/annual recurring revenue from platform access</p>
                        <div class="revenue-percentage">70%</div>
                    </div>
                    <div class="revenue-item">
                        <h3>Professional Services</h3>
                        <p>Implementation, training, and custom development</p>
                        <div class="revenue-percentage">20%</div>
                    </div>
                    <div class="revenue-item">
                        <h3>Marketplace</h3>
                        <p>Commission from third-party integrations and apps</p>
                        <div class="revenue-percentage">10%</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Slide 7: Team -->
        <div class="slide team-slide">
            <div class="slide-content">
                <h2>Our Team</h2>
                <div class="team-grid">
                    <div class="team-member">
                        <div class="member-avatar">SC</div>
                        <h3>Sarah Chen</h3>
                        <p>CEO & Founder</p>
                        <p>Former VP Engineering at TechCorp</p>
                    </div>
                    <div class="team-member">
                        <div class="member-avatar">MJ</div>
                        <h3>Michael Johnson</h3>
                        <p>CTO & Co-Founder</p>
                        <p>Ex-Google, 15 years in enterprise software</p>
                    </div>
                    <div class="team-member">
                        <div class="member-avatar">AL</div>
                        <h3>Alex Liu</h3>
                        <p>VP of Sales</p>
                        <p>Former Salesforce, $100M+ in enterprise sales</p>
                    </div>
                    <div class="team-member">
                        <div class="member-avatar">ER</div>
                        <h3>Emily Rodriguez</h3>
                        <p>VP of Marketing</p>
                        <p>Ex-Microsoft, B2B marketing expert</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Slide 8: Financial Projections -->
        <div class="slide financials-slide">
            <div class="slide-content">
                <h2>Financial Projections</h2>
                <div class="financials-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>2024</th>
                                <th>2025</th>
                                <th>2026</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Revenue</td>
                                <td>$5M</td>
                                <td>$15M</td>
                                <td>$40M</td>
                            </tr>
                            <tr>
                                <td>Customers</td>
                                <td>100</td>
                                <td>300</td>
                                <td>750</td>
                            </tr>
                            <tr>
                                <td>ARR</td>
                                <td>$2.5M</td>
                                <td>$8M</td>
                                <td>$25M</td>
                            </tr>
                            <tr>
                                <td>Gross Margin</td>
                                <td>75%</td>
                                <td>80%</td>
                                <td>85%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Slide 9: Funding -->
        <div class="slide funding-slide">
            <div class="slide-content">
                <h2>Funding Request</h2>
                <div class="funding-details">
                    <div class="funding-amount">
                        <h3>Seeking $10M Series A</h3>
                        <p>To accelerate growth and expand market presence</p>
                    </div>
                    <div class="funding-use">
                        <h3>Use of Funds</h3>
                        <div class="fund-allocation">
                            <div class="allocation-item">
                                <span class="allocation-label">Product Development</span>
                                <span class="allocation-percent">40%</span>
                            </div>
                            <div class="allocation-item">
                                <span class="allocation-label">Sales & Marketing</span>
                                <span class="allocation-percent">35%</span>
                            </div>
                            <div class="allocation-item">
                                <span class="allocation-label">Operations</span>
                                <span class="allocation-percent">15%</span>
                            </div>
                            <div class="allocation-item">
                                <span class="allocation-label">Working Capital</span>
                                <span class="allocation-percent">10%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Slide 10: Contact -->
        <div class="slide contact-slide">
            <div class="slide-content">
                <h2>Thank You</h2>
                <div class="contact-info">
                    <h3>Let's Build the Future Together</h3>
                    <div class="contact-details">
                        <p><strong>Sarah Chen, CEO</strong></p>
                        <p>sarah@techstartsolutions.com</p>
                        <p>(555) 123-4567</p>
                        <p>www.techstartsolutions.com</p>
                    </div>
                    <div class="next-steps">
                        <h4>Next Steps:</h4>
                        <ul>
                            <li>Due diligence process</li>
                            <li>Reference customer calls</li>
                            <li>Term sheet negotiation</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
      cssContent: `body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background: #1a1a1a;
    color: #fff;
    overflow-x: auto;
}

.pitch-deck {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.slide {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    page-break-after: always;
    position: relative;
}

.slide-content {
    max-width: 1000px;
    width: 100%;
    text-align: center;
}

/* Title Slide */
.title-slide {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.title-slide h1 {
    font-size: 4em;
    margin: 0 0 20px 0;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.title-slide h2 {
    font-size: 2em;
    margin: 0 0 40px 0;
    opacity: 0.9;
}

.presenter-info {
    background: rgba(255,255,255,0.1);
    padding: 20px;
    border-radius: 10px;
    backdrop-filter: blur(10px);
}

.presenter-info p {
    margin: 10px 0;
    font-size: 1.2em;
}

/* Problem Slide */
.problem-slide {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.problem-slide h2 {
    font-size: 3em;
    margin: 0 0 40px 0;
    font-weight: bold;
}

.problem-stats {
    display: flex;
    justify-content: space-around;
    margin: 40px 0;
    flex-wrap: wrap;
    gap: 20px;
}

.stat-item {
    text-align: center;
    background: rgba(255,255,255,0.1);
    padding: 30px 20px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    min-width: 200px;
}

.stat-number {
    font-size: 3em;
    font-weight: bold;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.stat-label {
    font-size: 1.1em;
    opacity: 0.9;
}

.problem-description {
    background: rgba(255,255,255,0.1);
    padding: 30px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    margin-top: 40px;
}

.problem-description p {
    font-size: 1.3em;
    line-height: 1.6;
    margin: 0;
}

/* Solution Slide */
.solution-slide {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.solution-slide h2 {
    font-size: 3em;
    margin: 0 0 40px 0;
    font-weight: bold;
}

.solution-features {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 30px;
}

.feature-card {
    background: rgba(255,255,255,0.1);
    padding: 40px 30px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    min-width: 250px;
    flex: 1;
}

.feature-icon {
    font-size: 3em;
    margin-bottom: 20px;
}

.feature-card h3 {
    font-size: 1.5em;
    margin: 0 0 15px 0;
    font-weight: bold;
}

.feature-card p {
    font-size: 1.1em;
    line-height: 1.5;
    margin: 0;
    opacity: 0.9;
}

/* Market Slide */
.market-slide {
    background: linear-gradient(135deg, #45b7d1 0%, #96c93d 100%);
}

.market-slide h2 {
    font-size: 3em;
    margin: 0 0 40px 0;
    font-weight: bold;
}

.market-data {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    gap: 40px;
}

.market-size, .market-growth {
    background: rgba(255,255,255,0.1);
    padding: 40px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    min-width: 300px;
}

.market-number {
    font-size: 4em;
    font-weight: bold;
    margin: 20px 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.growth-chart {
    display: flex;
    align-items: end;
    justify-content: space-around;
    height: 200px;
    margin: 20px 0;
}

.chart-bar {
    background: rgba(255,255,255,0.8);
    width: 40px;
    border-radius: 5px 5px 0 0;
    display: flex;
    align-items: end;
    justify-content: center;
    color: #333;
    font-weight: bold;
    padding: 10px 0;
}

/* Traction Slide */
.traction-slide {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.traction-slide h2 {
    font-size: 3em;
    margin: 0 0 40px 0;
    font-weight: bold;
}

.traction-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
}

.metric-card {
    background: rgba(255,255,255,0.1);
    padding: 30px 20px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    text-align: center;
}

.metric-number {
    font-size: 2.5em;
    font-weight: bold;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.metric-label {
    font-size: 1.1em;
    margin-bottom: 10px;
    opacity: 0.9;
}

.metric-growth {
    font-size: 1em;
    color: #90EE90;
    font-weight: bold;
}

/* Business Model Slide */
.business-model-slide {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.business-model-slide h2 {
    font-size: 3em;
    margin: 0 0 40px 0;
    font-weight: bold;
}

.revenue-streams {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 30px;
}

.revenue-item {
    background: rgba(255,255,255,0.1);
    padding: 40px 30px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    min-width: 250px;
    flex: 1;
    position: relative;
}

.revenue-item h3 {
    font-size: 1.5em;
    margin: 0 0 15px 0;
    font-weight: bold;
}

.revenue-item p {
    font-size: 1.1em;
    line-height: 1.5;
    margin: 0 0 20px 0;
    opacity: 0.9;
}

.revenue-percentage {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255,255,255,0.2);
    padding: 10px 15px;
    border-radius: 50%;
    font-size: 1.5em;
    font-weight: bold;
}

/* Team Slide */
.team-slide {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    color: #333;
}

.team-slide h2 {
    font-size: 3em;
    margin: 0 0 40px 0;
    font-weight: bold;
}

.team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
}

.team-member {
    background: rgba(255,255,255,0.8);
    padding: 30px 20px;
    border-radius: 15px;
    text-align: center;
}

.member-avatar {
    width: 80px;
    height: 80px;
    background: #667eea;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5em;
    font-weight: bold;
    margin: 0 auto 20px auto;
}

.team-member h3 {
    font-size: 1.3em;
    margin: 0 0 10px 0;
    font-weight: bold;
}

.team-member p {
    margin: 5px 0;
    font-size: 0.95em;
    opacity: 0.8;
}

/* Financials Slide */
.financials-slide {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    color: #333;
}

.financials-slide h2 {
    font-size: 3em;
    margin: 0 0 40px 0;
    font-weight: bold;
}

.financials-table {
    background: rgba(255,255,255,0.9);
    border-radius: 15px;
    padding: 30px;
    overflow: hidden;
}

.financials-table table {
    width: 100%;
    border-collapse: collapse;
}

.financials-table th {
    background: #667eea;
    color: white;
    padding: 15px;
    text-align: left;
    font-weight: bold;
}

.financials-table td {
    padding: 15px;
    border-bottom: 1px solid #ddd;
    font-size: 1.1em;
}

.financials-table tbody tr:nth-child(even) {
    background: rgba(102, 126, 234, 0.1);
}

/* Funding Slide */
.funding-slide {
    background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
    color: #333;
}

.funding-slide h2 {
    font-size: 3em;
    margin: 0 0 40px 0;
    font-weight: bold;
}

.funding-details {
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 40px;
}

.funding-amount, .funding-use {
    background: rgba(255,255,255,0.9);
    padding: 40px;
    border-radius: 20px;
    min-width: 300px;
    flex: 1;
}

.funding-amount h3 {
    font-size: 2em;
    margin: 0 0 20px 0;
    color: #667eea;
    font-weight: bold;
}

.fund-allocation {
    margin-top: 20px;
}

.allocation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
}

.allocation-percent {
    background: #667eea;
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: bold;
}

/* Contact Slide */
.contact-slide {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.contact-slide h2 {
    font-size: 3em;
    margin: 0 0 40px 0;
    font-weight: bold;
}

.contact-info {
    background: rgba(255,255,255,0.1);
    padding: 40px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
}

.contact-info h3 {
    font-size: 1.8em;
    margin: 0 0 30px 0;
    font-weight: bold;
}

.contact-details {
    margin-bottom: 30px;
}

.contact-details p {
    margin: 10px 0;
    font-size: 1.2em;
}

.next-steps {
    text-align: left;
    max-width: 400px;
    margin: 0 auto;
}

.next-steps h4 {
    font-size: 1.3em;
    margin: 0 0 15px 0;
    font-weight: bold;
}

.next-steps ul {
    margin: 0;
    padding-left: 25px;
}

.next-steps li {
    margin: 10px 0;
    font-size: 1.1em;
}

@media print {
    .slide {
        page-break-after: always;
        min-height: 100vh;
    }
}`,
      expectedBehavior: 'Should render professional pitch deck with multiple slides and visual elements'
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      description: 'Business analytics dashboard with charts, metrics, and data visualization',
      category: 'Dashboards',
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Dashboard - Business Intelligence</title>
</head>
<body>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <div class="header-left">
                <h1>Business Analytics Dashboard</h1>
                <p>Real-time insights and performance metrics</p>
            </div>
            <div class="header-right">
                <div class="date-range">
                    <span>Last 30 Days</span>
                    <button class="date-picker">📅</button>
                </div>
                <div class="user-info">
                    <span>Welcome, John Smith</span>
                    <div class="user-avatar">JS</div>
                </div>
            </div>
        </header>
        
        <div class="dashboard-content">
            <!-- Key Metrics Row -->
            <div class="metrics-row">
                <div class="metric-card">
                    <div class="metric-icon">💰</div>
                    <div class="metric-content">
                        <h3>Total Revenue</h3>
                        <div class="metric-value">$2,847,392</div>
                        <div class="metric-change positive">+12.5% vs last month</div>
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon">👥</div>
                    <div class="metric-content">
                        <h3>Active Users</h3>
                        <div class="metric-value">45,678</div>
                        <div class="metric-change positive">+8.2% vs last month</div>
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon">📈</div>
                    <div class="metric-content">
                        <h3>Conversion Rate</h3>
                        <div class="metric-value">3.24%</div>
                        <div class="metric-change negative">-0.3% vs last month</div>
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon">🛒</div>
                    <div class="metric-content">
                        <h3>Orders</h3>
                        <div class="metric-value">12,456</div>
                        <div class="metric-change positive">+15.7% vs last month</div>
                    </div>
                </div>
            </div>
            
            <!-- Charts Row -->
            <div class="charts-row">
                <div class="chart-container">
                    <div class="chart-header">
                        <h3>Revenue Trend</h3>
                        <div class="chart-controls">
                            <button class="chart-btn active">7D</button>
                            <button class="chart-btn">30D</button>
                            <button class="chart-btn">90D</button>
                        </div>
                    </div>
                    <div class="chart-content">
                        <div class="chart-placeholder">
                            <div class="chart-bars">
                                <div class="bar" style="height: 60%;"></div>
                                <div class="bar" style="height: 75%;"></div>
                                <div class="bar" style="height: 45%;"></div>
                                <div class="bar" style="height: 85%;"></div>
                                <div class="bar" style="height: 70%;"></div>
                                <div class="bar" style="height: 90%;"></div>
                                <div class="bar" style="height: 65%;"></div>
                            </div>
                            <div class="chart-labels">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <div class="chart-header">
                        <h3>User Acquisition</h3>
                        <div class="chart-legend">
                            <div class="legend-item">
                                <span class="legend-color organic"></span>
                                <span>Organic</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color paid"></span>
                                <span>Paid</span>
                            </div>
                        </div>
                    </div>
                    <div class="chart-content">
                        <div class="pie-chart">
                            <div class="pie-slice organic" style="--percentage: 65;"></div>
                            <div class="pie-slice paid" style="--percentage: 35;"></div>
                            <div class="pie-center">
                                <span class="pie-value">100%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Data Tables Row -->
            <div class="tables-row">
                <div class="table-container">
                    <div class="table-header">
                        <h3>Top Performing Products</h3>
                        <button class="export-btn">Export</button>
                    </div>
                    <div class="table-content">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Sales</th>
                                    <th>Revenue</th>
                                    <th>Growth</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div class="product-info">
                                            <div class="product-avatar">📱</div>
                                            <div>
                                                <div class="product-name">Mobile App Pro</div>
                                                <div class="product-category">Software</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>2,456</td>
                                    <td>$245,600</td>
                                    <td class="growth positive">+18.5%</td>
                                    <td><span class="status-badge active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="product-info">
                                            <div class="product-avatar">💻</div>
                                            <div>
                                                <div class="product-name">Enterprise Suite</div>
                                                <div class="product-category">Software</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>1,234</td>
                                    <td>$617,000</td>
                                    <td class="growth positive">+12.3%</td>
                                    <td><span class="status-badge active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="product-info">
                                            <div class="product-avatar">🔧</div>
                                            <div>
                                                <div class="product-name">Dev Tools</div>
                                                <div class="product-category">Tools</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>3,567</td>
                                    <td>$178,350</td>
                                    <td class="growth negative">-2.1%</td>
                                    <td><span class="status-badge warning">Review</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="product-info">
                                            <div class="product-avatar">📊</div>
                                            <div>
                                                <div class="product-name">Analytics Pro</div>
                                                <div class="product-category">Analytics</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>987</td>
                                    <td>$197,400</td>
                                    <td class="growth positive">+25.7%</td>
                                    <td><span class="status-badge active">Active</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="table-container">
                    <div class="table-header">
                        <h3>Recent Activity</h3>
                        <button class="view-all-btn">View All</button>
                    </div>
                    <div class="activity-list">
                        <div class="activity-item">
                            <div class="activity-icon">💰</div>
                            <div class="activity-content">
                                <div class="activity-title">New subscription: Enterprise Plan</div>
                                <div class="activity-time">2 minutes ago</div>
                            </div>
                            <div class="activity-value">+$2,500</div>
                        </div>
                        
                        <div class="activity-item">
                            <div class="activity-icon">👤</div>
                            <div class="activity-content">
                                <div class="activity-title">User registration: Sarah Johnson</div>
                                <div class="activity-time">15 minutes ago</div>
                            </div>
                            <div class="activity-value">+1 user</div>
                        </div>
                        
                        <div class="activity-item">
                            <div class="activity-icon">📧</div>
                            <div class="activity-content">
                                <div class="activity-title">Email campaign sent</div>
                                <div class="activity-time">1 hour ago</div>
                            </div>
                            <div class="activity-value">5,234 sent</div>
                        </div>
                        
                        <div class="activity-item">
                            <div class="activity-icon">🔄</div>
                            <div class="activity-content">
                                <div class="activity-title">System backup completed</div>
                                <div class="activity-time">2 hours ago</div>
                            </div>
                            <div class="activity-value">Success</div>
                        </div>
                        
                        <div class="activity-item">
                            <div class="activity-icon">⚠️</div>
                            <div class="activity-content">
                                <div class="activity-title">Server maintenance scheduled</div>
                                <div class="activity-time">3 hours ago</div>
                            </div>
                            <div class="activity-value">Tonight 2AM</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Alerts and Notifications -->
            <div class="alerts-section">
                <div class="alert-card warning">
                    <div class="alert-icon">⚠️</div>
                    <div class="alert-content">
                        <h4>High Server Load</h4>
                        <p>Server CPU usage is at 85%. Consider scaling resources.</p>
                    </div>
                    <button class="alert-action">View Details</button>
                </div>
                
                <div class="alert-card info">
                    <div class="alert-icon">ℹ️</div>
                    <div class="alert-content">
                        <h4>Monthly Report Ready</h4>
                        <p>Your monthly performance report is now available for download.</p>
                    </div>
                    <button class="alert-action">Download</button>
                </div>
                
                <div class="alert-card success">
                    <div class="alert-icon">✅</div>
                    <div class="alert-content">
                        <h4>Backup Successful</h4>
                        <p>Daily backup completed successfully. All data is secure.</p>
                    </div>
                    <button class="alert-action">View Logs</button>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
      cssContent: `body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    background: #f8fafc;
    color: #1e293b;
    line-height: 1.6;
}

.dashboard-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.dashboard-header {
    background: white;
    padding: 20px 30px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
    font-size: 1.8em;
    font-weight: 700;
    margin: 0 0 5px 0;
    color: #1e293b;
}

.header-left p {
    margin: 0;
    color: #64748b;
    font-size: 0.95em;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 20px;
}

.date-range {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    background: #f1f5f9;
    border-radius: 8px;
    font-size: 0.9em;
    color: #475569;
}

.date-picker {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1em;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    background: #f1f5f9;
    border-radius: 8px;
}

.user-avatar {
    width: 32px;
    height: 32px;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8em;
    font-weight: 600;
}

.dashboard-content {
    flex: 1;
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.metrics-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.metric-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 16px;
    border: 1px solid #e2e8f0;
}

.metric-icon {
    font-size: 2.5em;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border-radius: 12px;
}

.metric-content h3 {
    font-size: 0.9em;
    font-weight: 500;
    color: #64748b;
    margin: 0 0 8px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.metric-value {
    font-size: 2em;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 4px 0;
}

.metric-change {
    font-size: 0.85em;
    font-weight: 500;
}

.metric-change.positive {
    color: #059669;
}

.metric-change.negative {
    color: #dc2626;
}

.charts-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
}

.chart-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    overflow: hidden;
}

.chart-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chart-header h3 {
    font-size: 1.1em;
    font-weight: 600;
    margin: 0;
    color: #1e293b;
}

.chart-controls {
    display: flex;
    gap: 8px;
}

.chart-btn {
    padding: 6px 12px;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 6px;
    font-size: 0.85em;
    cursor: pointer;
    transition: all 0.2s;
}

.chart-btn.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.chart-legend {
    display: flex;
    gap: 16px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85em;
    color: #64748b;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
}

.legend-color.organic {
    background: #3b82f6;
}

.legend-color.paid {
    background: #10b981;
}

.chart-content {
    padding: 24px;
}

.chart-placeholder {
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.chart-bars {
    display: flex;
    align-items: end;
    justify-content: space-between;
    height: 150px;
    gap: 8px;
}

.bar {
    background: linear-gradient(to top, #3b82f6, #60a5fa);
    border-radius: 4px 4px 0 0;
    flex: 1;
    min-height: 20px;
    transition: all 0.3s ease;
}

.bar:hover {
    background: linear-gradient(to top, #2563eb, #3b82f6);
}

.chart-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.8em;
    color: #64748b;
    margin-top: 10px;
}

.pie-chart {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: conic-gradient(
        #3b82f6 0deg 234deg,
        #10b981 234deg 360deg
    );
    position: relative;
    margin: 0 auto;
}

.pie-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #1e293b;
}

.tables-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
}

.table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    overflow: hidden;
}

.table-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table-header h3 {
    font-size: 1.1em;
    font-weight: 600;
    margin: 0;
    color: #1e293b;
}

.export-btn, .view-all-btn {
    padding: 6px 12px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.85em;
    cursor: pointer;
    transition: all 0.2s;
}

.export-btn:hover, .view-all-btn:hover {
    background: #e2e8f0;
}

.table-content {
    padding: 0;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table th {
    background: #f8fafc;
    padding: 12px 24px;
    text-align: left;
    font-size: 0.85em;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
}

.data-table td {
    padding: 16px 24px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.9em;
}

.data-table tbody tr:hover {
    background: #f8fafc;
}

.product-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.product-avatar {
    width: 40px;
    height: 40px;
    background: #f1f5f9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
}

.product-name {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 2px;
}

.product-category {
    font-size: 0.8em;
    color: #64748b;
}

.growth {
    font-weight: 600;
}

.growth.positive {
    color: #059669;
}

.growth.negative {
    color: #dc2626;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.active {
    background: #dcfce7;
    color: #166534;
}

.status-badge.warning {
    background: #fef3c7;
    color: #92400e;
}

.activity-list {
    padding: 0;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 24px;
    border-bottom: 1px solid #f1f5f9;
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-icon {
    width: 40px;
    height: 40px;
    background: #f1f5f9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1em;
}

.activity-content {
    flex: 1;
}

.activity-title {
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 2px;
}

.activity-time {
    font-size: 0.8em;
    color: #64748b;
}

.activity-value {
    font-weight: 600;
    color: #059669;
    font-size: 0.9em;
}

.alerts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.alert-card {
    padding: 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    border-left: 4px solid;
}

.alert-card.warning {
    background: #fef3c7;
    border-left-color: #f59e0b;
}

.alert-card.info {
    background: #dbeafe;
    border-left-color: #3b82f6;
}

.alert-card.success {
    background: #dcfce7;
    border-left-color: #10b981;
}

.alert-icon {
    font-size: 1.5em;
}

.alert-content {
    flex: 1;
}

.alert-content h4 {
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #1e293b;
}

.alert-content p {
    margin: 0;
    font-size: 0.9em;
    color: #64748b;
}

.alert-action {
    padding: 6px 12px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.85em;
    cursor: pointer;
    transition: all 0.2s;
}

.alert-action:hover {
    background: #f8fafc;
}

@media print {
    .dashboard-container {
        background: white;
    }
    
    .dashboard-header {
        box-shadow: none;
        border-bottom: 2px solid #e2e8f0;
    }
    
    .chart-container, .table-container, .metric-card, .alert-card {
        box-shadow: none;
        border: 1px solid #e2e8f0;
    }
}`,
      expectedBehavior: 'Should render comprehensive analytics dashboard with metrics, charts, and data tables'
    },
    {
      id: 'complex-layout',
      name: 'Complex Layout',
      description: 'HTML with complex CSS Grid and Flexbox',
      category: 'Complex',
      htmlContent: `<!DOCTYPE html><html><head><title>Complex Layout Test</title></head><body><div class="container"><div class="card">Card 1</div><div class="card">Card 2</div><div class="card">Card 3</div><div class="card">Card 4</div><div class="card">Card 5</div><div class="card">Card 6</div></div><div class="flex-container"><div>Left content</div><div>Center content</div><div>Right content</div></div></body></html>`,
      cssContent: `.container{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:20px}.card{background:linear-gradient(45deg,#ff6b6b,#4ecdc4);border-radius:10px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,0.3)}.flex-container{display:flex;justify-content:space-between;align-items:center;margin:20px 0}`,
      expectedBehavior: 'Should handle complex CSS layouts'
    },
    {
      id: 'data-tables',
      name: 'Data Tables',
      description: 'Complex tables with merged cells and styling',
      category: 'Tables',
      htmlContent: `<!DOCTYPE html><html><head><title>Data Tables Test</title></head><body><h1>Complex Data Tables</h1><table><thead><tr><th rowspan="2">Product</th><th colspan="2">Q1 Sales</th><th colspan="2">Q2 Sales</th></tr><tr><th>Units</th><th>Revenue</th><th>Units</th><th>Revenue</th></tr></thead><tbody><tr><td class="merged">Laptop Pro</td><td>150</td><td>$225,000</td><td>180</td><td>$270,000</td></tr><tr><td class="merged">Tablet Air</td><td>200</td><td>$120,000</td><td>220</td><td>$132,000</td></tr><tr><td class="highlight">Total</td><td>350</td><td>$345,000</td><td>400</td><td>$402,000</td></tr></tbody></table></body></html>`,
      cssContent: `table{border-collapse:collapse;width:100%;margin:20px 0}th,td{border:1px solid #ddd;padding:12px;text-align:left}th{background-color:#f2f2f2;font-weight:bold}.merged{background-color:#e8f4f8}.highlight{background-color:#fff3cd}`,
      expectedBehavior: 'Should handle complex table structures'
    },
    {
      id: 'responsive-design',
      name: 'Responsive Design',
      description: 'HTML with media queries and responsive elements',
      category: 'Responsive',
      htmlContent: `<!DOCTYPE html><html><head><title>Responsive Design Test</title></head><body><div class="header"><h1>Responsive Design Test</h1><p>This layout adapts to different screen sizes</p></div><div class="content"><div class="grid"><div class="card"><h3>Card 1</h3><p>This card will resize based on screen width</p></div><div class="card"><h3>Card 2</h3><p>Responsive grid layout testing</p></div><div class="card"><h3>Card 3</h3><p>Media queries should work properly</p></div></div></div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;margin:0;padding:0;font-family:Arial,sans-serif}.header{width:100%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;text-align:center;margin:0}.content{max-width:1200px;margin:0 auto;padding:20px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}.card{background:white;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);padding:20px;border:1px solid #eee}@media (max-width:768px){.grid{grid-template-columns:1fr}.header{padding:10px}}`,
      expectedBehavior: 'Should handle responsive layouts and media queries'
    },
    {
      id: 'typography-heavy',
      name: 'Typography Heavy',
      description: 'HTML with extensive typography and text formatting',
      category: 'Typography',
      htmlContent: `<!DOCTYPE html><html><head><title>Typography Test</title></head><body><h1>The Art of Typography</h1><h2>Understanding Font Hierarchy</h2><p>Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.</p><h3>Font Families</h3><p>There are several main categories of fonts: <span class="highlight">serif</span>, <span class="highlight">sans-serif</span>, <span class="highlight">monospace</span>, and <span class="highlight">display</span>.</p><div class="quote">"Good typography is invisible. Bad typography is everywhere." - Unknown</div><p>When working with typography, consider these elements:</p><ul><li>Font size and line height</li><li>Letter spacing and word spacing</li><li>Text alignment and justification</li><li>Color and contrast</li></ul><div class="code">font-family: 'Arial', sans-serif;<br>font-size: 16px;<br>line-height: 1.6;</div><div class="special-chars">Special Characters: © ® ™ € £ ¥ α β γ δ ε ζ η θ</div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;line-height:1.8;margin:40px;color:#333}h1{font-size:2.5em;text-align:center;text-decoration:underline;margin-bottom:20px}h2{font-size:1.8em;color:#2c3e50;margin:20px 0 10px}h3{font-size:1.4em;font-style:italic;margin:15px 0 8px}.highlight{background-color:yellow;font-weight:bold;padding:2px 4px}.quote{font-style:italic;border-left:4px solid #3498db;padding-left:20px;margin:20px 0;background:#f8f9fa;padding:15px 20px}.code{font-family:'Courier New',monospace;background-color:#f8f9fa;padding:10px;border-radius:4px;border:1px solid #e9ecef;margin:10px 0}.special-chars{font-size:1.2em;text-align:center;margin:20px 0;padding:10px;background:#e8f4f8;border-radius:4px}`,
      expectedBehavior: 'Should handle complex typography and text formatting'
    },
    {
      id: 'javascript-heavy',
      name: 'JavaScript Heavy',
      description: 'HTML with extensive JavaScript and dynamic content',
      category: 'JavaScript',
      htmlContent: `<!DOCTYPE html><html><head><title>JavaScript Test</title></head><body><div class="container"><h1>JavaScript Functionality Test</h1><div class="dynamic-content" id="output">Click buttons to see dynamic content</div><button class="button" onclick="addElement()">Add Element</button><button class="button" onclick="changeColor()">Change Color</button><button class="button" onclick="showTime()">Show Time</button><button class="button" onclick="clearContent()">Clear</button></div></body></html>`,
      cssContent: `.container{padding:20px;font-family:Arial,sans-serif}.dynamic-content{background-color:#f0f8ff;border:2px dashed #4169e1;padding:20px;margin:20px 0;min-height:100px}.button{background-color:#4CAF50;color:white;padding:10px 20px;border:none;border-radius:4px;cursor:pointer;margin:5px}.button:hover{background-color:#45a049}`,
      jsContent: `function addElement(){const div=document.createElement('div');div.innerHTML='<p>New element added at '+new Date().toLocaleTimeString()+'</p>';document.getElementById('output').appendChild(div)}function changeColor(){const colors=['#ff6b6b','#4ecdc4','#45b7d1','#96ceb4','#feca57'];const randomColor=colors[Math.floor(Math.random()*colors.length)];document.getElementById('output').style.backgroundColor=randomColor}function showTime(){const timeDiv=document.createElement('div');timeDiv.innerHTML='<strong>Current time: '+new Date().toLocaleString()+'</strong>';document.getElementById('output').appendChild(timeDiv)}function clearContent(){document.getElementById('output').innerHTML='Content cleared';}`,
      expectedBehavior: 'Should handle JavaScript content (may be disabled based on options)'
    },
    {
      id: 'image-heavy',
      name: 'Image Heavy',
      description: 'HTML with many images and complex image layouts',
      category: 'Images',
      htmlContent: `<!DOCTYPE html><html><head><title>Image Heavy Test</title></head><body><div class="hero-image">Hero Image Placeholder</div><div class="gallery"><div class="image-card"><div class="placeholder-image">Image 1</div><div class="image-info"><h3>Landscape</h3><p>Beautiful landscape photography</p></div></div><div class="image-card"><div class="placeholder-image">Image 2</div><div class="image-info"><h3>Architecture</h3><p>Urban architecture</p></div></div><div class="image-card"><div class="placeholder-image">Image 3</div><div class="image-info"><h3>Nature</h3><p>Nature photography</p></div></div><div class="image-card"><div class="placeholder-image">Image 4</div><div class="image-info"><h3>Portrait</h3><p>Portrait photography</p></div></div><div class="image-card"><div class="placeholder-image">Image 5</div><div class="image-info"><h3>Street</h3><p>Street photography</p></div></div><div class="image-card"><div class="placeholder-image">Image 6</div><div class="image-info"><h3>Abstract</h3><p>Abstract art</p></div></div></div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#f5f5f5}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;padding:20px}.image-card{background:white;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.1);overflow:hidden;transition:transform 0.3s ease}.image-card:hover{transform:translateY(-5px)}.placeholder-image{width:100%;height:200px;background:linear-gradient(45deg,#ff6b6b,#4ecdc4);display:flex;align-items:center;justify-content:center;color:white;font-size:1.2em;font-weight:bold}.image-info{padding:15px}.hero-image{width:100%;height:300px;background:linear-gradient(45deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:white;font-size:2em;font-weight:bold}`,
      expectedBehavior: 'Should handle multiple images and optimize if AI enabled'
    },
    {
      id: 'form-heavy',
      name: 'Form Heavy',
      description: 'HTML with complex forms and input elements',
      category: 'Forms',
      htmlContent: `<!DOCTYPE html><html><head><title>Form Test</title></head><body><h1>Complex Form Test</h1><form><div class="form-row"><div class="form-group"><label>First Name</label><input type="text" placeholder="Enter first name"></div><div class="form-group"><label>Last Name</label><input type="text" placeholder="Enter last name"></div></div><div class="form-group"><label>Email Address</label><input type="email" placeholder="Enter email"></div><div class="form-group"><label>Phone Number</label><input type="tel" placeholder="Enter phone number"></div><div class="form-group"><label>Country</label><select><option>Select country</option><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Australia</option></select></div><div class="form-group"><label>Message</label><textarea rows="4" placeholder="Enter your message"></textarea></div><div class="form-group"><label>Newsletter</label><input type="checkbox"> Subscribe to newsletter</div><button type="submit" class="submit-btn">Submit Form</button></form></body></html>`,
      cssContent: `body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px}.form-group{margin-bottom:20px}label{display:block;margin-bottom:5px;font-weight:bold}input,select,textarea{width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:16px}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:20px}.submit-btn{background-color:#007bff;color:white;padding:12px 24px;border:none;border-radius:4px;cursor:pointer;font-size:16px}.submit-btn:hover{background-color:#0056b3}`,
      expectedBehavior: 'Should handle complex form layouts and styling'
    },
    {
      id: 'print-media',
      name: 'Print Media',
      description: 'HTML with print-specific CSS and media queries',
      category: 'Print',
      htmlContent: `<!DOCTYPE html><html><head><title>Print Media Test</title></head><body><div class="header"><h1>Print Media Test Document</h1><p>This document is optimized for printing</p></div><div class="content"><h2>Section 1: Introduction</h2><p>This is the first section of our document. It should print properly with appropriate page breaks.</p><h2>Section 2: Main Content</h2><p>This section contains the main content that should flow naturally across pages when printed.</p><div class="page-break"></div><h2>Section 3: New Page</h2><p>This section should start on a new page when printed.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></div><div class="footer"><p>Page 1 of 1 | Generated on: <span id="date"></span></p></div><div class="no-print"><p>This content will not appear in print</p></div></body></html>`,
      cssContent: `body{font-family:Arial,sans-serif;margin:20px}@media print{body{margin:0;font-size:12pt}h1{page-break-after:avoid}h2{page-break-after:avoid}.no-print{display:none}.page-break{page-break-before:always}}.header{background-color:#f8f9fa;padding:20px;border-bottom:2px solid #dee2e6;margin-bottom:20px}.content{line-height:1.6}.footer{background-color:#f8f9fa;padding:20px;border-top:2px solid #dee2e6;margin-top:20px;text-align:center}.no-print{background-color:#fff3cd;padding:10px;border:1px solid #ffeaa7;border-radius:4px}`,
      jsContent: `document.getElementById('date').textContent = new Date().toLocaleDateString();`,
      expectedBehavior: 'Should handle print media queries and page breaks'
    },
    {
      id: 'inline-styles',
      name: 'Inline Styles',
      description: 'HTML with inline CSS styles (no separate CSS field)',
      category: 'Inline',
      htmlContent: `<!DOCTYPE html><html><head><title>Inline Styles Test</title></head><body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;"><h1 style="text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); margin-bottom: 30px;">Inline Styles Test</h1><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;"><div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.3);"><h3 style="color: #ffd700; margin-top: 0;">Card 1</h3><p style="line-height: 1.6;">This card uses inline styles for all styling.</p></div><div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.3);"><h3 style="color: #ffd700; margin-top: 0;">Card 2</h3><p style="line-height: 1.6;">Inline styles are embedded directly in HTML elements.</p></div><div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.3);"><h3 style="color: #ffd700; margin-top: 0;">Card 3</h3><p style="line-height: 1.6;">Perfect for testing inline CSS handling.</p></div></div></body></html>`,
      expectedBehavior: 'Should handle HTML with inline CSS styles'
    },
    {
      id: 'wikipedia-link',
      name: 'Wikipedia PDF Link',
      description: 'Test web scraping with Wikipedia PDF article',
      category: 'Link Scraping',
      htmlContent: '',
      cssContent: '',
      jsContent: '',
      linkUrl: 'https://en.wikipedia.org/wiki/PDF',
      expectedBehavior: 'Should scrape Wikipedia PDF article and convert to professional PDF'
    },
    {
      id: 'inline-scripts',
      name: 'Inline Scripts',
      description: 'HTML with inline JavaScript (no separate JS field)',
      category: 'Inline',
      htmlContent: `<!DOCTYPE html><html><head><title>Inline Scripts Test</title><style>body{font-family:Arial,sans-serif;margin:20px;background:#f5f5f5}.container{max-width:800px;margin:0 auto;background:white;padding:20px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}.button{background:#007bff;color:white;padding:10px 20px;border:none;border-radius:4px;cursor:pointer;margin:5px}.button:hover{background:#0056b3}.output{background:#f8f9fa;border:1px solid #dee2e6;padding:15px;margin:15px 0;border-radius:4px;min-height:100px}</style></head><body><div class="container"><h1>Inline JavaScript Test</h1><p>This test case has JavaScript embedded directly in the HTML.</p><div class="output" id="output">Click buttons to see inline JavaScript in action...</div><button class="button" onclick="showMessage('Hello from inline JavaScript!')">Show Message</button><button class="button" onclick="changeColor()">Change Color</button><button class="button" onclick="addTimestamp()">Add Timestamp</button><button class="button" onclick="clearOutput()">Clear</button></div><script>function showMessage(msg){document.getElementById('output').innerHTML+='<p style="color:#28a745;margin:5px 0;">'+msg+'</p>'}function changeColor(){const colors=['#ff6b6b','#4ecdc4','#45b7d1','#96ceb4','#feca57'];const randomColor=colors[Math.floor(Math.random()*colors.length)];document.getElementById('output').style.backgroundColor=randomColor}function addTimestamp(){const now=new Date();const timestamp='<p style="color:#6c757d;font-size:0.9em;margin:5px 0;">Timestamp: '+now.toLocaleString()+'</p>';document.getElementById('output').innerHTML+=timestamp}function clearOutput(){document.getElementById('output').innerHTML='Output cleared. Click buttons to see inline JavaScript in action...'}</script></body></html>`,
      expectedBehavior: 'Should handle HTML with inline JavaScript and CSS'
    },
    {
      id: 'comprehensive-stress',
      name: 'Comprehensive Stress Test',
      description: 'Combines all features: complex layouts, typography, forms, tables, and JavaScript',
      category: 'Stress Test',
      htmlContent: `<!DOCTYPE html><html><head><title>Comprehensive Stress Test</title></head><body><div class="header"><h1>Comprehensive PDF Generation Stress Test</h1><p>Testing all features together for pixel-perfect conversion</p></div><div class="main-content"><div class="section"><h2>Typography & Text</h2><p>This section tests <strong>bold text</strong>, <em>italic text</em>, <u>underlined text</u>, and <span class="highlight">highlighted text</span>.</p><div class="quote">"The best PDF generators handle complex typography with precision."</div></div><div class="section"><h2>Complex Layout</h2><div class="grid-layout"><div class="card">Card 1</div><div class="card">Card 2</div><div class="card">Card 3</div></div></div><div class="section"><h2>Data Table</h2><table><thead><tr><th>Feature</th><th>Status</th><th>Performance</th></tr></thead><tbody><tr><td>HTML Parsing</td><td>✅ Excellent</td><td>100%</td></tr><tr><td>CSS Rendering</td><td>✅ Excellent</td><td>100%</td></tr><tr><td>JavaScript Execution</td><td>✅ Excellent</td><td>100%</td></tr></tbody></table></div><div class="section"><h2>Form Elements</h2><form><input type="text" placeholder="Text input"><select><option>Option 1</option><option>Option 2</option></select><textarea placeholder="Textarea"></textarea><button type="button" onclick="testFunction()">Test Button</button></form></div></div><div class="footer"><p>Generated on: <span id="timestamp"></span></p></div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#f8f9fa}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center;margin-bottom:30px}.header h1{font-size:2.5em;margin-bottom:10px}.header p{font-size:1.2em;opacity:0.9}.main-content{max-width:1200px;margin:0 auto;padding:20px}.section{margin-bottom:40px;background:white;padding:25px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}.section h2{color:#2c3e50;margin-bottom:15px;border-bottom:2px solid #3498db;padding-bottom:5px}.highlight{background:yellow;padding:2px 4px;border-radius:3px}.quote{font-style:italic;border-left:4px solid #3498db;padding:15px 20px;background:#f8f9fa;margin:15px 0}.grid-layout{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin:20px 0}.card{background:linear-gradient(45deg,#ff6b6b,#4ecdc4);color:white;padding:20px;border-radius:8px;text-align:center;font-weight:bold}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:12px;text-align:left}th{background:#f2f2f2;font-weight:bold}form{display:grid;gap:15px;margin:20px 0}input,select,textarea{padding:10px;border:1px solid #ddd;border-radius:4px;font-size:16px}button{background:#007bff;color:white;padding:12px 24px;border:none;border-radius:4px;cursor:pointer;font-size:16px}button:hover{background:#0056b3}.footer{background:#2c3e50;color:white;text-align:center;padding:20px;margin-top:40px}`,
      jsContent: `function testFunction(){alert('JavaScript is working!');document.getElementById('timestamp').textContent=new Date().toLocaleString();}document.getElementById('timestamp').textContent=new Date().toLocaleString();`,
      expectedBehavior: 'Should handle all features combined for comprehensive testing'
    },
    {
      id: 'long-content-scroll',
      name: 'Long Content & Scrolling',
      description: 'Very long content that tests page breaks and scrolling behavior',
      category: 'Edge Cases',
      htmlContent: `<!DOCTYPE html><html><head><title>Long Content Test</title></head><body><div class="header"><h1>Long Content PDF Test</h1></div><div class="content">${Array.from({length: 50}, (_, i) => `<div class="section"><h2>Section ${i + 1}</h2><p>This is section ${i + 1} with lots of content to test page breaks and scrolling behavior. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p><ul><li>Item 1 in section ${i + 1}</li><li>Item 2 in section ${i + 1}</li><li>Item 3 in section ${i + 1}</li></ul></div>`).join('')}</div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;line-height:1.6}.header{background:#2c3e50;color:white;padding:20px;text-align:center}.content{max-width:800px;margin:0 auto;padding:20px}.section{margin-bottom:30px;padding:20px;background:#f8f9fa;border-left:4px solid #3498db}.section h2{color:#2c3e50;margin-bottom:10px}.section p{margin-bottom:15px}.section ul{margin-left:20px}`,
      expectedBehavior: 'Should handle long content with proper page breaks'
    },
    {
      id: 'unicode-special-chars',
      name: 'Unicode & Special Characters',
      description: 'Tests Unicode characters, emojis, and special symbols',
      category: 'Edge Cases',
      htmlContent: `<!DOCTYPE html><html><head><title>Unicode Test</title><meta charset="UTF-8"></head><body><h1>Unicode & Special Characters Test</h1><div class="unicode-section"><h2>Emojis & Symbols</h2><p>😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🥰 😍 🤩 😘 😗 😚 😙 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 🤥</p><h2>Mathematical Symbols</h2><p>∑ ∏ ∫ ∮ ∇ ∆ ∞ ≈ ≠ ≤ ≥ ± × ÷ √ ∛ ∜ α β γ δ ε ζ η θ λ μ π ρ σ τ φ χ ψ ω</p><h2>Currency Symbols</h2><p>$ € £ ¥ ₹ ₽ ₩ ₪ ₫ ₨ ₦ ₡ ₵ ₴ ₸ ₺ ₼ ₾</p><h2>International Characters</h2><p>中文 日本語 한국어 العربية עברית Русский Español Français Deutsch Italiano Português</p><h2>Special Punctuation</h2><p>"Smart quotes" 'apostrophes' — em dashes – en dashes … ellipses</p></div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;line-height:1.8;margin:20px;background:#f8f9fa}.unicode-section{max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}h1{text-align:center;color:#2c3e50;margin-bottom:30px}h2{color:#34495e;border-bottom:2px solid #3498db;padding-bottom:5px;margin:25px 0 15px}p{font-size:16px;margin-bottom:20px;word-wrap:break-word}`,
      expectedBehavior: 'Should render all Unicode characters and symbols correctly'
    },
    {
      id: 'nested-lists-complex',
      name: 'Complex Nested Lists',
      description: 'Deeply nested lists with mixed types and complex styling',
      category: 'Edge Cases',
      htmlContent: `<!DOCTYPE html><html><head><title>Nested Lists Test</title></head><body><h1>Complex Nested Lists Test</h1><div class="list-container"><ol class="main-list"><li>First Level Item 1<ul class="nested-ul"><li>Second Level Item 1.1<ol class="nested-ol"><li>Third Level Item 1.1.1<ul class="deep-ul"><li>Fourth Level Item 1.1.1.1</li><li>Fourth Level Item 1.1.1.2</li></ul></li><li>Third Level Item 1.1.2</li></ol></li><li>Second Level Item 1.2</li></ul></li><li>First Level Item 2<ol class="nested-ol"><li>Second Level Item 2.1<ul class="nested-ul"><li>Third Level Item 2.1.1</li><li>Third Level Item 2.1.2</li></ul></li><li>Second Level Item 2.2</li></ol></li><li>First Level Item 3<ul class="nested-ul"><li>Second Level Item 3.1</li><li>Second Level Item 3.2<ol class="nested-ol"><li>Third Level Item 3.2.1</li><li>Third Level Item 3.2.2</li></ol></li></ul></li></ol></div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;line-height:1.6;margin:20px;background:#f8f9fa}.list-container{max-width:600px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}h1{text-align:center;color:#2c3e50;margin-bottom:30px}.main-list{font-size:16px;line-height:1.8}.nested-ul{list-style-type:disc;margin:10px 0 10px 30px}.nested-ol{list-style-type:decimal;margin:10px 0 10px 30px}.deep-ul{list-style-type:circle;margin:10px 0 10px 30px}li{margin:5px 0}`,
      expectedBehavior: 'Should handle deeply nested lists with proper indentation'
    },
    {
      id: 'css-grid-complex',
      name: 'Complex CSS Grid',
      description: 'Advanced CSS Grid with overlapping, named lines, and complex layouts',
      category: 'Edge Cases',
      htmlContent: `<!DOCTYPE html><html><head><title>Complex CSS Grid Test</title></head><body><div class="grid-container"><div class="header">Header</div><div class="sidebar">Sidebar</div><div class="main">Main Content</div><div class="aside">Aside</div><div class="footer">Footer</div><div class="overlay">Overlay Content</div></div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;margin:20px;background:#f5f5f5}.grid-container{display:grid;grid-template-columns:[sidebar-start] 200px [sidebar-end main-start] 1fr [main-end aside-start] 150px [aside-end];grid-template-rows:[header-start] 80px [header-end main-start] 1fr [main-end footer-start] 60px [footer-end];grid-template-areas:"header header header" "sidebar main aside" "footer footer footer";gap:10px;height:80vh;background:white;padding:20px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.1)}.header{grid-area:header;background:linear-gradient(45deg,#667eea,#764ba2);color:white;display:flex;align-items:center;justify-content:center;font-size:1.5em;font-weight:bold;border-radius:6px}.sidebar{grid-area:sidebar;background:#e8f4f8;padding:20px;border-radius:6px;border-left:4px solid #3498db}.main{grid-area:main;background:#f8f9fa;padding:20px;border-radius:6px;border:2px solid #dee2e6}.aside{grid-area:aside;background:#fff3cd;padding:20px;border-radius:6px;border-right:4px solid #ffc107}.footer{grid-area:footer;background:#2c3e50;color:white;display:flex;align-items:center;justify-content:center;border-radius:6px}.overlay{grid-column:main-start/main-end;grid-row:main-start/main-end;background:rgba(255,255,255,0.9);padding:20px;border-radius:6px;border:2px dashed #007bff;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#007bff}`,
      expectedBehavior: 'Should handle complex CSS Grid layouts with named lines and overlapping'
    }
  ];

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Form will be initialized in ngOnInit
  }

  ngOnInit(): void {
    console.log('TestApiComponent ngOnInit - Starting initialization...');
    
    // Initialize the component
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    // Clean up any resources if needed
  }

  // Removed aggressive visibility change handler to prevent test case cards from breaking

  private initializeComponent(): void {
    console.log('Initializing Test API component...');
    
    // Only initialize if we haven't already done so
    if (this.isInitialized) {
      console.log('Component already initialized, skipping...');
      return;
    }
    
         // Initialize the form
     this.testForm = this.fb.group({
       linkUrl: [''],
       html: [''],
       css: [''],
       javascript: [''],
       aiOptions: this.fb.group({
         layoutRepair: [false],
         textCleanup: [false],
         imageOptimization: [false]
       }),
       options: this.fb.group({
         saveToVault: [false]
       })
     });

     // Add dynamic validation
     this.testForm.get('linkUrl')?.valueChanges.subscribe(linkUrl => {
       const htmlControl = this.testForm.get('html');
       if (linkUrl) {
         htmlControl?.clearValidators();
       } else {
         htmlControl?.setValidators([Validators.required]);
       }
       htmlControl?.updateValueAndValidity();
     });

     this.testForm.get('html')?.valueChanges.subscribe(html => {
       const linkControl = this.testForm.get('linkUrl');
       if (html) {
         linkControl?.clearValidators();
       } else {
         // Don't add required validator to linkUrl, just clear it
         linkControl?.clearValidators();
       }
       linkControl?.updateValueAndValidity();
     });

    console.log('Form initialized:', this.testForm);
    console.log('Test cases available:', this.testCases.length);
    
    // Use setTimeout to ensure form is fully initialized before selecting test case
    setTimeout(() => {
    if (this.testCases.length > 0) {
      console.log('Selecting first test case:', this.testCases[0]);
    this.selectTestCase(this.testCases[0]);
        this.isInitialized = true;
    } else {
      console.error('No test cases available!');
    }
    }, 100);
    
    console.log('Component initialization complete');
    
    // Additional debugging for test cases
    this.debugTestCases();
  }

  private debugTestCases(): void {
    console.log('=== TEST CASES DEBUG ===');
    console.log('Total test cases:', this.testCases.length);
    this.testCases.forEach((testCase, index) => {
      console.log(`Test Case ${index + 1}:`, {
        id: testCase.id,
        name: testCase.name,
        category: testCase.category,
        hasCSS: !!testCase.cssContent,
        hasJS: !!testCase.jsContent,
        htmlLength: testCase.htmlContent?.length || 0,
        description: testCase.description
      });
    });
    console.log('=== END DEBUG ===');
  }

  // Method to manually refresh test cases display (simplified)
  refreshTestCases(): void {
    console.log('Manually refreshing test cases...');
    this.debugTestCases();
    
    // Re-select the current test case if one is selected
    if (this.selectedTestCase) {
      const currentId = this.selectedTestCase.id;
      const refreshedTestCase = this.testCases.find(tc => tc.id === currentId);
      if (refreshedTestCase) {
        this.selectTestCase(refreshedTestCase);
      }
    } else if (this.testCases.length > 0) {
      // If no test case is selected, select the first one
      this.selectTestCase(this.testCases[0]);
    }
    
    console.log('Test cases refreshed');
  }

  selectTestCase(testCase: TestCase): void {
    console.log('Selecting test case:', testCase);
    
    if (!testCase) {
      console.error('No test case provided to selectTestCase');
      return;
    }
    
    this.selectedTestCase = testCase;
    
    if (this.testForm) {
      // Auto-enable layout repair for Broken HTML test case
      const shouldEnableLayoutRepair = testCase.id === 'broken-html' || testCase.category === 'Needs AI Repair';
      
      this.testForm.patchValue({
        linkUrl: testCase.linkUrl || '',
        html: testCase.htmlContent,
        css: testCase.cssContent || '',
        javascript: testCase.jsContent || '',
        aiOptions: {
          layoutRepair: shouldEnableLayoutRepair,
          textCleanup: false,
          imageOptimization: false
        }
      });
      
      console.log('Form values after selection:', this.testForm.value);
      console.log('Layout repair auto-enabled for Broken HTML:', shouldEnableLayoutRepair);
    } else {
      console.error('Form not initialized when trying to select test case');
    }
  }

  toggleTestCaseSelection(testCase: TestCase): void {
    const index = this.selectedTestCases.findIndex(tc => tc.id === testCase.id);
    if (index > -1) {
      this.selectedTestCases.splice(index, 1);
    } else {
      this.selectedTestCases.push(testCase);
    }
  }

  isTestCaseSelected(testCase: TestCase): boolean {
    return this.selectedTestCases.some(tc => tc.id === testCase.id);
  }

  selectAllTestCases(): void {
    this.selectedTestCases = [...this.testCases];
  }

  clearTestCaseSelection(): void {
    this.selectedTestCases = [];
  }

  runSingleTest(): void {
    // Custom validation: either linkUrl OR html must be provided
    const linkUrl = this.testForm.value.linkUrl;
    const html = this.testForm.value.html;
    
    if (!linkUrl && !html) {
      this.toastr.error('Please provide either a website link OR HTML content');
      return;
    }
    
    if (linkUrl && html) {
      this.toastr.error('Please provide either a website link OR HTML content, not both');
      return;
    }

         const testResult: TestResult = {
       id: Date.now().toString(),
       name: this.selectedTestCase?.name || 'Custom Test',
       status: 'running',
       startTime: new Date(),
       aiAgent: this.testForm.value.aiOptions.layoutRepair || this.testForm.value.aiOptions.imageOptimization
     };

    this.testResults.unshift(testResult);
    this.isRunning = true;

    // Build payload based on input type
    let payload: any = {
      fileName: `${this.selectedTestCase?.id || 'test'}-${Date.now()}`,
      options: {
        saveToVault: this.testForm.value.options.saveToVault
      },
      aiOptions: {
        layoutRepair: this.testForm.value.aiOptions.layoutRepair,
        textCleanup: this.testForm.value.aiOptions.textCleanup,
        imageOptimization: this.testForm.value.aiOptions.imageOptimization
      }
    };

    // If link URL is provided, use url scraping
    if (this.testForm.value.linkUrl) {
      payload.url = this.testForm.value.linkUrl;
    } else {
      // Combine HTML, CSS, and JavaScript into a single HTML string
      let combinedHTML = this.testForm.value.html;
      
      // Add CSS if present
      if (this.testForm.value.css) {
        combinedHTML = combinedHTML.replace('</head>', `<style>${this.testForm.value.css}</style></head>`);
      }
      
      // Add JavaScript if present
      if (this.testForm.value.javascript) {
        combinedHTML = combinedHTML.replace('</body>', `<script>${this.testForm.value.javascript}</script></body>`);
      }
      
      payload.html = combinedHTML;
      payload.css = this.testForm.value.css || undefined;
      payload.javascript = this.testForm.value.javascript || undefined;
    }

         // Debug form values
     console.log('=== FORM VALUES DEBUG ===');
     console.log('Form value:', this.testForm.value);
     console.log('Options value:', this.testForm.value.options);
     console.log('SaveToVault value:', this.testForm.value.options.saveToVault);
     console.log('AI Options value:', this.testForm.value.aiOptions);
     console.log('Layout Repair value:', this.testForm.value.aiOptions.layoutRepair);
     console.log('=== END FORM DEBUG ===');

    // Log the exact payload being sent to the API
    console.log('=== API PAYLOAD DEBUG ===');
    console.log('Payload being sent:', payload);
    if (payload.url) {
      console.log('URL to scrape:', payload.url);
    } else {
      console.log('HTML content length:', payload.html?.length || 0);
      console.log('Original HTML length:', this.testForm.value.html.length);
      console.log('CSS length:', this.testForm.value.css?.length || 0);
      console.log('JavaScript length:', this.testForm.value.javascript?.length || 0);
    }
    console.log('=== END PAYLOAD DEBUG ===');

    this.http.post('https://api.picassopdf.com/api/conversions/convert-html-to-pdf', payload)
      .subscribe({
        next: (response: any) => {
          // Find the specific test result by ID and update it
          const resultIndex = this.testResults.findIndex(r => r.id === testResult.id);
          if (resultIndex !== -1) {
            this.testResults[resultIndex].status = 'completed';
            this.testResults[resultIndex].endTime = new Date();
            this.testResults[resultIndex].duration = this.testResults[resultIndex].endTime!.getTime() - this.testResults[resultIndex].startTime!.getTime();
            this.testResults[resultIndex].result = response;
          }
          this.isRunning = false;
          this.toastr.success('Test completed successfully!');
        },
        error: (error) => {
          // Find the specific test result by ID and update it
          const resultIndex = this.testResults.findIndex(r => r.id === testResult.id);
          if (resultIndex !== -1) {
            this.testResults[resultIndex].status = 'failed';
            this.testResults[resultIndex].endTime = new Date();
            this.testResults[resultIndex].duration = this.testResults[resultIndex].endTime!.getTime() - this.testResults[resultIndex].startTime!.getTime();
            this.testResults[resultIndex].error = error.error?.message || error.message || 'Unknown error';
          }
          this.isRunning = false;
          this.toastr.error('Test failed: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      });
  }

  runAllTests(): void {
    if (this.isRunning) {
      this.toastr.warning('Tests are already running');
      return;
    }

    this.isRunning = true;
    this.testResults = [];

    this.testCases.forEach((testCase, index) => {
      setTimeout(() => {
        this.runTestCase(testCase);
      }, index * 1000); // Stagger tests by 1 second
    });
  }

  runProductionTests(): void {
    if (this.isProductionTesting) {
      this.toastr.warning('Production tests are already running');
      return;
    }

    if (this.selectedTestCases.length === 0) {
      this.toastr.error('Please select at least one test case to run production tests');
      return;
    }

    this.isProductionTesting = true;
    this.testResults = [];

    this.toastr.info(`Starting production tests for ${this.selectedTestCases.length} test cases`);

    this.selectedTestCases.forEach((testCase, index) => {
      setTimeout(() => {
        this.runProductionTestCase(testCase);
      }, index * 2000); // Stagger production tests by 2 seconds
    });
  }

  private runProductionTestCase(testCase: TestCase): void {
    const testResult: TestResult = {
      id: Date.now().toString() + '-' + testCase.id + '-prod',
      name: `${testCase.name} (Production)`,
      status: 'running',
      startTime: new Date(),
      aiAgent: this.testForm.value.aiOptions.layoutRepair || this.testForm.value.aiOptions.imageOptimization
    };

    this.testResults.push(testResult);

    // Prepare payload based on test case type
    let payload: any = {
      aiOptions: this.testForm.value.aiOptions,
      options: this.testForm.value.options
    };

    // If linkUrl is provided, use url scraping
    if (testCase.linkUrl) {
      payload.url = testCase.linkUrl;
    } else {
      // Combine HTML, CSS, and JavaScript into a single HTML string
      let combinedHTML = testCase.htmlContent;
      
      // Add CSS if present
      if (testCase.cssContent) {
        combinedHTML = combinedHTML.replace('</head>', `<style>${testCase.cssContent}</style></head>`);
      }
      
      // Add JavaScript if present
      if (testCase.jsContent) {
        combinedHTML = combinedHTML.replace('</body>', `<script>${testCase.jsContent}</script></body>`);
      }

      payload.html = combinedHTML;
    }

    this.http.post(this.productionUrl, payload)
      .subscribe({
        next: (response: any) => {
          // Find the specific test result by ID and update it
          const resultIndex = this.testResults.findIndex(r => r.id === testResult.id);
          if (resultIndex !== -1) {
            this.testResults[resultIndex].status = 'completed';
            this.testResults[resultIndex].endTime = new Date();
            this.testResults[resultIndex].duration = this.testResults[resultIndex].endTime!.getTime() - this.testResults[resultIndex].startTime!.getTime();
            this.testResults[resultIndex].result = response;
          }
          this.checkProductionTestsComplete();
        },
        error: (error) => {
          // Find the specific test result by ID and update it
          const resultIndex = this.testResults.findIndex(r => r.id === testResult.id);
          if (resultIndex !== -1) {
            this.testResults[resultIndex].status = 'failed';
            this.testResults[resultIndex].endTime = new Date();
            this.testResults[resultIndex].duration = this.testResults[resultIndex].endTime!.getTime() - this.testResults[resultIndex].startTime!.getTime();
            this.testResults[resultIndex].error = error.error?.message || error.message || 'Unknown error';
          }
          this.checkProductionTestsComplete();
        }
      });
  }

  private checkProductionTestsComplete(): void {
    const productionTests = this.testResults.filter(r => r.id.includes('-prod'));
    const allComplete = productionTests.every(result => 
      result.status === 'completed' || result.status === 'failed'
    );

    if (allComplete) {
      this.isProductionTesting = false;
      const successCount = productionTests.filter(r => r.status === 'completed').length;
      const failCount = productionTests.filter(r => r.status === 'failed').length;
      this.toastr.info(`Production tests completed: ${successCount} passed, ${failCount} failed`);
    }
  }

  private runTestCase(testCase: TestCase): void {
         const testResult: TestResult = {
       id: Date.now().toString() + '-' + testCase.id,
       name: testCase.name,
       status: 'running',
       startTime: new Date(),
       aiAgent: this.testForm.value.aiOptions.layoutRepair || this.testForm.value.aiOptions.imageOptimization
     };

    this.testResults.push(testResult);

    // Prepare payload based on test case type
    let payload: any = {
      aiOptions: this.testForm.value.aiOptions
    };

    // If linkUrl is provided, use url scraping
    if (testCase.linkUrl) {
      payload.url = testCase.linkUrl;
    } else {
      // Combine HTML, CSS, and JavaScript into a single HTML string
      let combinedHTML = testCase.htmlContent;
      
      // Add CSS if present
      if (testCase.cssContent) {
        combinedHTML = combinedHTML.replace('</head>', `<style>${testCase.cssContent}</style></head>`);
      }
      
      // Add JavaScript if present
      if (testCase.jsContent) {
        combinedHTML = combinedHTML.replace('</body>', `<script>${testCase.jsContent}</script></body>`);
      }

      payload.html = combinedHTML;
    }

    this.http.post('https://api.picassopdf.com/api/conversions/convert-html-to-pdf', payload)
      .subscribe({
        next: (response: any) => {
          // Find the specific test result by ID and update it
          const resultIndex = this.testResults.findIndex(r => r.id === testResult.id);
          if (resultIndex !== -1) {
            this.testResults[resultIndex].status = 'completed';
            this.testResults[resultIndex].endTime = new Date();
            this.testResults[resultIndex].duration = this.testResults[resultIndex].endTime!.getTime() - this.testResults[resultIndex].startTime!.getTime();
            this.testResults[resultIndex].result = response;
          }
          this.checkAllTestsComplete();
        },
        error: (error) => {
          // Find the specific test result by ID and update it
          const resultIndex = this.testResults.findIndex(r => r.id === testResult.id);
          if (resultIndex !== -1) {
            this.testResults[resultIndex].status = 'failed';
            this.testResults[resultIndex].endTime = new Date();
            this.testResults[resultIndex].duration = this.testResults[resultIndex].endTime!.getTime() - this.testResults[resultIndex].startTime!.getTime();
            this.testResults[resultIndex].error = error.error?.message || error.message || 'Unknown error';
          }
          this.checkAllTestsComplete();
        }
      });
  }

  private checkAllTestsComplete(): void {
    const allComplete = this.testResults.every(result => 
      result.status === 'completed' || result.status === 'failed'
    );

    if (allComplete) {
      this.isRunning = false;
      const successCount = this.testResults.filter(r => r.status === 'completed').length;
      const failCount = this.testResults.filter(r => r.status === 'failed').length;
      this.toastr.info(`All tests completed: ${successCount} passed, ${failCount} failed`);
    }
  }

  clearResults(): void {
    this.testResults = [];
  }

  downloadResult(result: TestResult): void {
    if (result.result?.data?.downloadUrl) {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      // Make sure the URL is absolute to point to the backend
      const downloadUrl = result.result.data.downloadUrl.startsWith('http') 
        ? result.result.data.downloadUrl 
        : `https://api.picassopdf.com/api${result.result.data.downloadUrl}`;
      
      link.href = downloadUrl;
      link.download = result.result.data.fileName || 'converted-pdf.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      this.toastr.error('No download URL available for this result');
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-success';
      case 'failed': return 'status-error';
      case 'running': return 'status-warning';
      default: return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'fas fa-check-circle';
      case 'failed': return 'fas fa-times-circle';
      case 'running': return 'fas fa-spinner fa-spin';
      default: return 'fas fa-clock';
    }
  }

     formatDuration(duration?: number): string {
     if (!duration) return '-';
     return `${(duration / 1000).toFixed(2)}s`;
   }

   // Handle Save to Vault checkbox change
   onSaveToVaultChange(event: any): void {
     console.log('Save to Vault changed:', event.target.checked);
     console.log('Form value after change:', this.testForm.value);
   }

  // Getter methods for template
  get completedTestsCount(): number {
    return this.testResults.filter(r => r.status === 'completed').length;
  }

  get failedTestsCount(): number {
    return this.testResults.filter(r => r.status === 'failed').length;
  }

  get runningTestsCount(): number {
    return this.testResults.filter(r => r.status === 'running').length;
  }
}

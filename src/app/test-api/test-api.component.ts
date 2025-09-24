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
  
  // Comprehensive test cases for stress testing HTML/CSS/JS to PDF conversion
  testCases: TestCase[] = [
    {
      id: 'simple-html',
      name: 'Simple HTML',
      description: 'Basic HTML with simple structure',
      category: 'Basic',
      htmlContent: `<!DOCTYPE html><html><head><title>Simple Test</title></head><body><h1>Simple HTML Test</h1><p>This is a simple HTML document for testing the conversion API.</p><p>It should convert cleanly to PDF without any issues.</p></body></html>`,
      cssContent: `body { font-family: Arial, sans-serif; margin: 20px; } h1 { color: #333; } p { line-height: 1.6; }`,
      expectedBehavior: 'Should convert cleanly to PDF'
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
    },
    {
      id: 'flexbox-edge-cases',
      name: 'Flexbox Edge Cases',
      description: 'Complex Flexbox with wrapping, shrinking, and alignment edge cases',
      category: 'Edge Cases',
      htmlContent: `<!DOCTYPE html><html><head><title>Flexbox Edge Cases Test</title></head><body><div class="flex-container"><div class="flex-item item1">Item 1<br>Multi-line content</div><div class="flex-item item2">Item 2 with very long content that should wrap and test flex behavior</div><div class="flex-item item3">Item 3</div><div class="flex-item item4">Item 4</div><div class="flex-item item5">Item 5</div><div class="flex-item item6">Item 6</div></div><div class="flex-vertical"><div class="v-item">Vertical Item 1</div><div class="v-item">Vertical Item 2</div><div class="v-item">Vertical Item 3</div></div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;margin:20px;background:#f5f5f5}.flex-container{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:stretch;gap:10px;background:white;padding:20px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.1);margin-bottom:20px}.flex-item{background:linear-gradient(45deg,#ff6b6b,#4ecdc4);color:white;padding:15px;border-radius:6px;text-align:center;font-weight:bold;min-width:100px}.item1{flex:0 0 200px}.item2{flex:1 1 300px;min-width:200px}.item3{flex:0 1 150px}.item4{flex:2 0 100px}.item5{flex:0 0 auto;align-self:flex-end}.item6{flex:1 1 200px;align-self:center}.flex-vertical{display:flex;flex-direction:column;height:300px;background:white;padding:20px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.1)}.v-item{background:#3498db;color:white;padding:15px;margin:5px 0;border-radius:6px;text-align:center;font-weight:bold}.v-item:nth-child(2){flex:1;align-self:center}.v-item:nth-child(3){align-self:flex-end}`,
      expectedBehavior: 'Should handle complex Flexbox layouts with wrapping and alignment'
    },
    {
      id: 'css-animations-transitions',
      name: 'CSS Animations & Transitions',
      description: 'Tests CSS animations, transitions, and transforms (static state)',
      category: 'Edge Cases',
      htmlContent: `<!DOCTYPE html><html><head><title>CSS Animations Test</title></head><body><div class="animation-container"><h1>CSS Animations & Transitions Test</h1><div class="animated-boxes"><div class="box rotate">Rotate</div><div class="box scale">Scale</div><div class="box skew">Skew</div><div class="box translate">Translate</div><div class="box gradient">Gradient</div><div class="box shadow">Shadow</div></div><div class="transition-elements"><div class="btn">Hover Button</div><div class="card">Hover Card</div><div class="text">Hover Text</div></div></div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;background:#f5f5f5;margin:20px}.animation-container{max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.1)}h1{text-align:center;color:#2c3e50;margin-bottom:30px}.animated-boxes{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:20px;margin-bottom:40px}.box{height:100px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;border-radius:8px;transition:all 0.3s ease}.rotate{background:linear-gradient(45deg,#ff6b6b,#ee5a24);transform:rotate(5deg)}.scale{background:linear-gradient(45deg,#4ecdc4,#44a08d);transform:scale(1.1)}.skew{background:linear-gradient(45deg,#45b7d1,#96c93d);transform:skew(-5deg,2deg)}.translate{background:linear-gradient(45deg,#f093fb,#f5576c);transform:translate(10px,-5px)}.gradient{background:linear-gradient(45deg,#667eea,#764ba2);animation:gradientShift 3s ease-in-out infinite}.shadow{background:linear-gradient(45deg,#ffecd2,#fcb69f);box-shadow:0 10px 30px rgba(0,0,0,0.3)}@keyframes gradientShift{0%,100%{background:linear-gradient(45deg,#667eea,#764ba2)}50%{background:linear-gradient(45deg,#764ba2,#667eea)}}.transition-elements{display:flex;gap:20px;justify-content:center;flex-wrap:wrap}.btn,.card,.text{padding:15px 25px;border-radius:6px;cursor:pointer;transition:all 0.3s ease;text-align:center;font-weight:bold}.btn{background:#007bff;color:white}.btn:hover{background:#0056b3;transform:translateY(-2px)}.card{background:#28a745;color:white}.card:hover{background:#1e7e34;transform:scale(1.05)}.text{background:#6c757d;color:white}.text:hover{background:#545b62;letter-spacing:1px}`,
      expectedBehavior: 'Should render CSS animations and transitions in their static state'
    },
    {
      id: 'table-complex-styling',
      name: 'Complex Table Styling',
      description: 'Tables with complex styling, zebra stripes, and responsive behavior',
      category: 'Edge Cases',
      htmlContent: `<!DOCTYPE html><html><head><title>Complex Table Styling Test</title></head><body><h1>Complex Table Styling Test</h1><div class="table-container"><table class="complex-table"><thead><tr><th rowspan="2">Product</th><th colspan="3">Q1 2024</th><th colspan="3">Q2 2024</th></tr><tr><th>Jan</th><th>Feb</th><th>Mar</th><th>Apr</th><th>May</th><th>Jun</th></tr></thead><tbody><tr><td class="product-name">Laptop Pro</td><td class="high">$2,500</td><td class="high">$2,600</td><td class="high">$2,700</td><td class="medium">$2,400</td><td class="medium">$2,500</td><td class="medium">$2,600</td></tr><tr><td class="product-name">Tablet Air</td><td class="medium">$800</td><td class="medium">$850</td><td class="medium">$900</td><td class="low">$750</td><td class="low">$800</td><td class="low">$850</td></tr><tr><td class="product-name">Phone Max</td><td class="low">$1,200</td><td class="low">$1,250</td><td class="low">$1,300</td><td class="high">$1,400</td><td class="high">$1,450</td><td class="high">$1,500</td></tr><tr class="total-row"><td class="product-name">Total</td><td class="total">$4,500</td><td class="total">$4,700</td><td class="total">$4,900</td><td class="total">$4,550</td><td class="total">$4,750</td><td class="total">$4,950</td></tr></tbody></table></div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;margin:20px;background:#f5f5f5}h1{text-align:center;color:#2c3e50;margin-bottom:30px}.table-container{max-width:1000px;margin:0 auto;background:white;padding:20px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.1);overflow-x:auto}.complex-table{width:100%;border-collapse:collapse;margin:0;font-size:14px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}.complex-table thead{background:linear-gradient(135deg,#667eea,#764ba2);color:white}.complex-table th{padding:15px 12px;text-align:center;font-weight:bold;border:1px solid rgba(255,255,255,0.2);position:relative}.complex-table tbody tr:nth-child(even){background-color:#f8f9fa}.complex-table tbody tr:nth-child(odd){background-color:#ffffff}.complex-table tbody tr:hover{background-color:#e3f2fd;transform:scale(1.01);transition:all 0.2s ease}.complex-table td{padding:12px;text-align:center;border:1px solid #dee2e6;vertical-align:middle}.product-name{text-align:left;font-weight:bold;color:#2c3e50;background-color:#f1f3f4}.high{background-color:#d4edda;color:#155724;font-weight:bold}.medium{background-color:#fff3cd;color:#856404;font-weight:bold}.low{background-color:#f8d7da;color:#721c24;font-weight:bold}.total-row{background:linear-gradient(135deg,#28a745,#20c997) !important;color:white;font-weight:bold}.total{background-color:rgba(255,255,255,0.2) !important;color:white !important;font-weight:bold;font-size:16px}`,
      expectedBehavior: 'Should handle complex table styling with zebra stripes and conditional formatting'
    },
    {
      id: 'css-custom-properties',
      name: 'CSS Custom Properties (Variables)',
      description: 'Tests CSS custom properties and CSS variables',
      category: 'Edge Cases',
      htmlContent: `<!DOCTYPE html><html><head><title>CSS Variables Test</title></head><body><div class="container"><h1>CSS Custom Properties Test</h1><div class="theme-switcher"><button onclick="switchTheme('light')">Light Theme</button><button onclick="switchTheme('dark')">Dark Theme</button><button onclick="switchTheme('colorful')">Colorful Theme</button></div><div class="content"><div class="card primary">Primary Card</div><div class="card secondary">Secondary Card</div><div class="card accent">Accent Card</div><div class="card warning">Warning Card</div></div></div></body></html>`,
      cssContent: `:root{--primary-color:#007bff;--secondary-color:#6c757d;--accent-color:#28a745;--warning-color:#ffc107;--text-color:#333;--bg-color:#fff;--card-bg:#f8f9fa;--border-radius:8px;--spacing:20px;--font-size:16px}.container{font-family:Arial,sans-serif;margin:20px;background:var(--bg-color);color:var(--text-color);padding:var(--spacing);border-radius:var(--border-radius)}h1{text-align:center;color:var(--primary-color);margin-bottom:var(--spacing)}.theme-switcher{text-align:center;margin-bottom:var(--spacing)}.theme-switcher button{margin:0 10px;padding:10px 20px;border:none;border-radius:var(--border-radius);cursor:pointer;font-size:var(--font-size);background:var(--secondary-color);color:white}.content{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--spacing)}.card{padding:var(--spacing);border-radius:var(--border-radius);text-align:center;font-weight:bold;color:white;background:var(--primary-color)}.card.secondary{background:var(--secondary-color)}.card.accent{background:var(--accent-color)}.card.warning{background:var(--warning-color);color:#333}.container[data-theme="dark"]{--primary-color:#0d6efd;--secondary-color:#6c757d;--accent-color:#198754;--warning-color:#ffc107;--text-color:#fff;--bg-color:#212529;--card-bg:#343a40}.container[data-theme="colorful"]{--primary-color:#e83e8c;--secondary-color:#fd7e14;--accent-color:#20c997;--warning-color:#ffc107;--text-color:#fff;--bg-color:linear-gradient(135deg,#667eea,#764ba2);--card-bg:rgba(255,255,255,0.1)}`,
      jsContent: `function switchTheme(theme){document.querySelector('.container').setAttribute('data-theme',theme)}`,
      expectedBehavior: 'Should handle CSS custom properties and theme switching'
    },
    {
      id: 'overflow-scroll-behavior',
      name: 'Overflow & Scroll Behavior',
      description: 'Tests overflow properties, scrollbars, and content clipping',
      category: 'Edge Cases',
      htmlContent: `<!DOCTYPE html><html><head><title>Overflow Test</title></head><body><h1>Overflow & Scroll Behavior Test</h1><div class="overflow-container"><div class="overflow-box hidden"><h3>Hidden Overflow</h3><p>This content should be clipped and not visible outside the container. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></div><div class="overflow-box scroll"><h3>Scroll Overflow</h3><p>This content should be scrollable. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p></div><div class="overflow-box auto"><h3>Auto Overflow</h3><p>This content should show scrollbars when needed. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></div><div class="overflow-box visible"><h3>Visible Overflow</h3><p>This content should overflow and be visible outside the container. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></div></div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;margin:20px;background:#f5f5f5}h1{text-align:center;color:#2c3e50;margin-bottom:30px}.overflow-container{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;max-width:1000px;margin:0 auto}.overflow-box{height:200px;width:250px;padding:15px;border:2px solid #007bff;border-radius:8px;background:white;box-shadow:0 2px 10px rgba(0,0,0,0.1)}.overflow-box h3{color:#007bff;margin-bottom:10px;font-size:16px}.overflow-box p{line-height:1.6;color:#333}.hidden{overflow:hidden}.scroll{overflow:scroll}.auto{overflow:auto}.visible{overflow:visible}`,
      expectedBehavior: 'Should handle different overflow behaviors correctly'
    },
    {
      id: 'positioning-absolute-relative',
      name: 'CSS Positioning (Absolute/Relative)',
      description: 'Tests absolute, relative, fixed, and sticky positioning',
      category: 'Edge Cases',
      htmlContent: `<!DOCTYPE html><html><head><title>CSS Positioning Test</title></head><body><div class="positioning-container"><h1>CSS Positioning Test</h1><div class="relative-box">Relative Container<div class="absolute-box">Absolute Positioned</div><div class="sticky-box">Sticky Positioned</div></div><div class="fixed-box">Fixed Positioned</div><div class="content-spacer">Content to test positioning behavior</div></div></body></html>`,
      cssContent: `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;margin:20px;background:#f5f5f5;height:200vh}.positioning-container{max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.1);position:relative}h1{text-align:center;color:#2c3e50;margin-bottom:30px}.relative-box{position:relative;height:300px;background:linear-gradient(45deg,#e3f2fd,#bbdefb);border:2px solid #2196f3;border-radius:8px;padding:20px;margin:20px 0}.absolute-box{position:absolute;top:20px;right:20px;background:#ff5722;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;box-shadow:0 2px 10px rgba(0,0,0,0.3)}.sticky-box{position:sticky;top:20px;background:#4caf50;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;margin:20px 0;box-shadow:0 2px 10px rgba(0,0,0,0.3)}.fixed-box{position:fixed;top:20px;right:20px;background:#9c27b0;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;box-shadow:0 2px 10px rgba(0,0,0,0.3);z-index:1000}.content-spacer{height:100px;background:#f8f9fa;border:1px solid #dee2e6;border-radius:6px;display:flex;align-items:center;justify-content:center;margin:20px 0;color:#6c757d}`,
      expectedBehavior: 'Should handle different CSS positioning types correctly'
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

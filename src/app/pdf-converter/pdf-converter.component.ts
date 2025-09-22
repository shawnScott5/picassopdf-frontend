import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionsService } from '../actions/actions.service';

@Component({
	selector: 'app-pdf-converter',
	templateUrl: './pdf-converter.component.html',
	styleUrls: ['./pdf-converter.component.scss']
})
export class PdfConverterComponent {
	convertForm: FormGroup;
	isConverting = false;
	conversionError = '';
	conversionResults: Array<any> = [];
	dataTypes: Array<{ key: string; label: string; description: string }> = [
		{ key: 'notion', label: 'Notion', description: 'Convert Notion pages to PDF' },
		{ key: 'airtable', label: 'Airtable', description: 'Convert Airtable views to PDF' },
		{ key: 'csv', label: 'CSV', description: 'Convert CSV data to PDF' },
		{ key: 'html', label: 'HTML', description: 'Convert public web pages to PDF' }
	];

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private actionsService: ActionsService
	) {
		this.convertForm = this.fb.group({
			dataType: ['notion', Validators.required],
			fileName: ['', Validators.required],
			urlsText: ['', Validators.required]
		});
	}

	get urls(): string[] {
		const raw: string = this.convertForm.get('urlsText')?.value || '';
		return raw
			.split(/\r?\n/)
			.map(u => u.trim())
			.filter(u => !!u);
	}

	onSubmit(): void {
		if (this.convertForm.invalid || this.urls.length === 0) {
			return;
		}

		this.isConverting = true;
		this.conversionError = '';
		this.conversionResults = [];

		const payload = {
			dataType: this.convertForm.get('dataType')?.value,
			fileName: this.convertForm.get('fileName')?.value,
			urls: this.urls,
			sourceType: 'url'
		};

		this.actionsService.convertToPDF(payload).subscribe({
			next: (response: any) => {
				if (response?.success && response?.data?.results) {
					this.conversionResults = response.data.results;
				} else {
					this.conversionError = response?.message || 'Conversion failed';
				}
				this.isConverting = false;
			},
			error: (err) => {
				this.conversionError = err?.error?.message || 'Conversion failed';
				this.isConverting = false;
			}
		});
	}

	goToSignup(): void {
		this.router.navigate(['/signup']);
	}
}



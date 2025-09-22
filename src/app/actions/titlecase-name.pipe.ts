import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titlecaseName',
  standalone: true // ✅ this is required for use in standalone components
})
export class TitlecaseNamePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    return value
      .split(' ')
      .map(word =>
        word
          .split(/(-|')/) // Keep hyphens and apostrophes in the result
          .map(part =>
            part.match(/[-']/) ? part : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          )
          .join('')
      )
      .join(' ');
  }
}
import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Pipe({
  name: 'nepaliNumeral',
  standalone: true,
  pure: false
})
export class NepaliNumeralPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return this.i18n.formatNumerals(value);
  }
}


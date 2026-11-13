import { TestBed } from '@angular/core/testing';
import { NepaliCalendarService } from './nepali-calendar.service';

describe('NepaliCalendarService', () => {
  let service: NepaliCalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NepaliCalendarService]
    });
    service = TestBed.inject(NepaliCalendarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should correctly convert 2081-01-01 BS to 2024-04-13 AD', () => {
    const ad = service.bsToAd({ year: 2081, month: 1, day: 1 });
    const iso = service.formatAdIso(ad);
    expect(iso).toBe('2024-04-13');
  });

  it('should correctly convert 2024-04-13 AD to 2081-01-01 BS', () => {
    const bs = service.adToBs('2024-04-13');
    const iso = service.formatBsIso(bs);
    expect(iso).toBe('2081-01-01');
  });

  it('should correctly convert 2081-07-28 BS to 2024-11-13 AD and reverse', () => {
    const ad = service.bsToAd({ year: 2081, month: 7, day: 28 });
    const iso = service.formatAdIso(ad);
    expect(iso).toBe('2024-11-13');

    const bs = service.adToBs('2024-11-13');
    const bsIso = service.formatBsIso(bs);
    expect(bsIso).toBe('2081-07-28');
  });

  it('should validate BS dates properly and reject impossible days', () => {
    const valid = service.validateBsDate(2081, 1, 31);
    expect(valid.valid).toBe(true);

    const invalidDay = service.validateBsDate(2081, 1, 32);
    expect(invalidDay.valid).toBe(false);
    expect(invalidDay.error).toContain('only has 31 days');

    const invalidMonth = service.validateBsDate(2081, 13, 1);
    expect(invalidMonth.valid).toBe(false);
  });

  it('should detect national festivals like Nepali New Year', () => {
    const festival = service.getFestival({ year: 2081, month: 1, day: 1 });
    expect(festival).toBeDefined();
    expect(festival?.name).toContain('Nepali New Year');
    expect(festival?.isPublicHoliday).toBe(true);
  });
});

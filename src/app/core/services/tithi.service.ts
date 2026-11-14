import { Injectable } from '@angular/core';

export interface LunarInfo {
  tithiNumber: number; // 1 to 30
  tithiNameEn: string;
  tithiNameNp: string;
  paksha: 'Shukla' | 'Krishna';
  isPurnima: boolean;
  isAmavasya: boolean;
  isEkadashi: boolean;
  isSankranti: boolean;
  badgeLabel?: string;
  badgeLabelNp?: string;
}

const TITHI_NAMES_NP = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा',
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'औंसी'
];

const TITHI_NAMES_EN = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
];

@Injectable({
  providedIn: 'root'
})
export class TithiService {
  // Synodic month in days
  private readonly SYNODIC_MONTH = 29.53058867;
  // Known New Moon reference epoch: Jan 11, 2024, 11:57 UTC
  private readonly NEW_MOON_REF = new Date('2024-01-11T11:57:00Z').getTime();

  /**
   * Calculates Tithi information for a given Gregorian date and BS day number.
   * @param dateAD string in YYYY-MM-DD
   * @param bsDay number (1-32)
   */
  getLunarInfo(dateAD: string, bsDay?: number): LunarInfo {
    const targetDate = new Date(`${dateAD}T12:00:00Z`).getTime();
    const diffDays = (targetDate - this.NEW_MOON_REF) / (1000 * 60 * 60 * 24);

    // Days since last new moon in current cycle
    const cyclePhase = ((diffDays % this.SYNODIC_MONTH) + this.SYNODIC_MONTH) % this.SYNODIC_MONTH;

    // Each tithi is 1/30th of the synodic month (~0.98435 days)
    const tithiIndex = Math.min(29, Math.floor((cyclePhase / this.SYNODIC_MONTH) * 30));
    const tithiNumber = tithiIndex + 1; // 1 to 30

    const paksha: 'Shukla' | 'Krishna' = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
    const isPurnima = tithiNumber === 15;
    const isAmavasya = tithiNumber === 30;
    const isEkadashi = tithiNumber === 11 || tithiNumber === 26;
    const isSankranti = bsDay === 1;

    let badgeLabel: string | undefined;
    let badgeLabelNp: string | undefined;

    if (isSankranti) {
      badgeLabel = 'Sankranti';
      badgeLabelNp = 'संक्रान्ति';
    } else if (isPurnima) {
      badgeLabel = 'Purnima';
      badgeLabelNp = 'पूर्णिमा 🌕';
    } else if (isAmavasya) {
      badgeLabel = 'Aunsi';
      badgeLabelNp = 'औंसी 🌑';
    } else if (isEkadashi) {
      badgeLabel = 'Ekadashi';
      badgeLabelNp = 'एकादशी';
    }

    return {
      tithiNumber,
      tithiNameEn: TITHI_NAMES_EN[tithiIndex],
      tithiNameNp: TITHI_NAMES_NP[tithiIndex],
      paksha,
      isPurnima,
      isAmavasya,
      isEkadashi,
      isSankranti,
      badgeLabel,
      badgeLabelNp
    };
  }
}


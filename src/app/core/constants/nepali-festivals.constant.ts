import { FestivalInfo } from '../models/calendar.model';

/**
 * Solar Fixed Bikram Sambat Holidays & Observances
 * These fall on the exact same BS month and day every year.
 */
export const SOLAR_FIXED_FESTIVALS: Record<string, FestivalInfo> = {
  '1-1': { name: 'Nepali New Year (Navavarsha)', nameNepali: 'नयाँ वर्ष', isPublicHoliday: true },
  '1-11': { name: 'Loktantra Diwas (Democracy Day)', nameNepali: 'लोकतन्त्र दिवस', isPublicHoliday: true },
  '1-18': { name: 'International Labour Day', nameNepali: 'अन्तर्राष्ट्रिय मजदुर दिवस', isPublicHoliday: true },
  '2-15': { name: 'Ganatantra Diwas (Republic Day)', nameNepali: 'गणतन्त्र दिवस', isPublicHoliday: true },
  '4-15': { name: 'Kheer Khane Din (Shrawan 15)', nameNepali: 'खीर खाने दिन', isPublicHoliday: false },
  '5-22': { name: 'Nijamati Sewa Diwas (Civil Service Day)', nameNepali: 'निजामती सेवा दिवस', isPublicHoliday: false },
  '6-3': { name: 'Constitution Day (Sambidhan Diwas)', nameNepali: 'संविधान दिवस', isPublicHoliday: true },
  '9-15': { name: 'Tamu Lhosar', nameNepali: 'तमु ल्होसार', isPublicHoliday: true },
  '10-1': { name: 'Maghe Sankranti', nameNepali: 'माघे संक्रान्ति', isPublicHoliday: true },
  '10-16': { name: 'Martyrs Day (Sahid Diwas)', nameNepali: 'शहीद दिवस', isPublicHoliday: false },
  '11-7': { name: 'National Democracy Day (Rashtriya Prajatantra Diwas)', nameNepali: 'राष्ट्रिय प्रजातन्त्र दिवस', isPublicHoliday: true },
  '11-24': { name: 'International Women\'s Day', nameNepali: 'अन्तर्राष्ट्रिय महिला दिवस', isPublicHoliday: true }
};

/**
 * Year-Specific Lunar (Tithi-Based) Nepali Festivals Catalog
 * Keyed by `${year}-${month}-${day}` in Bikram Sambat.
 * Accurately calculated according to astronomical lunar tithi panchang.
 */
export const YEARLY_LUNAR_FESTIVALS: Record<string, FestivalInfo> = {
  // ==========================================
  // 2080 BS (2023 - 2024 AD)
  // ==========================================
  '2080-1-22': { name: 'Buddha Jayanti / Ubhauli', nameNepali: 'बुद्ध जयन्ती / उभौली', isPublicHoliday: true },
  '2080-5-14': { name: 'Janai Purnima / Raksha Bandhan', nameNepali: 'जनै पूर्णिमा / रक्षाबन्धन', isPublicHoliday: true },
  '2080-5-15': { name: 'Gai Jatra', nameNepali: 'गाईजात्रा', isPublicHoliday: true },
  '2080-5-20': { name: 'Krishna Janmashtami', nameNepali: 'श्रीकृष्ण जन्माष्टमी', isPublicHoliday: true },
  '2080-6-1': { name: 'Haritalika Teej', nameNepali: 'हरितालिका तीज', isPublicHoliday: true },
  '2080-6-3': { name: 'Rishi Panchami', nameNepali: 'ऋषि पञ्चमी', isPublicHoliday: false },
  '2080-6-11': { name: 'Indra Jatra', nameNepali: 'इन्द्रजात्रा', isPublicHoliday: true },
  '2080-6-28': { name: 'Ghatasthapana (Dashain Begins)', nameNepali: 'घटस्थापना (दशैं प्रारम्भ)', isPublicHoliday: true },
  '2080-7-4': { name: 'Maha Saptami (Fulpati)', nameNepali: 'फूलपाती', isPublicHoliday: true },
  '2080-7-5': { name: 'Maha Ashtami', nameNepali: 'महाअष्टमी', isPublicHoliday: true },
  '2080-7-6': { name: 'Maha Navami', nameNepali: 'महानवमी', isPublicHoliday: true },
  '2080-7-7': { name: 'Vijaya Dashami (Dashain Tika)', nameNepali: 'विजया दशमी (दशैं टीका)', isPublicHoliday: true },
  '2080-7-11': { name: 'Kojagrat Purnima', nameNepali: 'कोजाग्रत पूर्णिमा', isPublicHoliday: false },
  '2080-7-24': { name: 'Dhanteras', nameNepali: 'धनतेरस', isPublicHoliday: false },
  '2080-7-25': { name: 'Kaag Tihar', nameNepali: 'काग तिहार', isPublicHoliday: false },
  '2080-7-26': { name: 'Kukur Tihar & Laxmi Puja', nameNepali: 'कुकुर तिहार / लक्ष्मी पूजा', isPublicHoliday: true },
  '2080-7-28': { name: 'Govardhan Puja / Mha Puja', nameNepali: 'गोवर्धन पूजा / म्ह पूजा', isPublicHoliday: true },
  '2080-7-29': { name: 'Bhai Tika', nameNepali: 'भाइटीका', isPublicHoliday: true },
  '2080-8-3': { name: 'Chhath Parva', nameNepali: 'छठ पर्व', isPublicHoliday: true },
  '2080-10-27': { name: 'Sonam Lhosar', nameNepali: 'सोनाम ल्होसार', isPublicHoliday: true },
  '2080-11-25': { name: 'Maha Shivaratri', nameNepali: 'महाशिवरात्री', isPublicHoliday: true },
  '2080-11-27': { name: 'Gyalpo Lhosar', nameNepali: 'ग्याल्पो ल्होसार', isPublicHoliday: true },
  '2080-12-11': { name: 'Fagu Purnima (Holi - Hilly)', nameNepali: 'होली (पहाड)', isPublicHoliday: true },
  '2080-12-12': { name: 'Fagu Purnima (Holi - Terai)', nameNepali: 'होली (तराई)', isPublicHoliday: true },
  '2080-12-26': { name: 'Ghode Jatra', nameNepali: 'घोडे जात्रा', isPublicHoliday: true },
  '2081-1-4': { name: 'Chaite Dashain', nameNepali: 'चैते दशैं', isPublicHoliday: false },
  '2081-1-5': { name: 'Ram Navami', nameNepali: 'रामनवमी', isPublicHoliday: true },

  // ==========================================
  // 2081 BS (2024 - 2025 AD)
  // ==========================================
  '2081-2-10': { name: 'Buddha Jayanti / Ubhauli', nameNepali: 'बुद्ध जयन्ती / उभौली', isPublicHoliday: true },
  '2081-5-3': { name: 'Janai Purnima / Raksha Bandhan', nameNepali: 'जनै पूर्णिमा / रक्षाबन्धन', isPublicHoliday: true },
  '2081-5-4': { name: 'Gai Jatra', nameNepali: 'गाईजात्रा', isPublicHoliday: true },
  '2081-5-10': { name: 'Krishna Janmashtami', nameNepali: 'श्रीकृष्ण जन्माष्टमी', isPublicHoliday: true },
  '2081-5-21': { name: 'Haritalika Teej', nameNepali: 'हरितालिका तीज', isPublicHoliday: true },
  '2081-5-23': { name: 'Rishi Panchami', nameNepali: 'ऋषि पञ्चमी', isPublicHoliday: false },
  '2081-6-1': { name: 'Indra Jatra', nameNepali: 'इन्द्रजात्रा', isPublicHoliday: true },
  '2081-6-17': { name: 'Ghatasthapana (Dashain Begins)', nameNepali: 'घटस्थापना (दशैं प्रारम्भ)', isPublicHoliday: true },
  '2081-6-24': { name: 'Maha Saptami (Fulpati)', nameNepali: 'फूलपाती', isPublicHoliday: true },
  '2081-6-25': { name: 'Maha Ashtami', nameNepali: 'महाअष्टमी', isPublicHoliday: true },
  '2081-6-26': { name: 'Maha Navami', nameNepali: 'महानवमी', isPublicHoliday: true },
  '2081-6-27': { name: 'Vijaya Dashami (Dashain Tika)', nameNepali: 'विजया दशमी (दशैं टीका)', isPublicHoliday: true },
  '2081-6-30': { name: 'Kojagrat Purnima', nameNepali: 'कोजाग्रत पूर्णिमा', isPublicHoliday: false },
  '2081-7-13': { name: 'Dhanteras / Kaag Tihar', nameNepali: 'धनतेरस / काग तिहार', isPublicHoliday: false },
  '2081-7-14': { name: 'Kukur Tihar', nameNepali: 'कुकुर तिहार', isPublicHoliday: false },
  '2081-7-15': { name: 'Laxmi Puja (Deepawali)', nameNepali: 'लक्ष्मी पूजा (दीपावली)', isPublicHoliday: true },
  '2081-7-17': { name: 'Govardhan Puja / Mha Puja', nameNepali: 'गोवर्धन पूजा / म्ह पूजा', isPublicHoliday: true },
  '2081-7-18': { name: 'Bhai Tika', nameNepali: 'भाइटीका', isPublicHoliday: true },
  '2081-7-22': { name: 'Chhath Parva', nameNepali: 'छठ पर्व', isPublicHoliday: true },
  '2081-10-16': { name: 'Sonam Lhosar', nameNepali: 'सोनाम ल्होसार', isPublicHoliday: true },
  '2081-11-14': { name: 'Maha Shivaratri', nameNepali: 'महाशिवरात्री', isPublicHoliday: true },
  '2081-11-16': { name: 'Gyalpo Lhosar', nameNepali: 'ग्याल्पो ल्होसार', isPublicHoliday: true },
  '2081-11-29': { name: 'Fagu Purnima (Holi - Hilly)', nameNepali: 'होली पर्व (पहाड)', isPublicHoliday: true },
  '2081-12-1': { name: 'Fagu Purnima (Holi - Terai)', nameNepali: 'होली पर्व (तराई)', isPublicHoliday: true },
  '2081-12-16': { name: 'Ghode Jatra', nameNepali: 'घोडे जात्रा', isPublicHoliday: true },
  '2081-12-23': { name: 'Chaite Dashain', nameNepali: 'चैते दशैं', isPublicHoliday: false },
  '2081-12-24': { name: 'Ram Navami', nameNepali: 'रामनवमी', isPublicHoliday: true },

  // ==========================================
  // 2082 BS (2025 - 2026 AD)
  // ==========================================
  '2082-1-29': { name: 'Buddha Jayanti / Ubhauli', nameNepali: 'बुद्ध जयन्ती / उभौली', isPublicHoliday: true },
  '2082-4-24': { name: 'Janai Purnima / Raksha Bandhan', nameNepali: 'जनै पूर्णिमा / रक्षाबन्धन', isPublicHoliday: true },
  '2082-4-25': { name: 'Gai Jatra', nameNepali: 'गाईजात्रा', isPublicHoliday: true },
  '2082-4-31': { name: 'Krishna Janmashtami', nameNepali: 'श्रीकृष्ण जन्माष्टमी', isPublicHoliday: true },
  '2082-5-10': { name: 'Haritalika Teej', nameNepali: 'हरितालिका तीज', isPublicHoliday: true },
  '2082-5-12': { name: 'Rishi Panchami', nameNepali: 'ऋषि पञ्चमी', isPublicHoliday: false },
  '2082-5-21': { name: 'Indra Jatra', nameNepali: 'इन्द्रजात्रा', isPublicHoliday: true },
  '2082-6-6': { name: 'Ghatasthapana (Dashain Begins)', nameNepali: 'घटस्थापना (दशैं प्रारम्भ)', isPublicHoliday: true },
  '2082-6-13': { name: 'Maha Saptami (Fulpati)', nameNepali: 'फूलपाती', isPublicHoliday: true },
  '2082-6-14': { name: 'Maha Ashtami', nameNepali: 'महाअष्टमी', isPublicHoliday: true },
  '2082-6-15': { name: 'Maha Navami', nameNepali: 'महानवमी', isPublicHoliday: true },
  '2082-6-16': { name: 'Vijaya Dashami (Dashain Tika)', nameNepali: 'विजया दशमी (दशैं टीका)', isPublicHoliday: true },
  '2082-6-20': { name: 'Kojagrat Purnima', nameNepali: 'कोजाग्रत पूर्णिमा', isPublicHoliday: false },
  '2082-7-1': { name: 'Dhanteras', nameNepali: 'धनतेरस', isPublicHoliday: false },
  '2082-7-2': { name: 'Kaag Tihar', nameNepali: 'काग तिहार', isPublicHoliday: false },
  '2082-7-3': { name: 'Kukur Tihar & Laxmi Puja', nameNepali: 'कुकुर तिहार / लक्ष्मी पूजा', isPublicHoliday: true },
  '2082-7-5': { name: 'Govardhan Puja / Mha Puja', nameNepali: 'गोवर्धन पूजा / म्ह पूजा', isPublicHoliday: true },
  '2082-7-6': { name: 'Bhai Tika', nameNepali: 'भाइटीका', isPublicHoliday: true },
  '2082-7-10': { name: 'Chhath Parva', nameNepali: 'छठ पर्व', isPublicHoliday: true },
  '2082-10-4': { name: 'Sonam Lhosar', nameNepali: 'सोनाम ल्होसार', isPublicHoliday: true },
  '2082-11-3': { name: 'Maha Shivaratri', nameNepali: 'महाशिवरात्री', isPublicHoliday: true },
  '2082-11-5': { name: 'Gyalpo Lhosar', nameNepali: 'ग्याल्पो ल्होसार', isPublicHoliday: true },
  '2082-11-19': { name: 'Fagu Purnima (Holi - Hilly)', nameNepali: 'होली पर्व (पहाड)', isPublicHoliday: true },
  '2082-11-20': { name: 'Fagu Purnima (Holi - Terai)', nameNepali: 'होली पर्व (तराई)', isPublicHoliday: true },
  '2082-12-5': { name: 'Ghode Jatra', nameNepali: 'घोडे जात्रा', isPublicHoliday: true },
  '2082-12-13': { name: 'Chaite Dashain', nameNepali: 'चैते दशैं', isPublicHoliday: false },
  '2082-12-14': { name: 'Ram Navami', nameNepali: 'रामनवमी', isPublicHoliday: true },

  // ==========================================
  // 2083 BS (2026 - 2027 AD) [Current Calendar Target]
  // ==========================================
  '2083-2-17': { name: 'Buddha Jayanti / Ubhauli', nameNepali: 'बुद्ध जयन्ती / उभौली', isPublicHoliday: true },
  '2083-5-12': { name: 'Janai Purnima / Raksha Bandhan', nameNepali: 'जनै पूर्णिमा / रक्षाबन्धन', isPublicHoliday: true },
  '2083-5-13': { name: 'Gai Jatra', nameNepali: 'गाईजात्रा', isPublicHoliday: true },
  '2083-5-19': { name: 'Krishna Janmashtami', nameNepali: 'श्रीकृष्ण जन्माष्टमी', isPublicHoliday: true },
  '2083-5-29': { name: 'Haritalika Teej', nameNepali: 'हरितालिका तीज', isPublicHoliday: true },
  '2083-5-31': { name: 'Rishi Panchami', nameNepali: 'ऋषि पञ्चमी', isPublicHoliday: false },
  '2083-6-9': { name: 'Indra Jatra', nameNepali: 'इन्द्रजात्रा', isPublicHoliday: true },
  '2083-6-25': { name: 'Ghatasthapana (Dashain Begins)', nameNepali: 'घटस्थापना (दशैं प्रारम्भ)', isPublicHoliday: true },
  '2083-6-31': { name: 'Maha Saptami (Fulpati)', nameNepali: 'फूलपाती', isPublicHoliday: true },
  '2083-7-1': { name: 'Maha Ashtami', nameNepali: 'महाअष्टमी', isPublicHoliday: true },
  '2083-7-2': { name: 'Maha Navami', nameNepali: 'महानवमी', isPublicHoliday: true },
  '2083-7-3': { name: 'Vijaya Dashami (Dashain Tika)', nameNepali: 'विजया दशमी (दशैं टीका)', isPublicHoliday: true },
  '2083-7-8': { name: 'Kojagrat Purnima', nameNepali: 'कोजाग्रत पूर्णिमा', isPublicHoliday: false },
  '2083-7-20': { name: 'Dhanteras', nameNepali: 'धनतेरस', isPublicHoliday: false },
  '2083-7-21': { name: 'Kaag Tihar', nameNepali: 'काग तिहार', isPublicHoliday: false },
  '2083-7-22': { name: 'Kukur Tihar & Laxmi Puja', nameNepali: 'कुकुर तिहार / लक्ष्मी पूजा', isPublicHoliday: true },
  '2083-7-23': { name: 'Govardhan Puja / Mha Puja', nameNepali: 'गोवर्धन पूजा / म्ह पूजा', isPublicHoliday: true },
  '2083-7-24': { name: 'Bhai Tika', nameNepali: 'भाइटीका', isPublicHoliday: true },
  '2083-7-29': { name: 'Chhath Parva', nameNepali: 'छठ पर्व', isPublicHoliday: true },
  '2083-10-23': { name: 'Sonam Lhosar', nameNepali: 'सोनाम ल्होसार', isPublicHoliday: true },
  '2083-11-22': { name: 'Maha Shivaratri', nameNepali: 'महाशिवरात्री', isPublicHoliday: true },
  '2083-11-24': { name: 'Gyalpo Lhosar', nameNepali: 'ग्याल्पो ल्होसार', isPublicHoliday: true },
  '2083-12-8': { name: 'Fagu Purnima (Holi - Hilly)', nameNepali: 'होली पर्व (पहाड)', isPublicHoliday: true },
  '2083-12-9': { name: 'Fagu Purnima (Holi - Terai)', nameNepali: 'होली पर्व (तराई)', isPublicHoliday: true },
  '2083-12-24': { name: 'Ghode Jatra', nameNepali: 'घोडे जात्रा', isPublicHoliday: true },
  '2084-1-1': { name: 'Chaite Dashain', nameNepali: 'चैते दशैं', isPublicHoliday: false },
  '2084-1-2': { name: 'Ram Navami', nameNepali: 'रामनवमी', isPublicHoliday: true },

  // ==========================================
  // 2084 BS (2027 - 2028 AD)
  // ==========================================
  '2084-2-6': { name: 'Buddha Jayanti / Ubhauli', nameNepali: 'बुद्ध जयन्ती / उभौली', isPublicHoliday: true },
  '2084-4-32': { name: 'Janai Purnima / Raksha Bandhan', nameNepali: 'जनै पूर्णिमा / रक्षाबन्धन', isPublicHoliday: true },
  '2084-5-1': { name: 'Gai Jatra', nameNepali: 'गाईजात्रा', isPublicHoliday: true },
  '2084-5-8': { name: 'Krishna Janmashtami', nameNepali: 'श्रीकृष्ण जन्माष्टमी', isPublicHoliday: true },
  '2084-5-18': { name: 'Haritalika Teej', nameNepali: 'हरितालिका तीज', isPublicHoliday: true },
  '2084-5-20': { name: 'Rishi Panchami', nameNepali: 'ऋषि पञ्चमी', isPublicHoliday: false },
  '2084-5-28': { name: 'Indra Jatra', nameNepali: 'इन्द्रजात्रा', isPublicHoliday: true },
  '2084-6-14': { name: 'Ghatasthapana (Dashain Begins)', nameNepali: 'घटस्थापना (दशैं प्रारम्भ)', isPublicHoliday: true },
  '2084-6-20': { name: 'Maha Saptami (Fulpati)', nameNepali: 'फूलपाती', isPublicHoliday: true },
  '2084-6-21': { name: 'Maha Ashtami', nameNepali: 'महाअष्टमी', isPublicHoliday: true },
  '2084-6-22': { name: 'Maha Navami', nameNepali: 'महानवमी', isPublicHoliday: true },
  '2084-6-23': { name: 'Vijaya Dashami (Tika)', nameNepali: 'विजया दशमी (दशैं टीका)', isPublicHoliday: true },
  '2084-6-27': { name: 'Kojagrat Purnima', nameNepali: 'कोजाग्रत पूर्णिमा', isPublicHoliday: false },
  '2084-7-12': { name: 'Dhanteras', nameNepali: 'धनतेरस', isPublicHoliday: false },
  '2084-7-13': { name: 'Kaag Tihar & Laxmi Puja', nameNepali: 'काग तिहार / लक्ष्मी पूजा', isPublicHoliday: true },
  '2084-7-15': { name: 'Govardhan Puja / Mha Puja', nameNepali: 'गोवर्धन पूजा / म्ह पूजा', isPublicHoliday: true },
  '2084-7-16': { name: 'Bhai Tika', nameNepali: 'भाइटीका', isPublicHoliday: true },
  '2084-7-20': { name: 'Chhath Parva', nameNepali: 'छठ पर्व', isPublicHoliday: true },
  '2084-10-12': { name: 'Sonam Lhosar', nameNepali: 'सोनाम ल्होसार', isPublicHoliday: true },
  '2084-11-11': { name: 'Maha Shivaratri', nameNepali: 'महाशिवरात्री', isPublicHoliday: true },
  '2084-11-13': { name: 'Gyalpo Lhosar', nameNepali: 'ग्याल्पो ल्होसार', isPublicHoliday: true },
  '2084-11-28': { name: 'Fagu Purnima (Holi - Hilly)', nameNepali: 'होली पर्व (पहाड)', isPublicHoliday: true },
  '2084-11-29': { name: 'Fagu Purnima (Holi - Terai)', nameNepali: 'होली पर्व (तराई)', isPublicHoliday: true },
  '2084-12-12': { name: 'Ghode Jatra', nameNepali: 'घोडे जात्रा', isPublicHoliday: true },
  '2084-12-20': { name: 'Chaite Dashain', nameNepali: 'चैते दशैं', isPublicHoliday: false },
  '2084-12-21': { name: 'Ram Navami', nameNepali: 'रामनवमी', isPublicHoliday: true }
};

/**
 * Resolve festival for a given BS date (Year, Month, Day)
 * Evaluates year-specific lunar festivals first, followed by solar fixed holidays.
 */
export function resolveFestival(year: number, month: number, day: number): FestivalInfo | null {
  // 1. Check Year-Specific Lunar Festival
  const yearKey = `${year}-${month}-${day}`;
  if (YEARLY_LUNAR_FESTIVALS[yearKey]) {
    return YEARLY_LUNAR_FESTIVALS[yearKey];
  }

  // 2. Check Solar Fixed Festival
  const solarKey = `${month}-${day}`;
  if (SOLAR_FIXED_FESTIVALS[solarKey]) {
    return SOLAR_FIXED_FESTIVALS[solarKey];
  }

  return null;
}

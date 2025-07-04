export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  phoneCode: string;
}

export const COUNTRIES: Country[] = [
  {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    currencySymbol: 'KSh',
    flag: '🇰🇪',
    phoneCode: '+254'
  },
  {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    currencySymbol: 'USh',
    flag: '🇺🇬',
    phoneCode: '+256'
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    currencySymbol: 'TSh',
    flag: '🇹🇿',
    phoneCode: '+255'
  },
  {
    code: 'RW',
    name: 'Rwanda',
    currency: 'RWF',
    currencySymbol: 'RF',
    flag: '🇷🇼',
    phoneCode: '+250'
  },
  {
    code: 'NG',
    name: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    flag: '🇳🇬',
    phoneCode: '+234'
  },
  {
    code: 'GH',
    name: 'Ghana',
    currency: 'GHS',
    currencySymbol: 'GH₵',
    flag: '🇬🇭',
    phoneCode: '+233'
  },
  {
    code: 'ZA',
    name: 'South Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    flag: '🇿🇦',
    phoneCode: '+27'
  },
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
    phoneCode: '+1'
  }
];

export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(country => country.code === code);
};

export const getCurrencySymbol = (currency: string): string => {
  const country = COUNTRIES.find(c => c.currency === currency);
  return country?.currencySymbol || currency;
};

export const formatPrice = (price: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price).replace(/,/g, ',') + ' ' + symbol;
};
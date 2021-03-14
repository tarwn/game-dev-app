

export enum StandardPlatformOption {
  // PC
  Steam = 10,
  Epic = 11,
  Humble = 12,
  GOG = 13,
  Microsoft = 14,
  // console
  Playstation = 31,
  Xbox = 32,
  Nintendo = 33,
  // mobile
  Apple = 51,
  GooglePlay = 52
}

export const StandardPlatformOptions: Array<{ id: StandardPlatformOption, name: string }> = [
  { id: null, name: '- select an option -' },
  // PC
  { id: StandardPlatformOption.Epic, name: 'Epic Games Store' },
  { id: StandardPlatformOption.GOG, name: 'GOG' },
  { id: StandardPlatformOption.Humble, name: 'Humble Store' },
  { id: StandardPlatformOption.Microsoft, name: 'Microsoft Store' },
  { id: StandardPlatformOption.Steam, name: 'Steam' },
  // console
  { id: StandardPlatformOption.Playstation, name: 'Playstation' },
  { id: StandardPlatformOption.Xbox, name: 'Xbox Games Store' },
  { id: StandardPlatformOption.Nintendo, name: 'Nintendo eShop' },
  // mobile
  { id: StandardPlatformOption.Apple, name: 'Apple App Store' },
  { id: StandardPlatformOption.GooglePlay, name: 'Google Play Store' },
];

type PredefinedPlatformSettings = {
  name: string,
  caveat?: string,
  sharePercent0: number,
  until0: number,
  sharePercent1?: number,
  until1?: number,
  sharePercent2?: number,
  until2?: number
};

export const StandardPlatformSettings = new Map<StandardPlatformOption, PredefinedPlatformSettings>([
  // PC
  [StandardPlatformOption.Epic, { name: "Epic Games Store", sharePercent0: 0.12, until0: 0 }],
  [StandardPlatformOption.Humble, { name: "Humble Store", sharePercent0: 0.25, until0: 0 }],
  [StandardPlatformOption.GOG, { name: "GOG", sharePercent0: 0.30, until0: 0 }],
  [StandardPlatformOption.Microsoft, { name: "Microsoft Store", sharePercent0: 0.30, until0: 0 }],
  // eslint-disable-next-line max-len
  [StandardPlatformOption.Steam, { name: "Steam", sharePercent0: 0.3, until0: 10_000_000, sharePercent1: 0.25, until1: 50_000_000, sharePercent2: 0.2, until2: 0 }],

  // console
  [StandardPlatformOption.Playstation, { name: "Playstation", sharePercent0: 0.30, until0: 0 }],
  [StandardPlatformOption.Xbox, { name: "Xbox Games Store", sharePercent0: 0.30, until0: 0 }],
  [StandardPlatformOption.Nintendo, { name: "Nintendo eShop", sharePercent0: 0.30, until0: 0 }],

  // mobile
  // eslint-disable-next-line max-len
  [StandardPlatformOption.Apple, { name: "Apple App Store", caveat: "Apple is 15% if you make < $1M, but 30% if you make more, so change this to 30% if you plan to beat $1M/year", sharePercent0: 0.15, until0: 0 }],
  // eslint-disable-next-line max-len
  [StandardPlatformOption.GooglePlay, { name: "Google Play Store", caveat: "Google is actually 15% for your first $1M each year, but I don't have the 'each year' support yet - let me know if you need it and I'll bump it up the list", sharePercent0: 0.15, until0: 1_000_000, sharePercent1: 0.30, until1: 0 }],
]);

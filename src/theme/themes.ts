export type ThemeId = 'original' | 'dark' | 'light';

// Keep existing theme IDs; both dark choices now use neutral surfaces.
export const DEFAULT_THEME_ID: ThemeId = 'dark';

export type GameTheme = {
  id: ThemeId;
  name: string;
  dark: boolean;
  colors: {
    appBg: string;
    surface1: string;
    surface2: string;
    surface3: string;
    text: string;
    textMuted: string;
    primary: string;
    onPrimary: string;
    gold: string;
    danger: string;
    info: string;
    border: string;
    human: string;
    elf: string;
    orc: string;
  };
};

export const themes: Record<ThemeId, GameTheme> = {
  original: {
    id: 'original',
    name: 'Charcoal',
    dark: true,
    colors: {
      appBg: '#080808',
      surface1: '#121212',
      surface2: '#1C1C1C',
      surface3: '#262626',
      text: '#F4F4F4',
      textMuted: '#B5B5B5',
      primary: '#65B77A',
      onPrimary: '#101010',
      gold: '#D9A84E',
      danger: '#C95F5A',
      info: '#66A7D9',
      border: '#3C3C3C',
      human: '#6F96BF',
      elf: '#6DA879',
      orc: '#B56B59'
    }
  },
  dark: {
    id: 'dark',
    name: 'Pure Black',
    dark: true,
    colors: {
      appBg: '#000000',
      surface1: '#101010',
      surface2: '#191919',
      surface3: '#242424',
      text: '#F5F5F5',
      textMuted: '#B3B3B3',
      primary: '#72D68A',
      onPrimary: '#101010',
      gold: '#F3C461',
      danger: '#F17872',
      info: '#77BDF0',
      border: '#3B3B3B',
      human: '#80AEE0',
      elf: '#7BC98A',
      orc: '#D77C67'
    }
  },
  light: {
    id: 'light',
    name: 'Light',
    dark: false,
    colors: {
      appBg: '#F3EFE6',
      surface1: '#FFFFFF',
      surface2: '#E9E3D8',
      surface3: '#DDD6C9',
      text: '#1A242C',
      textMuted: '#68747C',
      primary: '#397A50',
      onPrimary: '#FFFFFF',
      gold: '#A87326',
      danger: '#B74440',
      info: '#3E7EAE',
      border: '#D2CBC0',
      human: '#456F9B',
      elf: '#4E7D58',
      orc: '#945341'
    }
  }
};

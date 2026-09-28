export type ThemeId = 'original' | 'dark' | 'light';

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
    name: 'Original',
    dark: true,
    colors: {
      appBg: '#182127',
      surface1: '#233039',
      surface2: '#2D3A42',
      surface3: '#35444E',
      text: '#F4E9D4',
      textMuted: '#AAB5B8',
      primary: '#65B77A',
      gold: '#D9A84E',
      danger: '#C95F5A',
      info: '#66A7D9',
      border: '#46555E',
      human: '#6F96BF',
      elf: '#6DA879',
      orc: '#B56B59'
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    dark: true,
    colors: {
      appBg: '#0D1217',
      surface1: '#141C23',
      surface2: '#1D2831',
      surface3: '#26333D',
      text: '#F7F8FA',
      textMuted: '#98A6B0',
      primary: '#72D68A',
      gold: '#F3C461',
      danger: '#F17872',
      info: '#77BDF0',
      border: '#33424D',
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

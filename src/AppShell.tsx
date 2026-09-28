import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { NavId } from './game/types';
import { ArmyScreen } from './screens/ArmyScreen';
import { CampaignScreen } from './screens/CampaignScreen';
import { FormationScreen } from './screens/FormationScreen';
import { KingdomScreen } from './screens/KingdomScreen';
import { WagonScreen } from './screens/WagonScreen';
import { useGameTheme } from './theme/ThemeProvider';

const navItems: Array<{ id: NavId; label: string; icon: string }> = [
  { id: 'kingdom', label: 'Kingdom', icon: '♜' },
  { id: 'campaign', label: 'Campaign', icon: '◇' },
  { id: 'formation', label: 'Formation', icon: '▦' },
  { id: 'wagon', label: 'Wagon', icon: '▤' },
  { id: 'army', label: 'Army', icon: '♞' }
];

const screenTitles: Record<NavId, string> = {
  kingdom: 'Kingdom',
  campaign: 'Campaign',
  formation: 'Formation',
  wagon: 'Supply Wagon',
  army: 'Army'
};

export function AppShell() {
  const [active, setActive] = useState<NavId>('kingdom');
  const { theme, cycleTheme } = useGameTheme();

  const screen = useMemo(() => {
    switch (active) {
      case 'campaign':
        return <CampaignScreen />;
      case 'formation':
        return <FormationScreen />;
      case 'wagon':
        return <WagonScreen />;
      case 'army':
        return <ArmyScreen />;
      case 'kingdom':
      default:
        return <KingdomScreen />;
    }
  }, [active]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.appBg }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.appBg}
      />

      <View style={[styles.topBar, { borderBottomColor: theme.colors.border }]}>
        <View>
          <Text style={[styles.brand, { color: theme.colors.gold }]}>CART & CROWN</Text>
          <Text style={[styles.screenTitle, { color: theme.colors.text }]}>
            {screenTitles[active]}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change theme"
          onPress={cycleTheme}
          style={({ pressed }) => [
            styles.themeButton,
            {
              backgroundColor: theme.colors.surface1,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.78 : 1
            }
          ]}
        >
          <Text style={styles.themeIcon}>{theme.dark ? '◐' : '☼'}</Text>
        </Pressable>
      </View>

      <View style={styles.screen}>{screen}</View>

      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: theme.colors.surface1,
            borderTopColor: theme.colors.border
          }
        ]}
      >
        {navItems.map(item => {
          const selected = item.id === active;

          return (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setActive(item.id)}
              style={styles.navItem}
            >
              <View
                style={[
                  styles.navIconWrap,
                  selected
                    ? { backgroundColor: theme.colors.primary + '2F' }
                    : undefined
                ]}
              >
                <Text
                  style={[
                    styles.navIcon,
                    { color: selected ? theme.colors.primary : theme.colors.textMuted }
                  ]}
                >
                  {item.icon}
                </Text>
              </View>
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: selected ? theme.colors.primary : theme.colors.textMuted
                  }
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  topBar: {
    height: 66,
    paddingHorizontal: 17,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  brand: {
    fontSize: 9,
    letterSpacing: 1.8,
    fontWeight: '900'
  },
  screenTitle: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '900',
    marginTop: 1
  },
  themeButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  themeIcon: {
    fontSize: 20,
    color: '#D9A84E'
  },
  screen: {
    flex: 1
  },
  bottomNav: {
    height: 76,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 4
  },
  navItem: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navIconWrap: {
    width: 36,
    height: 31,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navIcon: {
    fontSize: 20,
    fontWeight: '900'
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2
  }
});

import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors } from '../theme/colors';

const PHONE_W = 390;
const PHONE_H = 844;
const BEZEL = 11;

type Props = {
  children: React.ReactNode;
};

/**
 * Web desktop: premium phone mockup.
 * Native / narrow: full-bleed app.
 */
export function PhoneShell({ children }: Props) {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const showFrame = isWeb && width >= 480 && height >= 620;

  if (!showFrame) {
    return <View style={styles.fill}>{children}</View>;
  }

  const scale = Math.min(
    (height - 48) / (PHONE_H + BEZEL * 2),
    (width - 64) / (PHONE_W + BEZEL * 2),
    1
  );

  return (
    <View style={styles.desk}>
      <View style={styles.glow} />
      <View
        style={[
          styles.device,
          {
            width: PHONE_W + BEZEL * 2,
            height: PHONE_H + BEZEL * 2,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.bezel}>
          <View style={styles.islandWrap} pointerEvents="none">
            <View style={styles.island} />
          </View>
          <View style={styles.screen}>{children}</View>
          <View style={styles.homeWrap} pointerEvents="none">
            <View style={styles.homeIndicator} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.background,
  },
  desk: {
    flex: 1,
    backgroundColor: colors.desk,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: 'rgba(138, 115, 74, 0.08)',
  },
  device: {
    borderRadius: 54,
    ...Platform.select({
      web: {
        boxShadow:
          '0 50px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07), inset 0 0 0 1px rgba(255,255,255,0.04)',
      } as object,
      default: {},
    }),
  },
  bezel: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 54,
    padding: BEZEL,
    overflow: 'hidden',
  },
  islandWrap: {
    position: 'absolute',
    top: BEZEL + 11,
    left: 0,
    right: 0,
    zIndex: 30,
    alignItems: 'center',
  },
  island: {
    width: 118,
    height: 34,
    borderRadius: 20,
    backgroundColor: '#000000',
  },
  screen: {
    flex: 1,
    backgroundColor: colors.phoneScreen,
    borderRadius: 42,
    overflow: 'hidden',
  },
  homeWrap: {
    position: 'absolute',
    bottom: BEZEL + 7,
    left: 0,
    right: 0,
    zIndex: 30,
    alignItems: 'center',
  },
  homeIndicator: {
    width: 118,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

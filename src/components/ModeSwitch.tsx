import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppMode } from '../data/types';
import { colors, radius, spacing } from '../theme/colors';

type Props = {
  value: AppMode;
  onChange: (mode: AppMode) => void;
  style?: ViewStyle;
};

export function ModeSwitch({ value, onChange, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        onPress={() => onChange('customer')}
        style={[styles.option, value === 'customer' && styles.optionOn]}
      >
        <Text style={[styles.label, value === 'customer' && styles.labelOn]}>
          Potrebujem delo
        </Text>
        <Text style={[styles.sub, value === 'customer' && styles.subOn]}>
          Objavim, kar moram urediti
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('worker')}
        style={[styles.option, value === 'worker' && styles.optionOn]}
      >
        <Text style={[styles.label, value === 'worker' && styles.labelOn]}>
          Iščem delo
        </Text>
        <Text style={[styles.sub, value === 'worker' && styles.subOn]}>
          Ponujam storitve kot mojster
        </Text>
      </Pressable>
    </View>
  );
}

/** Compact segmented control for headers */
export function ModeSegment({ value, onChange, style }: Props) {
  return (
    <View style={[styles.seg, style]}>
      <Pressable
        onPress={() => onChange('customer')}
        style={[styles.segBtn, value === 'customer' && styles.segBtnOn]}
      >
        <Text style={[styles.segText, value === 'customer' && styles.segTextOn]}>
          Potrebujem delo
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('worker')}
        style={[styles.segBtn, value === 'worker' && styles.segBtnOn]}
      >
        <Text style={[styles.segText, value === 'worker' && styles.segTextOn]}>
          Iščem delo
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  option: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
  },
  optionOn: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  labelOn: {
    color: colors.textOnPrimary,
  },
  sub: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  subOn: {
    color: 'rgba(255,255,255,0.72)',
  },

  seg: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 3,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  segBtnOn: {
    backgroundColor: colors.ink,
  },
  segText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  segTextOn: {
    color: colors.textOnPrimary,
  },
});

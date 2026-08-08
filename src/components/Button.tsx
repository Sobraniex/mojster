import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  fullWidth,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? colors.ink
              : colors.textOnPrimary
          }
        />
      ) : (
        <Text style={[styles.text, textStyles[variant]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 15,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.4 },

  primary: { backgroundColor: colors.ink },
  secondary: { backgroundColor: colors.inkSoft },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  ghost: { backgroundColor: colors.surfaceAlt },
  danger: { backgroundColor: colors.danger },

  text: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

const textStyles = StyleSheet.create({
  primary: { color: colors.textOnPrimary },
  secondary: { color: colors.textOnPrimary },
  outline: { color: colors.ink },
  ghost: { color: colors.ink },
  danger: { color: colors.textOnPrimary },
});

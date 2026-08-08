import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ServiceCategory } from '../data/types';
import { colors, radius, spacing } from '../theme/colors';

type Props = {
  category: ServiceCategory;
  onPress: () => void;
  compact?: boolean;
};

export function CategoryCard({ category, onPress, compact }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compact,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={category.icon as keyof typeof Ionicons.glyphMap}
          size={compact ? 18 : 20}
          color={colors.ink}
        />
      </View>
      <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={2}>
        {category.name}
      </Text>
      {!compact && (
        <Text style={styles.desc} numberOfLines={2}>
          {category.description}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    minHeight: 132,
  },
  compact: {
    minHeight: 96,
    padding: 12,
    alignItems: 'center',
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  nameCompact: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 0,
  },
  desc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
});

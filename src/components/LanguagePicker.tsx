import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useI18n } from '../i18n/I18nContext';
import { LANGS, Lang } from '../i18n/types';
import { colors, radius, spacing } from '../theme/colors';

type Props = {
  style?: ViewStyle;
  compact?: boolean;
};

export function LanguagePicker({ style, compact }: Props) {
  const { lang, setLang, t } = useI18n();

  return (
    <View style={[styles.wrap, style]}>
      {!compact ? (
        <>
          <Text style={styles.label}>{t.language}</Text>
          <Text style={styles.hint}>{t.languageHint}</Text>
        </>
      ) : null}
      <View style={styles.row}>
        {LANGS.map((l) => {
          const on = lang === l.id;
          return (
            <Pressable
              key={l.id}
              onPress={() => setLang(l.id as Lang)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipCode, on && styles.chipCodeOn]}>
                {l.id.toUpperCase()}
              </Text>
              <Text style={[styles.chipText, on && styles.chipTextOn]} numberOfLines={1}>
                {l.native}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
    lineHeight: 17,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    width: '31%',
    minWidth: 96,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  chipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipCode: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.accent,
    marginBottom: 4,
  },
  chipCodeOn: {
    color: colors.accentMuted,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextOn: {
    color: colors.textOnPrimary,
  },
});

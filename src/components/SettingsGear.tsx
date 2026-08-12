import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../i18n/I18nContext';
import { colors, radius, spacing } from '../theme/colors';
import { LanguagePicker } from './LanguagePicker';
import { Button } from './Button';

/**
 * Settings gear — top right, always available.
 * Language change applies app-wide via I18nContext.
 */
export function SettingsGear() {
  const insets = useSafeAreaInsets();
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);

  const top = Math.max(insets.top, Platform.OS === 'web' ? 48 : 12) + 4;

  return (
    <>
      <Pressable
        accessibilityLabel={t.language}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.gear,
          { top, right: 16 },
          pressed && { opacity: 0.75 },
        ]}
        hitSlop={10}
      >
        <Ionicons name="settings-outline" size={20} color={colors.ink} />
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t.language}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.sheetSub}>{t.languageHint}</Text>
            <LanguagePicker compact />
            <Text style={styles.current}>{lang.toUpperCase()}</Text>
            <Button title={t.save} onPress={() => setOpen(false)} fullWidth />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  gear: {
    position: 'absolute',
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      } as object,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      },
    }),
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sheetSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  current: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.accent,
    marginBottom: spacing.md,
    marginTop: 4,
  },
});

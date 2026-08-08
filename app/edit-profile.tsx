import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { useApp } from '../src/context/AppContext';
import { CATEGORIES } from '../src/data/categories';
import { colors, radius, spacing } from '../src/theme/colors';

export default function EditProfileScreen() {
  const router = useRouter();
  const { currentUser, updateProfile, isWorkerMode } = useApp();

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '');
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [city, setCity] = useState(currentUser?.city ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [specialties, setSpecialties] = useState<string[]>(
    currentUser?.specialties ?? []
  );
  const [loading, setLoading] = useState(false);

  function toggleSpecialty(id: string) {
    setSpecialties((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function save() {
    setLoading(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        city: city.trim(),
        bio: bio.trim(),
        specialties,
      });
      router.back();
    } finally {
      setLoading(false);
    }
  }

  const typeLabel =
    currentUser?.activeMode === 'worker'
      ? 'Iščem delo · Mojster'
      : 'Potrebujem delo · Stranka';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeLabel}>TIP PROFILA</Text>
          <Text style={styles.typeBadgeValue}>{typeLabel}</Text>
          <Text style={styles.typeHint}>
            Tip se izbere ob registraciji. Za drugi tip izbrišite podatke in ustvarite nov profil.
          </Text>
        </View>

        <Input label="Ime" value={firstName} onChangeText={setFirstName} />
        <Input label="Priimek" value={lastName} onChangeText={setLastName} />
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Telefon"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Input label="Mesto" value={city} onChangeText={setCity} />
        <Input
          label="Bio"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
          placeholder="Kratek opis o vas ali vašem delu"
        />

        {isWorkerMode ? (
          <>
            <Text style={styles.label}>Specialnosti</Text>
            <Text style={styles.hint}>
              Po tem vas sistem uvrsti med relevantna dela.
            </Text>
            <View style={styles.specs}>
              {CATEGORIES.map((c) => {
                const on = specialties.includes(c.id);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => toggleSpecialty(c.id)}
                    style={[styles.spec, on && styles.specOn]}
                  >
                    <Text style={[styles.specText, on && styles.specTextOn]}>
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        <Button
          title="Shrani"
          onPress={save}
          loading={loading}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    paddingBottom: 48,
  },
  typeBadge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: spacing.lg,
  },
  typeBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.accent,
    marginBottom: 4,
  },
  typeBadgeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.2,
  },
  typeHint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 10,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
    marginTop: -4,
  },
  specs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  spec: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  specOn: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  specText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  specTextOn: {
    color: colors.textOnPrimary,
  },
});

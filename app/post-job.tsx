import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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
import { useI18n } from '../src/i18n/I18nContext';
import { colors, radius, spacing } from '../src/theme/colors';

export default function PostJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const { t } = useI18n();
  const { createJob, currentUser } = useApp();

  const [categoryId, setCategoryId] = useState(params.categoryId ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState(currentUser?.city ?? '');
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showAllCats, setShowAllCats] = useState(false);

  async function pickImages() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.permission, t.permGallery);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5 - photos.length,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((p) => [...p, ...uris].slice(0, 5));
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.permission, t.permCamera);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });

    if (!result.canceled && result.assets[0]) {
      setPhotos((p) => [...p, result.assets[0].uri].slice(0, 5));
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!categoryId) e.categoryId = 't.pickService';
    if (!title.trim()) e.title = t.errTitle;
    if (!description.trim() || description.trim().length < 20) {
      e.description = t.errDescription;
    }
    if (!location.trim()) e.location = t.errLocation;
    if (!city.trim()) e.city = t.errCity;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const job = await createJob({
        categoryId,
        title,
        description,
        location,
        city,
        budget: null,
        photos,
      });
      router.replace(`/job/${job.id}`);
    } catch {
      Alert.alert(t.error, t.errSave);
    } finally {
      setLoading(false);
    }
  }

  const visibleCats = showAllCats ? CATEGORIES : CATEGORIES.slice(0, 8);

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
        <Text style={styles.hint}>
          {t.postHint}
        </Text>

        <Text style={styles.label}>{t.serviceType}</Text>
        <View style={styles.catGrid}>
          {visibleCats.map((c) => {
            const selected = categoryId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategoryId(c.id)}
                style={[styles.catChip, selected && styles.catChipOn]}
              >
                <Text style={[styles.catChipText, selected && styles.catChipTextOn]} numberOfLines={1}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={() => setShowAllCats((v) => !v)} style={styles.more}>
          <Text style={styles.moreText}>
            {showAllCats ? t.showLess : `${t.allServices} (${CATEGORIES.length})`}
          </Text>
        </Pressable>
        {errors.categoryId ? <Text style={styles.error}>{errors.categoryId}</Text> : null}

        <Input
          label={t.jobTitle}
          placeholder={t.jobTitlePh}
          value={title}
          onChangeText={setTitle}
          error={errors.title}
        />
        <Input
          label={t.description}
          placeholder={t.descriptionPh}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          style={{ minHeight: 110, textAlignVertical: 'top' }}
          error={errors.description}
        />
        <Input
          label={t.location}
          placeholder={t.locationPh}
          value={location}
          onChangeText={setLocation}
          error={errors.location}
        />
        <Input
          label={t.city}
          placeholder={t.cityPh}
          value={city}
          onChangeText={setCity}
          error={errors.city}
        />

        <View style={styles.dealBox}>
          <Text style={styles.dealTitle}>{t.dealBoxTitle}</Text>
          <Text style={styles.dealText}>
            {t.dealBoxText}
          </Text>
        </View>

        <Text style={styles.label}>{t.photos}</Text>
        <View style={styles.photoRow}>
          {photos.map((uri) => (
            <View key={uri} style={styles.photoWrap}>
              <Image source={{ uri }} style={styles.photo} contentFit="cover" />
              <Pressable
                style={styles.photoRemove}
                onPress={() => setPhotos((p) => p.filter((x) => x !== uri))}
              >
                <Ionicons name="close" size={12} color="#fff" />
              </Pressable>
            </View>
          ))}
          {photos.length < 5 ? (
            <>
              <Pressable style={styles.photoAdd} onPress={pickImages}>
                <Ionicons name="images-outline" size={20} color={colors.ink} />
                <Text style={styles.photoAddText}>{t.gallery}</Text>
              </Pressable>
              <Pressable style={styles.photoAdd} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={20} color={colors.ink} />
                <Text style={styles.photoAddText}>{t.camera}</Text>
              </Pressable>
            </>
          ) : null}
        </View>

        <Button
          title={t.publishJob}
          onPress={handleSubmit}
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
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: radius.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 10,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  catChipTextOn: {
    color: colors.textOnPrimary,
  },
  more: { marginTop: 10, marginBottom: 10 },
  moreText: {
    color: colors.ink,
    fontWeight: '600',
    fontSize: 13,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 8,
  },
  dealBox: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dealTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.accent,
    marginBottom: 6,
  },
  dealText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoWrap: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAdd: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    gap: 4,
  },
  photoAddText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});

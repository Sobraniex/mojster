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
import { colors, radius, spacing } from '../src/theme/colors';

export default function PostJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string }>();
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
      Alert.alert('Dovoljenje', 'Za fotografije del potrebujemo dostop do galerije.');
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
      Alert.alert('Dovoljenje', 'Za fotografije del potrebujemo kamero.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });

    if (!result.canceled && result.assets[0]) {
      setPhotos((p) => [...p, result.assets[0].uri].slice(0, 5));
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!categoryId) e.categoryId = 'Izberite storitev';
    if (!title.trim()) e.title = 'Vnesite naslov';
    if (!description.trim() || description.trim().length < 20) {
      e.description = 'Opis naj bo vsaj 20 znakov';
    }
    if (!location.trim()) e.location = 'Vnesite lokacijo';
    if (!city.trim()) e.city = 'Vnesite mesto';
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
      Alert.alert('Napaka', 'Objave ni bilo mogoče shraniti.');
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
          Opis in fotografije. Cene ni na objavi — mojstri pošljejo ponudbe v app-u, dogovor sklenete tam.
        </Text>

        <Text style={styles.label}>Vrsta storitve</Text>
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
            {showAllCats ? 'Pokaži manj' : `Vse storitve (${CATEGORIES.length})`}
          </Text>
        </Pressable>
        {errors.categoryId ? <Text style={styles.error}>{errors.categoryId}</Text> : null}

        <Input
          label="Naslov"
          placeholder="npr. Barvanje dnevne sobe"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
        />
        <Input
          label="Opis"
          placeholder="Kaj točno potrebujete? Dimenzije, materiali, dostop…"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          style={{ minHeight: 110, textAlignVertical: 'top' }}
          error={errors.description}
        />
        <Input
          label="Lokacija"
          placeholder="npr. Bežigrad"
          value={location}
          onChangeText={setLocation}
          error={errors.location}
        />
        <Input
          label="Mesto"
          placeholder="npr. Ljubljana"
          value={city}
          onChangeText={setCity}
          error={errors.city}
        />

        <View style={styles.dealBox}>
          <Text style={styles.dealTitle}>Dogovor v aplikaciji</Text>
          <Text style={styles.dealText}>
            Na objavi ni cene. Mojstri vam pošljejo ponudbe; vi sprejmete tisto, ki vam ustreza.
          </Text>
        </View>

        <Text style={styles.label}>Fotografije · do 5</Text>
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
                <Text style={styles.photoAddText}>Galerija</Text>
              </Pressable>
              <Pressable style={styles.photoAdd} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={20} color={colors.ink} />
                <Text style={styles.photoAddText}>Kamera</Text>
              </Pressable>
            </>
          ) : null}
        </View>

        <Button
          title="Objavi delo"
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

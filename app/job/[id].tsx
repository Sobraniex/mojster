import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { OfferCard } from '../../src/components/OfferCard';
import { useApp } from '../../src/context/AppContext';
import { getCategoryById } from '../../src/data/categories';
import { formatPrice, formatRelative, statusLabel } from '../../src/lib/format';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const galleryW = Math.min(width, 390);
  const {
    jobs,
    currentUser,
    isWorkerMode,
    getUserById,
    getOffersForJob,
    createOffer,
    acceptOffer,
    rejectOffer,
    updateJobStatus,
    deleteJob,
  } = useApp();

  const job = jobs.find((j) => j.id === id);
  const [offerOpen, setOfferOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!job) {
    return (
      <View style={styles.center}>
        <Text style={styles.missing}>Delo ni najdeno.</Text>
        <Button title="Nazaj" onPress={() => router.back()} />
      </View>
    );
  }

  const currentJob = job;
  const cat = getCategoryById(currentJob.categoryId);
  const owner = getUserById(currentJob.userId);
  const isOwner = currentUser?.id === currentJob.userId;
  const jobOffers = getOffersForJob(currentJob.id);
  const myOffer = currentUser
    ? jobOffers.find((o) => o.workerId === currentUser.id)
    : undefined;
  const canOffer =
    !isOwner &&
    currentJob.status === 'open' &&
    !myOffer &&
    isWorkerMode;

  async function submitOffer() {
    const n = Number(price.replace(',', '.'));
    if (!price.trim() || Number.isNaN(n) || n <= 0) {
      Alert.alert('Cena', 'Vnesite veljavno ceno v EUR.');
      return;
    }
    setLoading(true);
    try {
      await createOffer({ jobId: currentJob.id, price: n, message });
      setOfferOpen(false);
      setPrice('');
      setMessage('');
      Alert.alert('Poslano', 'Vaša ponudba je bila poslana naročniku.');
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete() {
    Alert.alert('Izbriši delo', 'Res želite izbrisati to objavo?', [
      { text: 'Prekliči', style: 'cancel' },
      {
        text: 'Izbriši',
        style: 'destructive',
        onPress: async () => {
          await deleteJob(currentJob.id);
          router.back();
        },
      },
    ]);
  }

  function confirmComplete() {
    Alert.alert('Zaključek', 'Označiti delo kot končano?', [
      { text: 'Prekliči', style: 'cancel' },
      {
        text: 'Končano',
        onPress: () => updateJobStatus(currentJob.id, 'completed'),
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: cat?.name ?? 'Delo' }} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {currentJob.photos.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.gallery}
          >
            {currentJob.photos.map((uri) => (
              <Image
                key={uri}
                source={{ uri }}
                style={[styles.galleryImg, { width: galleryW }]}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.galleryPlaceholder}>
            <Ionicons
              name={(cat?.icon as keyof typeof Ionicons.glyphMap) || 'construct-outline'}
              size={36}
              color={colors.textMuted}
            />
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.topMeta}>
            <Text style={styles.category}>{cat?.name?.toUpperCase()}</Text>
            <Text style={styles.status}>{statusLabel(currentJob.status)}</Text>
          </View>

          <Text style={styles.title}>{currentJob.title}</Text>
          <Text style={styles.dealNote}>
            Cena se dogovori v aplikaciji prek ponudb.
          </Text>
          <Text style={styles.time}>Objavljeno {formatRelative(currentJob.createdAt)}</Text>

          <View style={styles.locBox}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <Text style={styles.locText}>
              {currentJob.location}, {currentJob.city}
            </Text>
          </View>

          <Text style={styles.section}>Opis</Text>
          <Text style={styles.desc}>{currentJob.description}</Text>

          {owner ? (
            <>
              <Text style={styles.section}>Naročnik</Text>
              <View style={styles.ownerCard}>
                <View style={styles.ownerAvatar}>
                  <Text style={styles.ownerInitials}>
                    {owner.firstName[0]}
                    {owner.lastName[0]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ownerName}>
                    {owner.firstName} {owner.lastName}
                  </Text>
                  {isOwner || currentJob.status !== 'open' ? (
                    <>
                      <Text style={styles.ownerContact}>{owner.phone}</Text>
                      <Text style={styles.ownerContact}>{owner.email}</Text>
                    </>
                  ) : (
                    <Text style={styles.ownerContact}>
                      Kontakt po sprejeti ponudbi
                    </Text>
                  )}
                </View>
              </View>
            </>
          ) : null}

          {canOffer ? (
            <Button
              title="Pošlji ponudbo"
              onPress={() => setOfferOpen(true)}
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          ) : null}

          {myOffer ? (
            <View style={styles.myOfferBox}>
              <Text style={styles.myOfferLabel}>VAŠA PONUDBA</Text>
              <Text style={styles.myOfferPrice}>{formatPrice(myOffer.price)}</Text>
              <Text style={styles.myOfferStatus}>{statusLabel(myOffer.status)}</Text>
              {myOffer.message ? (
                <Text style={styles.myOfferMsg}>{myOffer.message}</Text>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.section}>Ponudbe · {jobOffers.length}</Text>
          {jobOffers.length === 0 ? (
            <Text style={styles.emptyOffers}>
              {isOwner
                ? 'Še ni ponudb. Počakajte, da mojstri najdejo vaše delo.'
                : 'Še ni ponudb.'}
            </Text>
          ) : (
            jobOffers.map((o) => (
              <OfferCard
                key={o.id}
                offer={o}
                worker={getUserById(o.workerId)}
                isOwner={isOwner}
                onAccept={async () => {
                  await acceptOffer(o.id);
                  Alert.alert(
                    'Dogovor sklenjen',
                    'Ponudba je sprejeta. Zdaj lahko kontaktirate mojstra.'
                  );
                }}
                onReject={() => rejectOffer(o.id)}
              />
            ))
          )}

          {isOwner && currentJob.status === 'in_progress' ? (
            <Button
              title="Označi kot končano"
              onPress={confirmComplete}
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          ) : null}

          {isOwner ? (
            <Button
              title="Izbriši objavo"
              variant="danger"
              onPress={confirmDelete}
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={offerOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setOfferOpen(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Ponudba</Text>
            <Text style={styles.modalSub}>
              Predlagajte pogoje in ceno neposredno naročniku. Dogovor poteka v app-u.
            </Text>
            <Input
              label="Vaša cena (EUR)"
              placeholder="180"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              hint="Vidna le naročniku v vaši ponudbi — ne na javni objavi."
            />
            <Input
              label="Sporočilo"
              placeholder="Kdaj lahko pridete, kaj vključuje ponudba…"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              style={{ minHeight: 90, textAlignVertical: 'top' }}
            />
            <View style={styles.modalActions}>
              <Button
                title="Prekliči"
                variant="ghost"
                onPress={() => setOfferOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Pošlji"
                onPress={submitOffer}
                loading={loading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 48 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: colors.background,
  },
  missing: { fontSize: 15, color: colors.textMuted },
  gallery: { maxHeight: 220 },
  galleryImg: { height: 220 },
  galleryPlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  body: { padding: spacing.lg },
  topMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.accent,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
    lineHeight: 30,
  },
  dealNote: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 14,
  },
  locBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: spacing.md,
  },
  locText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  section: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: 10,
  },
  desc: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 23,
  },
  ownerCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitials: {
    fontWeight: '600',
    color: colors.textOnPrimary,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  ownerContact: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyOffers: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  myOfferBox: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  myOfferLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.accent,
  },
  myOfferPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 6,
  },
  myOfferStatus: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  myOfferMsg: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginTop: 6,
    lineHeight: 19,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getCategoryById } from '../data/categories';
import { Job } from '../data/types';
import { formatRelative, statusLabel } from '../lib/format';
import { colors, radius, spacing } from '../theme/colors';

type Props = {
  job: Job;
  onPress: () => void;
  offerCount?: number;
};

export function JobCard({ job, onPress, offerCount }: Props) {
  const cat = getCategoryById(job.categoryId);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {job.photos[0] ? (
        <Image source={{ uri: job.photos[0] }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={styles.thumbPlaceholder}>
          <Ionicons
            name={(cat?.icon as keyof typeof Ionicons.glyphMap) || 'construct-outline'}
            size={22}
            color={colors.textMuted}
          />
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.category} numberOfLines={1}>
            {cat?.name ?? 'Storitev'}
          </Text>
          <Text style={styles.status}>{statusLabel(job.status)}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {job.title}
        </Text>

        <View style={styles.meta}>
          <Ionicons name="location-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {job.location}, {job.city}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.time}>{formatRelative(job.createdAt)}</Text>
          {typeof offerCount === 'number' && offerCount > 0 ? (
            <Text style={styles.offers}>
              {offerCount} {offerCount === 1 ? 'ponudba' : 'ponudb'}
            </Text>
          ) : (
            <Text style={styles.dealHint}>Dogovor v app</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
  },
  pressed: { backgroundColor: colors.surfaceAlt },
  thumb: {
    width: 88,
    minHeight: 118,
  },
  thumbPlaceholder: {
    width: 88,
    minHeight: 118,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.accent,
    flex: 1,
  },
  status: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
  },
  offers: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.textSecondary,
  },
  dealHint: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: colors.accent,
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { Offer, User } from '../data/types';
import { formatPrice, formatRelative, initials, statusLabel } from '../lib/format';
import { colors, radius, spacing } from '../theme/colors';
import { Button } from './Button';

type Props = {
  offer: Offer;
  worker?: User;
  isOwner: boolean;
  onAccept?: () => void;
  onReject?: () => void;
};

export function OfferCard({ offer, worker, isOwner, onAccept, onReject }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {worker ? initials(worker.firstName, worker.lastName) : '—'}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>
            {worker ? `${worker.firstName} ${worker.lastName}` : 'Mojster'}
          </Text>
          {worker?.phone ? <Text style={styles.phone}>{worker.phone}</Text> : null}
          <Text style={styles.time}>{formatRelative(offer.createdAt)}</Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.price}>{formatPrice(offer.price)}</Text>
          <Text style={styles.status}>{statusLabel(offer.status)}</Text>
        </View>
      </View>

      {offer.message ? <Text style={styles.message}>{offer.message}</Text> : null}

      {isOwner && offer.status === 'pending' && onAccept && onReject ? (
        <View style={styles.actions}>
          <Button title="Zavrni" variant="outline" onPress={onReject} style={styles.btn} />
          <Button title="Sprejmi" onPress={onAccept} style={styles.btn} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '600',
    color: colors.textOnPrimary,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  headerInfo: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  phone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  priceBlock: { alignItems: 'flex-end' },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  status: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 2,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    backgroundColor: colors.surfaceAlt,
    padding: 12,
    borderRadius: radius.md,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btn: { flex: 1 },
});

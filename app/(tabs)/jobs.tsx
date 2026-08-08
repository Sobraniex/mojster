import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/EmptyState';
import { JobCard } from '../../src/components/JobCard';
import { useApp } from '../../src/context/AppContext';
import { JobStatus } from '../../src/data/types';
import { colors, radius, spacing } from '../../src/theme/colors';

const FILTERS: { id: 'all' | JobStatus; label: string }[] = [
  { id: 'all', label: 'Vsa' },
  { id: 'open', label: 'Odprta' },
  { id: 'in_progress', label: 'V teku' },
  { id: 'completed', label: 'Končana' },
];

export default function MyJobsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    getMyJobs,
    getOffersForJob,
    offers,
    currentUser,
    jobs,
    isWorkerMode,
  } = useApp();
  const [status, setStatus] = useState<'all' | JobStatus>('all');

  const posted = useMemo(() => {
    let list = getMyJobs();
    if (status !== 'all') list = list.filter((j) => j.status === status);
    return list;
  }, [getMyJobs, status]);

  const working = useMemo(() => {
    if (!currentUser) return [];
    const myOfferJobIds = offers
      .filter((o) => o.workerId === currentUser.id)
      .map((o) => o.jobId);
    let list = jobs.filter((j) => myOfferJobIds.includes(j.id));
    if (status !== 'all') list = list.filter((j) => j.status === status);
    return list;
  }, [currentUser, offers, jobs, status]);

  const data = isWorkerMode ? working : posted;

  return (
    <View style={[styles.flex, { paddingTop: Math.max(insets.top, 44) }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>PORTFELJ</Text>
          <Text style={styles.title}>
            {isWorkerMode ? 'Moje ponudbe' : 'Moja dela'}
          </Text>
        </View>
        {!isWorkerMode ? (
          <Pressable style={styles.addBtn} onPress={() => router.push('/post-job')}>
            <Text style={styles.addBtnText}>Objavi</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setStatus(f.id)}
            style={[styles.chip, status === f.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, status === f.id && styles.chipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(j) => j.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title={isWorkerMode ? 'Ni ponudb' : 'Ni objav'}
            subtitle={
              isWorkerMode
                ? 'Pošljite ponudbo na odprta dela — dogovor sklenete v app-u.'
                : 'Objavite delo — mojstri pošljejo ponudbe.'
            }
            actionLabel={isWorkerMode ? 'Poglej dela' : 'Objavi delo'}
            onAction={() =>
              isWorkerMode ? router.push('/(tabs)/explore') : router.push('/post-job')
            }
          />
        }
        renderItem={({ item }) => (
          <JobCard
            job={item}
            offerCount={getOffersForJob(item.id).length}
            onPress={() => router.push(`/job/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: colors.accent,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.8,
  },
  addBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    marginTop: 4,
  },
  addBtnText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: { color: colors.textOnPrimary },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: 4,
  },
});

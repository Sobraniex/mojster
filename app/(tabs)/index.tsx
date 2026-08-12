import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryCard } from '../../src/components/CategoryCard';
import { EmptyState } from '../../src/components/EmptyState';
import { JobCard } from '../../src/components/JobCard';
import { useApp } from '../../src/context/AppContext';
import { CATEGORIES } from '../../src/data/categories';
import { useI18n } from '../../src/i18n/I18nContext';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const {
    currentUser,
    isWorkerMode,
    getOpenJobs,
    getJobsMatchingWorker,
    getOffersForJob,
  } = useApp();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q)
    );
  }, [query]);

  const openJobs = useMemo(() => {
    if (!isWorkerMode) return [];
    const base = getJobsMatchingWorker().length
      ? getJobsMatchingWorker()
      : getOpenJobs();
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.city.toLowerCase().includes(q)
    );
  }, [isWorkerMode, getOpenJobs, getJobsMatchingWorker, query]);

  const rows: (typeof CATEGORIES)[] = [];
  for (let i = 0; i < filtered.length; i += 2) {
    rows.push(filtered.slice(i, i + 2));
  }

  return (
    <View style={[styles.flex, { paddingTop: Math.max(insets.top, 44) }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>
            {currentUser
              ? `${currentUser.firstName} ${currentUser.lastName}`.toUpperCase()
              : 'MOJSTER'}
          </Text>
          <Text style={styles.headline}>
            {isWorkerMode ? t.lookingForWork : t.whatDoYouNeed}
          </Text>
        </View>
        {!isWorkerMode ? (
          <Pressable
            style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/post-job')}
          >
            <Ionicons name="add" size={22} color={colors.textOnPrimary} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.search}
          placeholder={isWorkerMode ? t.searchJobs : t.searchServices}
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {isWorkerMode ? (
        <FlatList
          data={openJobs}
          keyExtractor={(j) => j.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.section}>{t.openJobs}</Text>
              <Text style={styles.sectionHint}>
                {t.openJobsHint}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title={t.noOpenJobs}
              subtitle={t.noOpenJobsSub}
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
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.section}>{t.services}</Text>
          <Text style={styles.sectionHint}>
            {t.servicesHint}
          </Text>

          {rows.map((row, idx) => (
            <View key={idx} style={styles.row}>
              {row.map((cat) => (
                <View key={cat.id} style={styles.cell}>
                  <CategoryCard
                    category={cat}
                    onPress={() => router.push(`/category/${cat.id}`)}
                  />
                </View>
              ))}
              {row.length === 1 ? <View style={styles.cell} /> : null}
            </View>
          ))}

          {filtered.length === 0 ? (
            <Text style={styles.empty}>{t.noResults} »{query}«</Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
            onPress={() => router.push('/post-job')}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaKicker}>{t.quickStart}</Text>
              <Text style={styles.ctaTitle}>{t.postJob}</Text>
              <Text style={styles.ctaSub}>
                {t.postJobSub}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={colors.ink} />
          </Pressable>
        </ScrollView>
      )}
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
    paddingRight: 64,
    gap: 12,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: colors.textMuted,
    marginBottom: 6,
  },
  headline: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.8,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  search: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    padding: 0,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.text,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  cell: { flex: 1 },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginVertical: spacing.lg,
    fontSize: 14,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaKicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.accent,
    marginBottom: 4,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  ctaSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
});

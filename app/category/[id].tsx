import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';
import { JobCard } from '../../src/components/JobCard';
import { useApp } from '../../src/context/AppContext';
import { getCategoryById } from '../../src/data/categories';
import { useI18n } from '../../src/i18n/I18nContext';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { getOpenJobs, getMyJobs, getOffersForJob, isWorkerMode, currentUser } =
    useApp();
  const cat = getCategoryById(id ?? '');

  /** Workers see all open jobs; customers only their own in this category */
  const jobs = useMemo(() => {
    if (isWorkerMode) return getOpenJobs(id);
    return getMyJobs().filter(
      (j) => j.categoryId === id && j.userId === currentUser?.id
    );
  }, [isWorkerMode, getOpenJobs, getMyJobs, id, currentUser?.id]);

  return (
    <>
      <Stack.Screen options={{ title: cat?.name ?? t.category }} />
      <View style={styles.flex}>
        {cat ? (
          <View style={styles.hero}>
            <View style={styles.icon}>
              <Ionicons
                name={cat.icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={colors.ink}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{cat.name}</Text>
              <Text style={styles.desc}>{cat.description}</Text>
            </View>
          </View>
        ) : null}

        {!isWorkerMode ? (
          <View style={styles.ctaWrap}>
            <Button
              title={t.postInCategory}
              onPress={() =>
                router.push({ pathname: '/post-job', params: { categoryId: id } })
              }
              fullWidth
            />
          </View>
        ) : null}

        <Text style={styles.section}>
          {isWorkerMode ? t.openJobs : t.myJobs} · {jobs.length}
        </Text>

        <FlatList
          data={jobs}
          keyExtractor={(j) => j.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="construct-outline"
              title={isWorkerMode ? t.emptyCategoryTitle : t.noPosts}
              subtitle={isWorkerMode ? t.emptyCategorySub : t.emptyPostsSub}
              actionLabel={!isWorkerMode ? t.postJob : undefined}
              onAction={() =>
                router.push({ pathname: '/post-job', params: { categoryId: id } })
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
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  desc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },
  ctaWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  section: {
    paddingHorizontal: spacing.lg,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
});

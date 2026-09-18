import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Header from '../components/Header';
import HistoryItem from '../components/HistoryItem';
import HistoryChart from '../components/HistoryChart';
import Icon from '../components/Icon';
import Colors from '../constants/Colors';
import { getHistoryData } from '../services/api';
import { formatTime } from '../utils/helpers';
import { AuthContext } from '../contexts/AuthContext';

const FILTERS = [
  { id: 'today', label: 'Hari Ini' },
  { id: '7days', label: '7 Hari' },
  { id: '30days', label: '30 Hari' },
];

export default function HistoryScreen() {
  const { userToken } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('today');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('--:--');

  const fetchHistory = useCallback(async (range) => {
    try {
      const data = await getHistoryData(range, userToken);
      setHistory(data);
      setLastUpdate(formatTime());
    } catch (err) {
      console.warn('History fetch error:', err);
    }
  }, [userToken]);

  useEffect(() => {
    setLoading(true);
    fetchHistory(filter).finally(() => setLoading(false));
  }, [filter, fetchHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory(filter);
    setRefreshing(false);
  }, [filter, fetchHistory]);

  const sortedForList = [...history].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const CountBadge = (
    <View style={styles.countBadge}>
      <Text style={styles.countText}>{history.length} entri</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      <Header
        title="Riwayat Data"
        subtitle="Histori monitoring PLTS"
        rightElement={CountBadge}
      />

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterPill, filter === f.id && styles.filterPillActive]}
            onPress={() => setFilter(f.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat riwayat...</Text>
        </View>
      ) : (
        <>
          <HistoryChart data={history} lastUpdate={lastUpdate} />

          <Text style={styles.sectionTitle}>Riwayat Pengukuran</Text>

          {sortedForList.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Icon name="inbox" size={32} color={Colors.textMuted} strokeWidth={1.8} />
              </View>
              <Text style={styles.emptyText}>Belum ada data</Text>
              <Text style={styles.emptySubText}>
                Data akan muncul setelah sensor mulai mencatat
              </Text>
            </View>
          ) : (
            sortedForList.map((item, idx) => (
              <HistoryItem key={`${item.timestamp}-${idx}`} {...item} />
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 30,
  },
  countBadge: {
    backgroundColor: Colors.accentGlow,
    borderColor: 'rgba(132,204,22,0.4)',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.3,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textLight,
  },
  filterTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textLight,
    fontSize: 12,
    marginTop: 10,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptySubText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
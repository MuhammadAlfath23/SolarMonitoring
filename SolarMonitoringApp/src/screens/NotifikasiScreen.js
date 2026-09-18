import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  RefreshControl,
} from 'react-native';
import NotificationItem from '../components/NotificationItem';
import Header from '../components/Header';
import Icon from '../components/Icon';
import Colors from '../constants/Colors';
import Config from '../constants/Config';
import { getPLTSData, generateNotifications } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function NotifikasiScreen() {
  const { userToken } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAndGenerate = useCallback(async () => {
    const data = await getPLTSData(userToken);
    const generated = generateNotifications(data);
    setNotifications(generated);
  }, [userToken]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAndGenerate();
    setRefreshing(false);
  }, [fetchAndGenerate]);

  useEffect(() => {
    fetchAndGenerate();
    const interval = setInterval(fetchAndGenerate, Config.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAndGenerate]);

  const hasAlert = notifications.some(n => n.type === 'danger' || n.type === 'warning');

  const CountBadge = notifications.length > 0 ? (
    <View style={[
      styles.badge,
      { backgroundColor: hasAlert ? Colors.danger : Colors.accent },
    ]}>
      <Text style={[
        styles.badgeText,
        { color: hasAlert ? '#fff' : Colors.primaryDarker },
      ]}>
        {notifications.length}
      </Text>
    </View>
  ) : null;

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
        title="Notifikasi"
        subtitle="Status sistem real-time"
        rightElement={CountBadge}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Status Terkini</Text>
        <Text style={styles.sectionSub}>{notifications.length} notifikasi aktif</Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIconWrap}>
            <Icon name="inbox" size={36} color={Colors.textMuted} strokeWidth={1.8} />
          </View>
          <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
          <Text style={styles.emptySubText}>Sistem berjalan normal</Text>
        </View>
      ) : (
        notifications.map((item) => (
          <NotificationItem key={item.id} {...item} />
        ))
      )}

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Keterangan</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendText}>Normal — semua baik</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
          <Text style={styles.legendText}>Peringatan — butuh perhatian</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
          <Text style={styles.legendText}>Bahaya — tindakan segera</Text>
        </View>
      </View>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textLight,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 7,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptySubText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  legend: {
    margin: 12,
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
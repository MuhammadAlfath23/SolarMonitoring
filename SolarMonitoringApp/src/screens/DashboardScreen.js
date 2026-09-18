import React, { useEffect, useState, useCallback, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import StatBox from '../components/StatBox';
import Header from '../components/Header';
import Icon from '../components/Icon';
import Colors from '../constants/Colors';
import Config from '../constants/Config';
import { getPLTSData } from '../services/api';
import { formatTime } from '../utils/helpers';
import { AuthContext } from '../contexts/AuthContext';

// Fungsi bantuan untuk hitung selisih waktu
const getTimeAgo = (timestamp) => {
  if (!timestamp) return null;
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return { level: 'ok', text: 'Baru saja' };
  if (diffMinutes < 5) return { level: 'ok', text: `${diffMinutes} menit lalu` };
  if (diffMinutes < 30) return { level: 'warning', text: `${diffMinutes} menit lalu` };
  if (diffHours < 24) return { level: 'offline', text: `${diffHours} jam lalu` };
  if (diffDays < 30) return { level: 'offline', text: `${diffDays} hari lalu` };
  return { level: 'offline', text: `${Math.floor(diffDays / 30)} bulan lalu` };
};

// Format tanggal jadi teks yang mudah dibaca
const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function DashboardScreen() {
  const { userToken } = useContext(AuthContext);
  const [data, setData] = useState({
    voltage: '0.0',
    current: '0.00',
    power: '0.0',
    isNormal: true,
    lastUpdated: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('--:--:--');
  const [isConnected, setIsConnected] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const result = await getPLTSData(userToken);
      setData(result);
      setLastUpdated(formatTime());
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  }, [userToken]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, Config.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Hitung status sensor berdasarkan lastUpdated dari backend
  const sensorStatus = useMemo(() => {
    return getTimeAgo(data.lastUpdated);
  }, [data.lastUpdated]);

  const ConnectionBadge = (
    <View style={[
      styles.connBadge,
      {
        backgroundColor: isConnected ? Colors.accentGlow : 'rgba(239,68,68,0.18)',
        borderColor: isConnected ? 'rgba(132,204,22,0.4)' : 'rgba(239,68,68,0.4)',
      },
    ]}>
      <Icon
        name={isConnected ? 'wifi' : 'wifi-off'}
        size={12}
        color={isConnected ? Colors.accent : '#fca5a5'}
        strokeWidth={2.5}
      />
      <Text style={[
        styles.connText,
        { color: isConnected ? Colors.accent : '#fca5a5' },
      ]}>
        {isConnected ? 'Online' : 'Offline'}
      </Text>
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
        title="Dashboard PLTS"
        subtitle={`Update: ${lastUpdated}`}
        rightElement={ConnectionBadge}
      />

      {/* Banner Sensor Offline (Merah) */}
      {sensorStatus && sensorStatus.level === 'offline' && (
        <View style={styles.offlineBanner}>
          <View style={styles.offlineIconWrap}>
            <Text style={styles.offlineIcon}>⚠️</Text>
          </View>
          <View style={styles.offlineTextWrap}>
            <Text style={styles.offlineTitle}>SENSOR OFFLINE</Text>
            <Text style={styles.offlineSubtitle}>
              Data terakhir {sensorStatus.text}
            </Text>
            <Text style={styles.offlineDetail}>
              {formatDateTime(data.lastUpdated)}
            </Text>
            <Text style={styles.offlineNote}>
              Data yang ditampilkan mungkin sudah tidak akurat
            </Text>
          </View>
        </View>
      )}

      {/* Banner Data Belum Update (Kuning) */}
      {sensorStatus && sensorStatus.level === 'warning' && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⏱️</Text>
          <View style={styles.warningTextWrap}>
            <Text style={styles.warningTitle}>Data belum diperbarui</Text>
            <Text style={styles.warningSubtitle}>
              Data terakhir {sensorStatus.text}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.row}>
        <StatBox label="Tegangan" value={data.voltage} unit="V" iconName="bolt" />
        <StatBox label="Arus" value={data.current} unit="A" iconName="wave" />
      </View>

      <View style={styles.rowCenter}>
        <StatBox label="Daya" value={data.power} unit="W" iconName="activity" />
      </View>

      <Text style={styles.refreshHint}>
        Tarik ke bawah untuk memperbarui data
      </Text>
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
  row: {
    flexDirection: 'row',
    paddingHorizontal: 7,
    marginTop: 10,
  },
  rowCenter: {
    flexDirection: 'row',
    paddingHorizontal: 7,
    justifyContent: 'center',
    marginTop: 4,
  },
  connBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  connText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  refreshHint: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 16,
    fontStyle: 'italic',
  },
  offlineBanner: {
    flexDirection: 'row',
    backgroundColor: '#fee2e2',
    marginHorizontal: 12,
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fca5a5',
    gap: 12,
    alignItems: 'flex-start',
  },
  offlineIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineIcon: {
    fontSize: 18,
  },
  offlineTextWrap: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#b91c1c',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  offlineSubtitle: {
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '600',
  },
  offlineDetail: {
    fontSize: 11,
    color: '#7f1d1d',
    marginTop: 2,
    fontStyle: 'italic',
  },
  offlineNote: {
    fontSize: 10,
    color: '#7f1d1d',
    marginTop: 6,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    marginHorizontal: 12,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcd34d',
    gap: 10,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 18,
  },
  warningTextWrap: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  warningSubtitle: {
    fontSize: 11,
    color: '#78350f',
    marginTop: 1,
  },
});
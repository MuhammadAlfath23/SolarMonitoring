import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

export default function HistoryItem({ timestamp, voltage, current, power, battery }) {
  // Format timestamp
  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.timeBox}>
        <Text style={styles.timeBig}>{timeStr}</Text>
        <Text style={styles.dateText}>{dateStr}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{voltage} <Text style={styles.unit}>V</Text></Text>
          <Text style={styles.statLabel}>Tegangan</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{power} <Text style={styles.unit}>W</Text></Text>
          <Text style={styles.statLabel}>Daya</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 14,
    padding: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  timeBox: {
    flex: 1,
  },
  timeBig: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  stat: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  unit: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 9,
    color: Colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
});
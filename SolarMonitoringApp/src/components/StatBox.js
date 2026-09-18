import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import Icon from './Icon';

export default function StatBox({ label, value, unit, iconName, trend }) {
  return (
    <View style={styles.box}>
      <View style={styles.iconWrapper}>
        <Icon name={iconName} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}> {unit}</Text>
      </View>
      {trend !== undefined && (
        <Text style={[styles.trend, { color: trend >= 0 ? Colors.success : Colors.danger }]}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)} {unit}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: Colors.white,
    margin: 5,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  unit: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
  },
  trend: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});
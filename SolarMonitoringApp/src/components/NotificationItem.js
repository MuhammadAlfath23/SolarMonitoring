import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import Icon from './Icon';

const TYPE_CONFIG = {
  normal: {
    color: Colors.successText,
    accent: Colors.success,
    bg: Colors.successBg,
    iconName: 'check-circle',
    label: 'Normal',
  },
  warning: {
    color: Colors.warningText,
    accent: Colors.warning,
    bg: Colors.warningBg,
    iconName: 'alert-triangle',
    label: 'Peringatan',
  },
  danger: {
    color: Colors.dangerText,
    accent: Colors.danger,
    bg: Colors.dangerBg,
    iconName: 'alert-circle',
    label: 'Bahaya',
  },
  info: {
    color: Colors.infoText,
    accent: Colors.info,
    bg: Colors.infoBg,
    iconName: 'info',
    label: 'Info',
  },
};

export default function NotificationItem({ title, message, type = 'info', timestamp }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  return (
    <View style={[styles.container, { borderLeftColor: config.accent, backgroundColor: config.bg }]}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: config.accent + '22' }]}>
          <Icon name={config.iconName} size={18} color={config.accent} />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: config.color }]}>{title}</Text>
            <View style={[styles.typeBadge, { backgroundColor: config.accent + '22' }]}>
              <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
            </View>
          </View>
          <Text style={styles.message}>{message}</Text>
          {timestamp ? <Text style={styles.timestamp}>{timestamp}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 5,
    borderLeftWidth: 4,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
    letterSpacing: -0.2,
  },
  typeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    marginLeft: 8,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  timestamp: {
    marginTop: 6,
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
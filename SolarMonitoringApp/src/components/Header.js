import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

export default function Header({ title, subtitle, rightElement }) {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.textGroup}>
          <Text style={styles.text}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightElement && <View style={styles.right}>{rightElement}</View>}
      </View>
      {/* Lime accent strip — signature modern touch */}
      <View style={styles.accentStrip} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryDark,
    paddingTop: 8,
    paddingBottom: 16,
    shadowColor: Colors.primaryDarker,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  textGroup: {
    flex: 1,
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
  },
  right: {
    marginLeft: 12,
  },
  accentStrip: {
    height: 3,
    backgroundColor: Colors.accent,
    marginTop: 12,
  },
});
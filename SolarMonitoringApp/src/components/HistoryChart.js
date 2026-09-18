import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import Colors from '../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 56;
const CHART_HEIGHT = 160;
const PADDING = { top: 15, bottom: 25, left: 35, right: 40 };

export default function HistoryChart({ data = [], lastUpdate }) {
  if (data.length < 2) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Trend Tegangan & Daya</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Belum ada cukup data untuk grafik</Text>
        </View>
      </View>
    );
  }

  const voltages = data.map((d) => parseFloat(d.voltage));
  const powers = data.map((d) => parseFloat(d.power));

  
  const vMin = Math.min(...voltages);
  const vMax = Math.max(...voltages);
  const pMin = Math.min(...powers);
  const pMax = Math.max(...powers);

  const innerW = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  
  const buildPath = (values, min, max) => {
    const range = max - min || 1;
    return values
      .map((v, i) => {
        const x = PADDING.left + (i / (values.length - 1)) * innerW;
        const y = PADDING.top + innerH - ((v - min) / range) * innerH;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const voltagePath = buildPath(voltages, vMin, vMax);
  const powerPath = buildPath(powers, pMin, pMax);

  
  const formatNumber = (value, range) => {
    const decimals = range < 5 ? 1 : 0;
    return value.toFixed(decimals);
  };

  const vRange = vMax - vMin;
  const pRange = pMax - pMin;

  
  const yLeftLines = [
    { y: PADDING.top, label: formatNumber(vMax, vRange) },
    { y: PADDING.top + innerH / 2, label: formatNumber((vMin + vMax) / 2, vRange) },
    { y: PADDING.top + innerH, label: formatNumber(vMin, vRange) },
  ];

  
  const yRightLabels = [
    { y: PADDING.top, label: formatNumber(pMax, pRange) },
    { y: PADDING.top + innerH / 2, label: formatNumber((pMin + pMax) / 2, pRange) },
    { y: PADDING.top + innerH, label: formatNumber(pMin, pRange) },
  ];

  
  const formatTime = (ts, useSeconds = false) => {
    const d = new Date(ts);
    const options = useSeconds
      ? { hour: '2-digit', minute: '2-digit', second: '2-digit' }
      : { hour: '2-digit', minute: '2-digit' };
    return d.toLocaleTimeString('id-ID', options);
  };

  
  const timeFirst = new Date(data[0].timestamp).getTime();
  const timeLast = new Date(data[data.length - 1].timestamp).getTime();
  const timeSpanMinutes = (timeLast - timeFirst) / (1000 * 60);
  const showSeconds = timeSpanMinutes < 10; // kalau rentang < 10 menit, tampilkan detik

  const xLabels = [
    { x: PADDING.left, label: formatTime(data[0].timestamp, showSeconds) },
    { x: PADDING.left + innerW / 2, label: formatTime(data[Math.floor(data.length / 2)].timestamp, showSeconds) },
    { x: PADDING.left + innerW, label: formatTime(data[data.length - 1].timestamp, showSeconds) },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Trend Tegangan & Daya</Text>
      {lastUpdate ? (
        <Text style={styles.subtitle}>Update terakhir: {lastUpdate}</Text>
      ) : null}

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {/* Garis grid horizontal */}
        {yLeftLines.map((line, idx) => (
          <Line
            key={`grid-${idx}`}
            x1={PADDING.left}
            y1={line.y}
            x2={PADDING.left + innerW}
            y2={line.y}
            stroke={Colors.divider}
            strokeWidth={1}
          />
        ))}

        {}
        {yLeftLines.map((line, idx) => (
          <SvgText
            key={`ylbl-left-${idx}`}
            x={PADDING.left - 6}
            y={line.y + 3}
            fontSize={9}
            fill={Colors.primary}
            fontWeight="600"
            textAnchor="end"
          >
            {line.label}
          </SvgText>
        ))}

        {}
        {yRightLabels.map((line, idx) => (
          <SvgText
            key={`ylbl-right-${idx}`}
            x={PADDING.left + innerW + 6}
            y={line.y + 3}
            fontSize={9}
            fill={Colors.accent}
            fontWeight="600"
            textAnchor="start"
          >
            {line.label}
          </SvgText>
        ))}

        {}
        <Path
          d={voltagePath}
          stroke={Colors.primary}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {}
        <Path
          d={powerPath}
          stroke={Colors.accent}
          strokeWidth={2.5}
          fill="none"
          strokeDasharray="4,3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {}
        <Circle
          cx={PADDING.left + innerW}
          cy={PADDING.top + innerH - ((voltages[voltages.length - 1] - vMin) / (vRange || 1)) * innerH}
          r={3.5}
          fill={Colors.primary}
        />

        {}
        <Circle
          cx={PADDING.left + innerW}
          cy={PADDING.top + innerH - ((powers[powers.length - 1] - pMin) / (pRange || 1)) * innerH}
          r={3.5}
          fill={Colors.accent}
        />

        {}
        {xLabels.map((lbl, idx) => (
          <SvgText
            key={`xlbl-${idx}`}
            x={lbl.x}
            y={CHART_HEIGHT - 6}
            fontSize={9}
            fill={Colors.textMuted}
            textAnchor={idx === 0 ? 'start' : idx === xLabels.length - 1 ? 'end' : 'middle'}
          >
            {lbl.label}
          </SvgText>
        ))}
      </Svg>

      {}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Tegangan (V)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: Colors.accent, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.accent }]} />
          <Text style={styles.legendText}>Daya (W)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textLight,
    marginBottom: 10,
  },
  legend: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 14,
    height: 3,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
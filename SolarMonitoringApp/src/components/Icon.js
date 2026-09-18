import React from 'react';
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg';
import Colors from '../constants/Colors';


export default function Icon({ name, size = 22, color = Colors.primary, strokeWidth = 2.2 }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (name) {
    
    case 'bolt': // Tegangan (lightning)
      return (
        <Svg {...props}>
          <Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
        </Svg>
      );

    case 'wave': // Arus (sine wave)
      return (
        <Svg {...props}>
          <Path d="M2 12c2 0 2-4 4-4s2 8 4 8 2-8 4-8 2 4 4 4 2-4 4-4" />
        </Svg>
      );

    case 'activity': // Daya (heartbeat-like pulse)
      return (
        <Svg {...props}>
          <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </Svg>
      );

    case 'trending-up': // Efisiensi
      return (
        <Svg {...props}>
          <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <Polyline points="17 6 23 6 23 12" />
        </Svg>
      );

    case 'sun': // Sumber Energi
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="4" />
          <Line x1="12" y1="2" x2="12" y2="4" />
          <Line x1="12" y1="20" x2="12" y2="22" />
          <Line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
          <Line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
          <Line x1="2" y1="12" x2="4" y2="12" />
          <Line x1="20" y1="12" x2="22" y2="12" />
          <Line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
          <Line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
        </Svg>
      );

    case 'dashboard': // Dashboard tab
      return (
        <Svg {...props}>
          <Rect x="3" y="3" width="7" height="9" rx="1.5" />
          <Rect x="14" y="3" width="7" height="5" rx="1.5" />
          <Rect x="14" y="12" width="7" height="9" rx="1.5" />
          <Rect x="3" y="16" width="7" height="5" rx="1.5" />
        </Svg>
      );

    case 'bar-chart': // Riwayat tab
      return (
        <Svg {...props}>
          <Line x1="18" y1="20" x2="18" y2="10" />
          <Line x1="12" y1="20" x2="12" y2="4" />
          <Line x1="6" y1="20" x2="6" y2="14" />
        </Svg>
      );

    case 'bell': // Notifikasi tab
      return (
        <Svg {...props}>
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
      );
      case 'user': // Profil tab
      return (
        <Svg {...props}>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </Svg>
      );

    case 'check-circle': // Normal
      return (
        <Svg {...props}>
          <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <Polyline points="22 4 12 14.01 9 11.01" />
        </Svg>
      );

    case 'alert-triangle': // Warning
      return (
        <Svg {...props}>
          <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <Line x1="12" y1="9" x2="12" y2="13" />
          <Line x1="12" y1="17" x2="12.01" y2="17" />
        </Svg>
      );

    case 'alert-circle': // Danger
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="10" />
          <Line x1="12" y1="8" x2="12" y2="12" />
          <Line x1="12" y1="16" x2="12.01" y2="16" />
        </Svg>
      );

    case 'info': // Info
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="10" />
          <Line x1="12" y1="16" x2="12" y2="12" />
          <Line x1="12" y1="8" x2="12.01" y2="8" />
        </Svg>
      );

    // CONNECTION
    case 'wifi':
      return (
        <Svg {...props}>
          <Path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <Path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <Line x1="12" y1="20" x2="12.01" y2="20" />
        </Svg>
      );

    case 'wifi-off':
      return (
        <Svg {...props}>
          <Line x1="1" y1="1" x2="23" y2="23" />
          <Path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <Path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <Path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <Path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <Line x1="12" y1="20" x2="12.01" y2="20" />
        </Svg>
      );

    // EMPTY STATE
    case 'inbox':
      return (
        <Svg {...props}>
          <Polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <Path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </Svg>
      );

    default:
      return null;
  }
}
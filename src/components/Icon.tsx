import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

// SVG path data for common icons used in the app
const ICONS: Record<string, string> = {
  'menu': 'M3 6h18M3 12h18M3 18h18',
  'menu-outline': 'M3 6h18M3 12h18M3 18h18',
  'chevron-back': 'M15 18l-6-6 6-6',
  'chevron-forward': 'M9 6l6 6-6 6',
  'close': 'M18 6L6 18M6 6l12 12',
  'add': 'M12 5v14M5 12h14',
  'add-circle': 'M12 2a10 10 0 100 20 10 10 0 000-20zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z',
  'add-circle-outline': 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zm4 7h-3V8h-2v3H8v2h3v3h2v-3h3v-2z',
  'arrow-up': 'M12 4l-7 7h4v8h6v-8h4z',
  'people-outline': 'M16.5 13c1.38 0 2.49-1.12 2.49-2.5S17.88 8 16.5 8 14 9.12 14 10.5s1.12 2.5 2.5 2.5zm-9 0C8.88 13 10 11.88 10 10.5S8.88 8 7.5 8 5 9.12 5 10.5 6.12 13 7.5 13zm0 2C5.33 15 1 16.08 1 18.25V20h13v-1.75C14 16.08 9.67 15 7.5 15zm9 0c-.27 0-.58.02-.91.05 1.16.84 1.91 1.96 1.91 3.2V20h6v-1.75C23 16.08 18.67 15 16.5 15z',
  'share-social-outline': 'M18 8a3 3 0 10-2.42-4.76l-7.17 4.11A2.98 2.98 0 006 6a3 3 0 000 6c.88 0 1.68-.39 2.23-1l7.06 4.05A3 3 0 1018 16c-.88 0-1.68.39-2.23 1l-7.06-4.05A3 3 0 006 12a3 3 0 00-2.42 4.76l7.17-4.11c.55.61 1.35 1 2.23 1a3 3 0 100-6z',
  'camera-outline': 'M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zM9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9z',
  'image-outline': 'M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zM5 19l3.5-4.5 2.5 3L14.5 13l4.5 6H5z',
  'nutrition-outline': 'M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z',
  'flash-outline': 'M7 2v11h3v9l7-12h-4l4-8H7z',
  'flash': 'M7 2v11h3v9l7-12h-4l4-8H7z',
  'ellipsis-vertical': 'M12 8a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4z',
  'create-outline': 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  'flame-outline': 'M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73S7.42 7.53 7.42 5.47c0-2.15.74-4.8.74-4.8S5 3.57 5 8.5C5 13 8.36 16 12 16s7-3 7-7.5c0-4.93-5.5-7.83-5.5-7.83z',
  'calendar-outline': 'M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11z',
  'bookmark-outline': 'M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z',
  'trash-outline': 'M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  'home-outline': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1',
  'flag-outline': 'M5 4h14v8H5V4zm0 8v8',
  'bar-chart-outline': 'M4 20h16M4 20V10m4 10V4m4 16v-8m4 8V8',
  'scale-outline': 'M12 3v18M5 8l7-5 7 5M5 8v5a7 7 0 0014 0V8',
  'alarm-outline': 'M12 6v6l4 2M6.4 2.6L2 6M17.6 2.6L22 6M12 2a10 10 0 100 20 10 10 0 000-20z',
  'water-outline': 'M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z',
  'settings-outline': 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  'log-in-outline': 'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3',
  'gift-outline': 'M20 12v10H4V12M2 7h20v5H2V7zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z',
  'document-text-outline': 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'help-circle-outline': 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-5h2v2h-2v-2zm1-10a3.5 3.5 0 00-3.5 3.5h2A1.5 1.5 0 0112 7a1.5 1.5 0 011.5 1.5c0 1.5-2.5 1.31-2.5 3.5h2c0-1.25 2.5-1.38 2.5-3.5A3.5 3.5 0 0012 5z',
  'leaf': 'M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L6 21c4-4 6-8 11-11-1 4-2 7-4 10h3c1-2 2-5 2-8 1.5 0 3-.5 4-2-2-1-4-1-5 0z',
  'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'diamond-outline': 'M12 2L2 12l10 10 10-10L12 2z',
  'checkmark-circle': 'M12 2a10 10 0 100 20 10 10 0 000-20zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  'sunny-outline': 'M12 7a5 5 0 100 10 5 5 0 000-10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
  'partly-sunny-outline': 'M12.74 5.47A5.5 5.5 0 0117 10h1a4 4 0 010 8H5a3 3 0 110-6c.16 0 .32.01.48.04A5.5 5.5 0 0112.74 5.47z',
  'moon-outline': 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
};

// Simple emoji-based fallback for missing icons
const EMOJI_MAP: Record<string, string> = {
  'menu': '☰',
  'menu-outline': '☰',
  'chevron-back': '‹',
  'chevron-forward': '›',
  'close': '✕',
  'add-circle': '⊕',
  'people-outline': '👥',
  'share-social-outline': '↗',
  'camera-outline': '📷',
  'image-outline': '🖼',
  'nutrition-outline': '🍎',
  'flash-outline': '⚡',
  'flash': '⚡',
  'ellipsis-vertical': '⋮',
  'create-outline': '✏',
  'trash-outline': '🗑',
  'home-outline': '🏠',
  'settings-outline': '⚙',
  'water-outline': '💧',
  'alarm-outline': '⏰',
  'star': '★',
  'leaf': '🌿',
  'arrow-up': '↑',
  'checkmark-circle': '✓',
};

export function Icon({ name, size = 24, color = colors.text.primary }: IconProps) {
  const svgPath = ICONS[name];

  if (Platform.OS === 'web' && !svgPath) {
    // Emoji fallback for web
    const emoji = EMOJI_MAP[name] || '•';
    return (
      <Text style={{ fontSize: size * 0.75, lineHeight: size, textAlign: 'center', width: size, height: size }}>
        {emoji}
      </Text>
    );
  }

  if (Platform.OS !== 'web') {
    // On native, use Ionicons directly
    const Ionicons = require('@expo/vector-icons').Ionicons;
    return <Ionicons name={name} size={size} color={color} />;
  }

  // Web: render inline SVG via dangerouslySetInnerHTML
  const isStroke = name.includes('outline') || ['menu', 'chevron-back', 'chevron-forward', 'close', 'add', 'bar-chart-outline', 'home-outline', 'flag-outline'].includes(name);

  const svgHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${isStroke ? 'none' : color}" stroke="${isStroke ? color : 'none'}" stroke-width="${isStroke ? 2 : 0}" stroke-linecap="round" stroke-linejoin="round"><path d="${svgPath}"/></svg>`;

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      // @ts-ignore - web only
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}

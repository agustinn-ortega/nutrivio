import React from 'react';
import { Platform, Text, View } from 'react-native';

interface PlatformIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

// On native: use Ionicons font (works perfectly)
// On web: use text emoji/symbol fallback (font icons don't load reliably)

const SYMBOL_MAP: Record<string, string> = {
  'menu-outline': '☰',  'menu': '☰',
  'chevron-back': '‹',  'chevron-forward': '›',
  'close': '✕', 'close-outline': '✕',
  'add': '+', 'add-circle': '⊕', 'add-circle-outline': '⊕',
  'arrow-up': '↑', 'arrow-back': '←',
  'people-outline': '👥', 'people': '👥',
  'share-social-outline': '⤴', 'share-outline': '⤴',
  'camera-outline': '📷', 'camera': '📷',
  'image-outline': '🖼️', 'image': '🖼️',
  'nutrition-outline': '🍎', 'nutrition': '🍎',
  'flash-outline': '⚡', 'flash': '⚡',
  'ellipsis-vertical': '⋮', 'ellipsis-horizontal': '⋯',
  'create-outline': '✎', 'create': '✎',
  'trash-outline': '🗑', 'trash': '🗑',
  'home-outline': '🏠', 'home': '🏠',
  'settings-outline': '⚙', 'settings': '⚙',
  'water-outline': '💧', 'water': '💧',
  'alarm-outline': '⏰', 'alarm': '⏰',
  'star': '⭐', 'star-outline': '☆',
  'leaf': '🌿', 'leaf-outline': '🌿',
  'diamond-outline': '💎', 'diamond': '💎',
  'checkmark-circle': '✅', 'checkmark-circle-outline': '✅', 'checkmark': '✓',
  'sunny-outline': '☀️', 'sunny': '☀️',
  'partly-sunny-outline': '⛅', 'partly-sunny': '⛅',
  'moon-outline': '🌙', 'moon': '🌙',
  'flag-outline': '🚩', 'flag': '🚩',
  'bar-chart-outline': '📊', 'bar-chart': '📊',
  'scale-outline': '⚖️', 'scale': '⚖️',
  'log-in-outline': '→', 'log-in': '→',
  'gift-outline': '🎁', 'gift': '🎁',
  'document-text-outline': '📄', 'document-text': '📄',
  'help-circle-outline': '❓', 'help-circle': '❓',
  'heart-outline': '♡', 'heart': '♥',
  'bookmark-outline': '🔖', 'bookmark': '🔖',
  'calendar-outline': '📅', 'calendar': '📅',
  'flame-outline': '🔥', 'flame': '🔥',
  'pencil': '✏️', 'pencil-outline': '✏️',
  'refresh-outline': '↻', 'refresh': '↻',
  'key-outline': '🔑', 'key': '🔑',
  'notifications-outline': '🔔', 'notifications': '🔔',
  'information-circle-outline': 'ℹ️', 'information-circle': 'ℹ️',
};

function WebIcon({ name, size = 24, color, style }: PlatformIconProps) {
  const symbol = SYMBOL_MAP[name] || '•';
  return (
    <Text
      style={[
        {
          fontSize: size * 0.7,
          lineHeight: size,
          width: size,
          height: size,
          textAlign: 'center',
          color: color,
        },
        style,
      ]}
      selectable={false}
    >
      {symbol}
    </Text>
  );
}

export function PlatformIonicons(props: PlatformIconProps) {
  if (Platform.OS === 'web') {
    return <WebIcon {...props} />;
  }
  const { Ionicons } = require('@expo/vector-icons');
  return <Ionicons {...props} />;
}

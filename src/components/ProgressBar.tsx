import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  color = colors.accent.primary,
  height = 4,
  backgroundColor = colors.surface.elevated,
}: ProgressBarProps) {
  return (
    <View style={[styles.track, { height, backgroundColor, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            backgroundColor: color,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

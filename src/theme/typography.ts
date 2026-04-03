import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  hero: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
    fontFamily,
  } as TextStyle,
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.3,
    fontFamily,
  } as TextStyle,
  h2: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.2,
    fontFamily,
  } as TextStyle,
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    fontFamily,
  } as TextStyle,
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    fontFamily,
  } as TextStyle,
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    fontFamily,
  } as TextStyle,
  bodySemibold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    fontFamily,
  } as TextStyle,
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    fontFamily,
  } as TextStyle,
  captionMedium: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    fontFamily,
  } as TextStyle,
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    fontFamily,
  } as TextStyle,
  smallMedium: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    fontFamily,
  } as TextStyle,
  number: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.5,
    fontFamily,
  } as TextStyle,
  numberSmall: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: -0.3,
    fontFamily,
  } as TextStyle,
  label: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontFamily,
  } as TextStyle,
} as const;

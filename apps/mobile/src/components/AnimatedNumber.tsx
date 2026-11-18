// src/components/AnimatedNumber.tsx
import React, { useEffect } from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text } from 'react-native';

// We use a JS-driven approach since animating text is tricky with reanimated
// This creates a smooth count-up using setInterval

// Utility function to format large numbers compactly (e.g. 500, 1.2k, 25k, 1.5M, 2.3B)
export function formatCompactNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (!n || isNaN(n) || n === 0) return '0';
  if (n < 1000) return n.toString();
  if (n < 10000) {
    const k = (n / 1000).toFixed(1);
    return k.endsWith('.0') ? `${parseInt(k, 10)}k` : `${k}k`;
  }
  if (n < 1000000) {
    return `${Math.floor(n / 1000)}k`;
  }
  if (n < 1000000000) {
    const m = (n / 1000000).toFixed(1);
    return m.endsWith('.0') ? `${parseInt(m, 10)}M` : `${m}M`;
  }
  const b = (n / 1000000000).toFixed(1);
  return b.endsWith('.0') ? `${parseInt(b, 10)}B` : `${b}B`;
}

type Props = {
  value: number;
  duration?: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
  formatter?: (n: number) => string;
};

export default function AnimatedNumber({
  value,
  duration = 1200,
  style,
  prefix = '',
  suffix = '',
  formatter,
}: Props) {
  const [displayed, setDisplayed] = React.useState(0);
  const startRef = React.useRef(0);
  const rafRef = React.useRef<any>(null);
  const startTimeRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (value === 0) {
      setDisplayed(0);
      return;
    }

    const start = displayed;
    const end = value;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayed(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  const display = formatter ? formatter(displayed) : displayed.toLocaleString();

  return <Text style={style}>{prefix}{display}{suffix}</Text>;
}

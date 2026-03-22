import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');
export const HS_KEY = 'tunnel_highscore_v3';

export default function MenuScreen() {
  const [highScore, setHighScore] = useState(0);
  const titleY    = useRef(new Animated.Value(-40)).current;
  const titleOp   = useRef(new Animated.Value(0)).current;
  const cardOp    = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.getItem(HS_KEY).then(v => v && setHighScore(Number(v)));

    Animated.sequence([
      Animated.parallel([
        Animated.spring(titleY,  { toValue: 0, useNativeDriver: true, damping: 14 }),
        Animated.timing(titleOp, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(cardOp, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.97, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={s.root}>
      <Animated.View style={[s.titleBlock, { opacity: titleOp, transform: [{ translateY: titleY }] }]}>
        <Text style={s.pre}>◈ INFINITE DEPTH ◈</Text>
        <Text style={s.title1}>TUNNEL</Text>
        <Text style={s.title2}>RUNNER 3D</Text>
        <View style={s.titleLine} />
      </Animated.View>

      <Animated.View style={[s.card, { opacity: cardOp }]}>
        <Text style={s.sectionLabel}>HOW TO PLAY</Text>
        <View style={s.infoList}>
          <InfoRow icon="↕" text="Tilt your phone to steer through the gap in each ring" />
          <InfoRow icon="❤️" text="3 lives — brief invincibility after each hit" />
          <InfoRow icon="⚡" text="Speed ramps as your score climbs through 6 levels" />
          <InfoRow icon="📳" text="Wall proximity triggers light vibration; collisions shake hard" />
        </View>

        {highScore > 0 && (
          <View style={s.hsRow}>
            <Text style={s.hsLabel}>BEST</Text>
            <Text style={s.hsValue}>{String(highScore).padStart(6, '0')}</Text>
          </View>
        )}

        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
          <TouchableOpacity style={s.btnPrimary} onPress={() => router.push('/game')} activeOpacity={0.75}>
            <Text style={s.btnPrimaryText}>▶  LAUNCH</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={s.btnSecondary} onPress={() => router.push('/settings')} activeOpacity={0.75}>
          <Text style={s.btnSecondaryText}>⚙  SETTINGS</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={s.footer}>TILT TO STEER  •  SURVIVE  •  SET THE RECORD</Text>
    </View>
  );
}

const InfoRow = ({ icon, text }: { icon: string; text: string }) => (
  <View style={s.infoRow}>
    <Text style={s.infoIcon}>{icon}</Text>
    <Text style={s.infoText}>{text}</Text>
  </View>
);

const s = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: '#000011',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
  },
  titleBlock: { alignItems: 'center', marginBottom: 32 },
  pre: { color: '#334455', fontSize: 9, letterSpacing: 5, marginBottom: 6 },
  title1: {
    color: '#fff', fontSize: 64, fontWeight: '900', letterSpacing: 10, lineHeight: 64,
    textShadowColor: '#00ffff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 28,
  },
  title2: {
    color: '#00ffff', fontSize: 16, fontWeight: '700', letterSpacing: 11, marginTop: 2,
    textShadowColor: '#00ffff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14,
  },
  titleLine: { width: 80, height: 1, backgroundColor: 'rgba(0,255,255,0.3)', marginTop: 16 },
  card: {
    width: '100%', maxWidth: 440,
    backgroundColor: 'rgba(0,6,30,0.92)',
    borderWidth: 1, borderColor: 'rgba(0,255,255,0.14)', borderRadius: 4,
    padding: 24, alignItems: 'center', gap: 12,
  },
  sectionLabel: { color: '#334455', fontSize: 9, fontWeight: '700', letterSpacing: 4, alignSelf: 'flex-start', marginBottom: 4 },
  infoList: { width: '100%', gap: 8, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoIcon: { color: '#00ffff', fontSize: 14, width: 20, textAlign: 'center', marginTop: 1 },
  infoText: { color: '#778899', fontSize: 13, flex: 1, lineHeight: 19 },
  hsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 4 },
  hsLabel: { color: '#334455', fontSize: 10, letterSpacing: 4, fontWeight: '700' },
  hsValue: {
    color: '#ffaa00', fontSize: 22, fontWeight: '900', letterSpacing: 3,
    textShadowColor: '#ffaa00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12,
  },
  btnPrimary: {
    width: '100%', paddingVertical: 16, borderWidth: 1.5,
    borderColor: '#00ffff', borderRadius: 3, alignItems: 'center',
    backgroundColor: 'rgba(0,255,255,0.07)',
  },
  btnPrimaryText: {
    color: '#00ffff', fontSize: 15, fontWeight: '900', letterSpacing: 6,
    textShadowColor: '#00ffff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  btnSecondary: {
    width: '100%', paddingVertical: 13, borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)', borderRadius: 3, alignItems: 'center',
  },
  btnSecondaryText: { color: '#445566', fontSize: 12, fontWeight: '700', letterSpacing: 5 },
  footer: { marginTop: 24, color: '#1a2233', fontSize: 9, letterSpacing: 3 },
});
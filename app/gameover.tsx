import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HS_KEY } from './index';

const { width: SW } = Dimensions.get('window');
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function GameOverScreen() {
  const { score: raw } = useLocalSearchParams<{ score: string }>();
  const score = Number(raw ?? 0);

  const [highScore, setHighScore] = useState(0);
  const [isNewHigh, setIsNewHigh] = useState(false);

  const titleScale  = useRef(new Animated.Value(0.6)).current;
  const titleOp     = useRef(new Animated.Value(0)).current;
  const scoreY      = useRef(new Animated.Value(30)).current;
  const scoreOp     = useRef(new Animated.Value(0)).current;
  const btnsOp      = useRef(new Animated.Value(0)).current;
  const badgeScale  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(HS_KEY).then(async stored => {
      const prev = Number(stored ?? 0);
      const isNew = score > prev;
      setIsNewHigh(isNew);
      const nh = Math.max(prev, score);
      setHighScore(nh);
      if (isNew) await AsyncStorage.setItem(HS_KEY, String(nh));
      if (isNew && score > 0)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    });

    Animated.sequence([
      Animated.parallel([
        Animated.spring(titleScale, { toValue: 1, useNativeDriver: true, damping: 12 }),
        Animated.timing(titleOp,   { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(scoreY,  { toValue: 0, useNativeDriver: true, damping: 14 }),
        Animated.timing(scoreOp, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.timing(btnsOp, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true, damping: 10, velocity: 4 }).start();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getGrade = () => {
    if (score >= 5000) return { label: 'S', color: '#ffcc00' };
    if (score >= 2500) return { label: 'A', color: '#00ffcc' };
    if (score >= 1000) return { label: 'B', color: '#4499ff' };
    if (score >= 400)  return { label: 'C', color: '#aa88ff' };
    return { label: 'D', color: '#445566' };
  };
  const grade = getGrade();

  return (
    <View style={s.root}>
      <View style={s.inner}>
        <Animated.View style={{ transform: [{ scale: titleScale }], opacity: titleOp, alignItems: 'center' }}>
          <Text style={s.gameOver}>GAME OVER</Text>
          <View style={s.bar} />
        </Animated.View>

        <Animated.View style={[s.scoreBlock, { opacity: scoreOp, transform: [{ translateY: scoreY }] }]}>
          <View style={[s.gradeBadge, { borderColor: grade.color }]}>
            <Text style={[s.gradeText, { color: grade.color }]}>{grade.label}</Text>
          </View>
          <Text style={s.scoreLbl}>FINAL SCORE</Text>
          <Text style={s.scoreVal}>{String(score).padStart(6,'0')}</Text>
          <View style={s.pbRow}>
            <Text style={s.pbLabel}>PERSONAL BEST</Text>
            <Text style={s.pbValue}>{String(highScore).padStart(6,'0')}</Text>
          </View>
          {isNewHigh && score > 0 && (
            <Animated.View style={[s.newHighBadge, { transform: [{ scale: badgeScale }] }]}>
              <Text style={s.newHighText}>🏆  NEW HIGH SCORE</Text>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View style={[s.statsRow, { opacity: btnsOp }]}>
          <StatBox label="DISTANCE"  value={`${(score / 9).toFixed(0)}m`} />
          <StatBox label="SPEED LV"  value={`${clamp(1 + Math.floor(score / 180), 1, 6)}/6`} />
        </Animated.View>

        <Animated.View style={[s.btns, { opacity: btnsOp }]}>
          <TouchableOpacity style={s.btnPrimary}   onPress={() => router.replace('/game')} activeOpacity={0.75}>
            <Text style={s.btnPrimaryText}>▶  PLAY AGAIN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => router.replace('/')} activeOpacity={0.75}>
            <Text style={s.btnSecondaryText}>MAIN MENU</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const StatBox = ({ label, value }: { label: string; value: string }) => (
  <View style={s.statBox}>
    <Text style={s.statVal}>{value}</Text>
    <Text style={s.statLbl}>{label}</Text>
  </View>
);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000011', alignItems: 'center', justifyContent: 'center' },
  inner: { width: SW * 0.88, maxWidth: 440, alignItems: 'center', gap: 22, paddingVertical: Platform.OS === 'ios' ? 48 : 32 },
  gameOver: {
    color: '#ff2244', fontSize: 42, fontWeight: '900', letterSpacing: 6,
    textShadowColor: '#ff2244', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 28,
  },
  bar: { width: 60, height: 1.5, backgroundColor: 'rgba(255,34,68,0.4)', marginTop: 10 },
  scoreBlock: {
    width: '100%', backgroundColor: 'rgba(0,6,30,0.92)',
    borderWidth: 1, borderColor: 'rgba(255,34,68,0.15)',
    borderRadius: 4, padding: 24, alignItems: 'center', gap: 6,
  },
  gradeBadge: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  gradeText: { fontSize: 26, fontWeight: '900' },
  scoreLbl: { color: '#445566', fontSize: 9, fontWeight: '700', letterSpacing: 4 },
  scoreVal: {
    color: '#fff', fontSize: 58, fontWeight: '900', letterSpacing: 4,
    textShadowColor: '#00ffff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16, marginBottom: 4,
  },
  pbRow: {
    flexDirection: 'row', alignItems: 'baseline', gap: 10,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,255,255,0.08)',
    width: '100%', justifyContent: 'center',
  },
  pbLabel: { color: '#334455', fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  pbValue: { color: '#ffaa00', fontSize: 20, fontWeight: '900', letterSpacing: 3 },
  newHighBadge: {
    marginTop: 8, backgroundColor: 'rgba(255,204,0,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,204,0,0.4)',
    borderRadius: 3, paddingVertical: 8, paddingHorizontal: 18,
  },
  newHighText: { color: '#ffcc00', fontSize: 12, fontWeight: '900', letterSpacing: 3 },
  statsRow: { flexDirection: 'row', width: '100%', gap: 12 },
  statBox: {
    flex: 1, backgroundColor: 'rgba(0,6,30,0.9)',
    borderWidth: 1, borderColor: 'rgba(0,255,255,0.1)',
    borderRadius: 4, padding: 14, alignItems: 'center',
  },
  statVal: { color: '#00ffff', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  statLbl: { color: '#445566', fontSize: 8, letterSpacing: 3, marginTop: 4, fontWeight: '700' },
  btns: { width: '100%', gap: 10 },
  btnPrimary: {
    width: '100%', paddingVertical: 16, borderWidth: 1.5,
    borderColor: '#00ffff', borderRadius: 3, alignItems: 'center',
    backgroundColor: 'rgba(0,255,255,0.07)',
  },
  btnPrimaryText: {
    color: '#00ffff', fontSize: 14, fontWeight: '900', letterSpacing: 5,
    textShadowColor: '#00ffff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  btnSecondary: {
    width: '100%', paddingVertical: 13, borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)', borderRadius: 3, alignItems: 'center',
  },
  btnSecondaryText: { color: '#445566', fontSize: 12, fontWeight: '700', letterSpacing: 5 },
});
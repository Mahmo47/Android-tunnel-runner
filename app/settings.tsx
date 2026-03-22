import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform, ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HS_KEY } from './index';

export const SETTINGS_KEY = 'tunnel_settings_v3';

export type GameSettings = {
  gyroSensitivity: number;
  hapticsEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
};

export const DEFAULT_SETTINGS: GameSettings = {
  gyroSensitivity: 0.11,
  hapticsEnabled: true,
  difficulty: 'normal',
};

const SENS_STEPS = [
  { label: 'LOW',    value: 0.06 },
  { label: 'NORMAL', value: 0.11 },
  { label: 'HIGH',   value: 0.17 },
  { label: 'MAX',    value: 0.22 },
];

const DIFF_STEPS: { label: string; value: GameSettings['difficulty']; desc: string }[] = [
  { label: 'EASY',   value: 'easy',   desc: 'Wider gaps, slower max speed' },
  { label: 'NORMAL', value: 'normal', desc: 'Balanced — recommended' },
  { label: 'HARD',   value: 'hard',   desc: 'Narrow gaps, higher top speed' },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then(v => {
      if (v) {
        const parsed = JSON.parse(v);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          hapticsEnabled: parsed.hapticsEnabled === true || parsed.hapticsEnabled === 'true',
          gyroSensitivity: Number(parsed.gyroSensitivity ?? DEFAULT_SETTINGS.gyroSensitivity),
        });
      }
    });
  }, []);

  const save = async (updated: GameSettings) => {
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  const setSens = (value: number) => {
    if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
    save({ ...settings, gyroSensitivity: value });
  };

  const toggleHaptics = (v: boolean) => {
    if (v) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    save({ ...settings, hapticsEnabled: v });
  };

  const setDiff = (d: GameSettings['difficulty']) => {
    if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
    save({ ...settings, difficulty: d });
  };

  const resetAll = async () => {
    await AsyncStorage.multiRemove([SETTINGS_KEY, HS_KEY]);
    save(DEFAULT_SETTINGS);
    if (settings.hapticsEnabled)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={s.heading}>SETTINGS</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Section title="GYROSCOPE SENSITIVITY" subtitle="How strongly tilting moves the player">
          <View style={s.segRow}>
            {SENS_STEPS.map(step => (
              <TouchableOpacity
                key={step.value}
                style={[s.seg, settings.gyroSensitivity === step.value && s.segActive]}
                onPress={() => setSens(step.value)}
                activeOpacity={0.75}
              >
                <Text style={[s.segText, settings.gyroSensitivity === step.value && s.segTextActive]}>
                  {step.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <Section title="DIFFICULTY" subtitle="Affects gap width and maximum speed">
          {DIFF_STEPS.map(d => (
            <TouchableOpacity
              key={d.value}
              style={[s.diffRow, settings.difficulty === d.value && s.diffRowActive]}
              onPress={() => setDiff(d.value)}
              activeOpacity={0.75}
            >
              <View style={s.diffDot}>
                {settings.difficulty === d.value && <View style={s.diffDotFill} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.diffLabel, settings.difficulty === d.value && s.diffLabelActive]}>
                  {d.label}
                </Text>
                <Text style={s.diffDesc}>{d.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Section>

        <Section title="HAPTIC FEEDBACK" subtitle="Vibration on collisions and wall proximity">
          <View style={s.switchRow}>
            <View>
              <Text style={s.switchLabel}>Vibration</Text>
              <Text style={s.switchDesc}>
                {settings.hapticsEnabled ? 'Impact + wall warnings ON' : 'All vibration OFF'}
              </Text>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={toggleHaptics}
              trackColor={{ false: '#1a1a2e', true: 'rgba(0,255,255,0.4)' }}
              thumbColor={settings.hapticsEnabled ? '#00ffff' : '#334455'}
            />
          </View>
        </Section>

        <Section title="DANGER ZONE" subtitle="Irreversible actions">
          <TouchableOpacity style={s.resetBtn} onPress={resetAll} activeOpacity={0.75}>
            <Text style={s.resetText}>RESET ALL DATA</Text>
          </TouchableOpacity>
          <Text style={s.resetCaption}>Clears high score and restores all defaults</Text>
        </Section>
      </ScrollView>
    </View>
  );
}

const Section = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>{title}</Text>
    <Text style={s.sectionSub}>{subtitle}</Text>
    <View style={s.sectionBody}>{children}</View>
  </View>
);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000011' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,255,255,0.08)',
  },
  backBtn: { paddingVertical: 6, paddingRight: 12 },
  backText: { color: '#00ffff', fontSize: 11, fontWeight: '700', letterSpacing: 3 },
  heading: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 6 },
  scroll: { padding: 20, gap: 20, paddingBottom: 48 },
  section: {
    backgroundColor: 'rgba(0,6,30,0.9)',
    borderWidth: 1, borderColor: 'rgba(0,255,255,0.1)',
    borderRadius: 4, padding: 18,
  },
  sectionTitle: { color: '#00ffff', fontSize: 10, fontWeight: '900', letterSpacing: 4, marginBottom: 3 },
  sectionSub: { color: '#445566', fontSize: 11, marginBottom: 16 },
  sectionBody: { gap: 10 },
  segRow: { flexDirection: 'row', gap: 8 },
  seg: {
    flex: 1, paddingVertical: 10, borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.18)', borderRadius: 3, alignItems: 'center',
  },
  segActive: { borderColor: '#00ffff', backgroundColor: 'rgba(0,255,255,0.1)' },
  segText: { color: '#445566', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  segTextActive: { color: '#00ffff' },
  diffRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: 'transparent', borderRadius: 3,
  },
  diffRowActive: { borderColor: 'rgba(0,255,255,0.2)', backgroundColor: 'rgba(0,255,255,0.05)' },
  diffDot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#334455',
    alignItems: 'center', justifyContent: 'center',
  },
  diffDotFill: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00ffff' },
  diffLabel: { color: '#445566', fontSize: 12, fontWeight: '700', letterSpacing: 3 },
  diffLabelActive: { color: '#00ffff' },
  diffDesc: { color: '#334455', fontSize: 11, marginTop: 2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { color: '#aabbcc', fontSize: 13, fontWeight: '600' },
  switchDesc: { color: '#445566', fontSize: 11, marginTop: 2 },
  resetBtn: {
    borderWidth: 1, borderColor: 'rgba(255,34,68,0.4)',
    borderRadius: 3, paddingVertical: 12, alignItems: 'center',
  },
  resetText: { color: '#ff2244', fontSize: 11, fontWeight: '900', letterSpacing: 4 },
  resetCaption: { color: '#334455', fontSize: 10, textAlign: 'center', marginTop: 6 },
});
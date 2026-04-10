import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';

// Build info será generado durante el build
let buildInfo: { commitHash?: string; buildDate?: string } = {};
try {
  buildInfo = require('../../build-info.json');
} catch {
  // Fallback si no existe build-info.json
  buildInfo = {
    commitHash: 'dev',
    buildDate: new Date().toISOString(),
  };
}

export default function AppFooter() {
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const commitHash = buildInfo.commitHash?.substring(0, 7) || 'dev';
  const buildDate = buildInfo.buildDate
    ? new Date(buildInfo.buildDate).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Conequus v{appVersion} • Build {commitHash}
        {buildDate && ` • ${buildDate}`}
      </Text>
      <Text style={styles.footerSubtext}>
        {Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
  },
  footerText: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#C7C7CC',
    textAlign: 'center',
    marginTop: 2,
  },
});

import { Text, useColorScheme, StyleSheet, View, ScrollView, Linking, TouchableOpacity } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import HeaderSection from '@/components/features/header';

const AboutScreen = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title="About Us" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Ionicons name="school" size={80} color={colors.primary} />
          <Text style={[styles.appName, { color: colors.textPrimary }]}>Your App Name</Text>
          <Text style={[styles.version, { color: colors.subText }]}>Version 1.0.0</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Our Mission</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            To provide quality education and resources to students, helping them achieve their academic goals through innovative technology and dedicated support.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Our Story</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Founded in 2024, we started with a simple idea: make education accessible to everyone. Today, we're proud to serve thousands of students across the country.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Our Values</Text>
          <View style={styles.valueItem}>
            <Ionicons name="star" size={20} color={colors.primary} />
            <Text style={[styles.valueText, { color: colors.textSecondary }]}> Excellence in Education</Text>
          </View>
          <View style={styles.valueItem}>
            <Ionicons name="people" size={20} color={colors.secondary} />
            <Text style={[styles.valueText, { color: colors.textSecondary }]}> Student-Centric Approach</Text>
          </View>
          <View style={styles.valueItem}>
            <Ionicons name="bulb" size={20} color={colors.tertiary} />
            <Text style={[styles.valueText, { color: colors.textSecondary }]}> Innovation & Technology</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Contact Information</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:info@yourapp.com')}>
            <Text style={[styles.linkText, { color: colors.primary }]}>info@yourapp.com</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('tel:+1234567890')}>
            <Text style={[styles.linkText, { color: colors.primary }]}>+1 234 567 890</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  version: {
    fontSize: 14,
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  valueText: {
    fontSize: 14,
    marginLeft: 10,
  },
  linkText: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default AboutScreen;
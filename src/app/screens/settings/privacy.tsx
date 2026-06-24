import { Text, useColorScheme, StyleSheet, View, ScrollView } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';

const PrivacyPolicyScreen = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title="Privacy Policy" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.lastUpdatedContainer, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Effective Date: January 1, 2024</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Information We Collect</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We collect information you provide directly to us, such as when you create an account, enroll in courses, or contact support. This may include:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>• Name and contact information</Text>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>• Payment information (processed securely)</Text>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>• Course progress and preferences</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>How We Use Your Information</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>• Provide and maintain our services</Text>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>• Process your transactions</Text>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>• Improve and personalize your experience</Text>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>• Send important updates and notifications</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Data Security</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Third-Party Services</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We may use third-party services for payment processing, analytics, and notifications. These services have their own privacy policies and data handling practices.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Rights</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            You have the right to access, correct, or delete your personal information. You may also opt-out of marketing communications at any time.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Children's Privacy</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Changes to This Policy</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </Text>
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
  lastUpdatedContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 5,
  },
  bulletPoint: {
    marginLeft: 10,
    marginTop: 5,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 3,
  },
});

export default PrivacyPolicyScreen;
import { Text, useColorScheme, StyleSheet, View, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';

const TermsScreen = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title="Terms & Conditions" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.lastUpdatedContainer, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last Updated: January 1, 2024</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            By accessing or using our application, you agree to be bound by these Terms & Conditions. If you disagree with any part of the terms, you may not access the service.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. User Accounts</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            You must be at least 13 years old to use this application. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>3. Content Usage</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            All educational content, materials, and resources provided are for personal, non-commercial use only. You may not distribute, modify, or reproduce any content without prior written consent.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>4. User Conduct</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            You agree not to: (a) use the service for any illegal purpose; (b) interfere with or disrupt the service; (c) attempt to gain unauthorized access to any part of the service; (d) harass or intimidate other users.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>5. Payments and Refunds</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Course fees, payment terms, and refund policies are outlined at the time of purchase. All payments are processed securely through third-party payment processors.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>6. Limitation of Liability</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>7. Changes to Terms</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the application.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>8. Contact Us</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            If you have any questions about these Terms, please contact us at legal@yourapp.com
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
  },
});

export default TermsScreen;
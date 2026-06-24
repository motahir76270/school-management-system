import { Text, useColorScheme, StyleSheet, View, ScrollView, TextInput, TouchableOpacity, Alert, Linking } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import HeaderSection from '@/components/features/header';

const SupportScreen = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    Alert.alert('Success', 'Your message has been sent. We will get back to you soon!');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title="Support" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.welcomeSection, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>How can we help you?</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We're here to assist you. Fill out the form below or use our contact options.
          </Text>
        </View>

        <View style={styles.contactOptions}>
          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: colors.backgroundElement }]}
            onPress={() => Linking.openURL('mailto:support@yourapp.com')}
          >
            <Ionicons name="mail" size={30} color={colors.primary} />
            <View style={styles.contactCardContent}>
              <Text style={[styles.contactCardTitle, { color: colors.textPrimary }]}>Email Us</Text>
              <Text style={[styles.contactCardText, { color: colors.textSecondary }]}>support@yourapp.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: colors.backgroundElement }]}
            onPress={() => Linking.openURL('tel:+1234567890')}
          >
            <Ionicons name="call" size={30} color={colors.secondary} />
            <View style={styles.contactCardContent}>
              <Text style={[styles.contactCardTitle, { color: colors.textPrimary }]}>Call Us</Text>
              <Text style={[styles.contactCardText, { color: colors.textSecondary }]}>+1 234 567 890</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: colors.backgroundElement }]}
            onPress={() => Linking.openURL('https://wa.me/1234567890')}
          >
            <Ionicons name="logo-whatsapp" size={30} color={colors.tertiary} />
            <View style={styles.contactCardContent}>
              <Text style={[styles.contactCardTitle, { color: colors.textPrimary }]}>WhatsApp</Text>
              <Text style={[styles.contactCardText, { color: colors.textSecondary }]}>Chat with us</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.formSection, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Send us a message</Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Your Name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Your Email"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Your Message"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={5}
            value={message}
            onChangeText={setMessage}
          />
          
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.faqSection, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Frequently Asked Questions</Text>
          
          <View style={[styles.faqItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>How do I reset my password?</Text>
            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>Go to Login screen and click "Forgot Password" to receive reset instructions.</Text>
          </View>
          
          <View style={[styles.faqItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>How can I access my courses?</Text>
            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>After login, click on "My Courses" from the dashboard to access all enrolled courses.</Text>
          </View>
          
          <View style={[styles.faqItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>What is your refund policy?</Text>
            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>Please refer to our Terms & Conditions for detailed refund policy information.</Text>
          </View>
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
  welcomeSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  contactOptions: {
    marginBottom: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  contactCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactCardText: {
    fontSize: 12,
  },
  formSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  faqSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  faqItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SupportScreen;
import { Text, useColorScheme, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, FlatList, Linking } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import HeaderSection from '@/components/features/header';

const HelpCenterScreen = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: 'apps-outline' },
    { id: 'account', name: 'Account', icon: 'person-outline' },
    { id: 'payment', name: 'Payment', icon: 'card-outline' },
    { id: 'course', name: 'Courses', icon: 'book-outline' },
    { id: 'technical', name: 'Technical', icon: 'construct-outline' },
  ];

  const faqs = [
    {
      id: '1',
      category: 'account',
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button on the login screen. Fill in your details including name, email, and password. You will receive a verification email to activate your account.',
      expanded: false,
    },
    {
      id: '2',
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Go to the login screen and click "Forgot Password". Enter your registered email address and we will send you a password reset link. Follow the instructions in the email to set a new password.',
      expanded: false,
    },
    {
      id: '3',
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including credit/debit cards (Visa, MasterCard, American Express), PayPal, Google Pay, and Apple Pay. All payments are processed securely.',
      expanded: false,
    },
    {
      id: '4',
      category: 'payment',
      question: 'What is your refund policy?',
      answer: 'We offer a 30-day money-back guarantee for all courses. If you are not satisfied, you can request a refund within 30 days of purchase. Please contact our support team for assistance.',
      expanded: false,
    },
    {
      id: '5',
      category: 'course',
      question: 'How do I access my purchased courses?',
      answer: 'After purchasing, go to "My Courses" from the dashboard. All your enrolled courses will be listed there. Click on any course to start learning.',
      expanded: false,
    },
    {
      id: '6',
      category: 'course',
      question: 'Can I download course materials?',
      answer: 'Yes, you can download course materials including PDFs and resources. Videos can be streamed online, and some courses offer offline viewing through our mobile app.',
      expanded: false,
    },
    {
      id: '7',
      category: 'technical',
      question: 'The app is crashing. What should I do?',
      answer: 'Try these steps: 1) Clear app cache, 2) Update to the latest version, 3) Restart your device, 4) Reinstall the app. If the issue persists, contact our support team.',
      expanded: false,
    },
    {
      id: '8',
      category: 'technical',
      question: 'How do I update my profile information?',
      answer: 'Go to "Profile" section from the main menu. Tap on "Edit Profile" to update your name, profile picture, contact information, and other personal details.',
      expanded: false,
    },
    {
      id: '9',
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'To delete your account, go to Settings > Account > Delete Account. Please note that this action is irreversible and all your data will be permanently removed.',
      expanded: false,
    },
    {
      id: '10',
      category: 'payment',
      question: 'How do I get an invoice?',
      answer: 'After purchase, you can download your invoice from "My Orders" section. An invoice is also sent to your registered email address.',
      expanded: false,
    },
  ];

  const [faqList, setFaqList] = useState(faqs);

  const toggleExpand = (id: string) => {
    setFaqList(faqList.map(faq => 
      faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
    ));
  };

  const getFilteredFaqs = () => {
    let filtered = faqList;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const renderFaqItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.faqItem, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
      onPress={() => toggleExpand(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <View style={styles.faqQuestionContainer}>
          <Ionicons 
            name={item.expanded ? "remove-circle-outline" : "add-circle-outline"} 
            size={24} 
            color={colors.primary} 
          />
          <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>{item.question}</Text>
        </View>
        <Ionicons 
          name={item.expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colors.textSecondary} 
        />
      </View>
      
      {item.expanded && (
        <View style={styles.faqAnswerContainer}>
          <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{item.answer}</Text>
          <TouchableOpacity 
            style={styles.helpfulButton}
            onPress={() => {
              // Handle helpful feedback
              alert('Thank you for your feedback!');
            }}
          >
            <Text style={[styles.helpfulText, { color: colors.primary }]}>Was this helpful?</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const QuickHelpCard = ({ icon, title, description, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.quickHelpCard, { backgroundColor: colors.backgroundElement }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={32} color={colors.primary} />
      <Text style={[styles.quickHelpTitle, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.quickHelpDescription, { color: colors.textSecondary }]}>{description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title="Help Center" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search for help..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Quick Help Cards */}
        <View style={styles.quickHelpSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Help</Text>
          <View style={styles.quickHelpGrid}>
            <QuickHelpCard
              icon="chatbubbles-outline"
              title="Live Chat"
              description="Chat with our support team"
              onPress={() => Linking.openURL('https://wa.me/1234567890')}
            />
            <QuickHelpCard
              icon="mail-outline"
              title="Email Support"
              description="support@yourapp.com"
              onPress={() => Linking.openURL('mailto:support@yourapp.com')}
            />
            <QuickHelpCard
              icon="call-outline"
              title="Call Us"
              description="24/7 support line"
              onPress={() => Linking.openURL('tel:+1234567890')}
            />
            <QuickHelpCard
              icon="document-text-outline"
              title="Guides"
              description="Video tutorials"
              onPress={() => {
                // Navigate to guides
              }}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Browse by Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  { 
                    backgroundColor: selectedCategory === category.id ? colors.primary : colors.backgroundElement,
                    borderColor: colors.border 
                  }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={18} 
                  color={selectedCategory === category.id ? '#FFF' : colors.textSecondary} 
                />
                <Text 
                  style={[
                    styles.categoryText, 
                    { color: selectedCategory === category.id ? '#FFF' : colors.textSecondary }
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQs */}
        <View style={styles.faqsSection}>
          <View style={styles.faqsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Frequently Asked Questions</Text>
            <Text style={[styles.faqsCount, { color: colors.textSecondary }]}>
              {getFilteredFaqs().length} articles
            </Text>
          </View>
          
          {getFilteredFaqs().length > 0 ? (
            <FlatList
              data={getFilteredFaqs()}
              renderItem={renderFaqItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={[styles.noResults, { backgroundColor: colors.backgroundElement }]}>
              <Ionicons name="search-outline" size={50} color={colors.textSecondary} />
              <Text style={[styles.noResultsTitle, { color: colors.textPrimary }]}>No results found</Text>
              <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                Try different keywords or browse by category
              </Text>
            </View>
          )}
        </View>

        {/* Contact Support */}
        <View style={[styles.contactSupport, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="headset" size={40} color={colors.primary} />
          <Text style={[styles.contactTitle, { color: colors.textPrimary }]}>Still need help?</Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            Our support team is available 24/7 to assist you
          </Text>
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              // Navigate to support screen
            }}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
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
    padding: 10,
    paddingBottom:120
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  quickHelpSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  quickHelpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickHelpCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  quickHelpTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  quickHelpDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    marginLeft: 8,
  },
  faqsSection: {
    marginBottom: 24,
  },
  faqsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  faqsCount: {
    fontSize: 12,
  },
  faqItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  faqAnswerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  helpfulButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  helpfulText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noResults: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  contactSupport: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default HelpCenterScreen;
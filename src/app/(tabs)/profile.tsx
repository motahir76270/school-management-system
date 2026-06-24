import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';



export default function ProfileScreen() {
    const scheme = useColorScheme();
    const color = Colors[scheme === 'unspecified' ? 'light' : scheme];
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient         
              colors={ [color.primary, color.tertiary,  color.secondary] }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>

      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </SafeAreaView>
    </LinearGradient>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
          <TouchableOpacity style={styles.editIcon}>
            <Ionicons name="camera" size={18} color={Colors.light.background} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.studentName}>Jimmy Wilson</Text>
        <Text style={styles.studentId}>Student ID: STU-2024-085</Text>
        
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Ionicons name="school" size={14} color={Colors.light.primary} />
            <Text style={styles.badgeText}>Grade 12 - Section A</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="calendar" size={14} color={Colors.light.primary} />
            <Text style={styles.badgeText}>2024-2025</Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>92%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '92%' }]} />
          </View>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>15</Text>
          <Text style={styles.statLabel}>Subjects</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>3.8</Text>
          <Text style={styles.statLabel}>GPA</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '76%' }]} />
          </View>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>Jimmy Wilson</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>March 15, 2008</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>jimmy.wilson@school.com</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>+1 234 567 8900</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>123 School Street, New York</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Parent Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parent Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Father's Name</Text>
              <Text style={styles.infoValue}>Michael Wilson</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Mother's Name</Text>
              <Text style={styles.infoValue}>Sarah Wilson</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Parent Contact</Text>
              <Text style={styles.infoValue}>+1 234 567 8901</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: -10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  profileCard: {
    backgroundColor: Colors.light.backgroundElement,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 45,
    fontWeight: 'bold',
    color: Colors.light.background,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.secondary,
    borderRadius: 15,
    padding: 6,
  },
  studentName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 5,
  },
  studentId: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSelected,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 15,
    marginVertical: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.backgroundElement,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.light.backgroundSelected,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 15,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
});
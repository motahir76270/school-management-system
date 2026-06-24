import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const Navbar = () => {
    const scheme = useColorScheme();
    const color = Colors[scheme === 'unspecified' ? 'light' : scheme];
    
    return (
      <LinearGradient
        colors={  [color.primary, color.tertiary,  color.secondary] }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.navbar}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: color.textSecondary }]}>Hello,</Text>
              <Text style={[styles.name, { color: color.text }]}>Jimmy 👋</Text>
            </View>
            
            <View style={styles.iconGroup}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={24} color={color.text} />
                <View style={[styles.badge, { backgroundColor: '#FF3B30' }]} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.profileBtn, { borderColor: color.border || 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="person-outline" size={24} color={color.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.classInfo}>
            <View style={[styles.classTag, { backgroundColor: color.backgroundElement }]}>
              <Text style={[styles.classText, { color: color.textSecondary }]}>E85, 2024-25</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
};

const styles = StyleSheet.create({
  gradientContainer: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navbar: {
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  name: {
    fontSize: 26,
    fontWeight: '600',
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    padding: 8,
    position: 'relative',
  },
  profileBtn: {
    borderWidth: 1.5,
    borderRadius: 30,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  classInfo: {
    marginTop: 8,
  },
  classTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  classText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default Navbar;
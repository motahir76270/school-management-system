// Navbar.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  useColorScheme,
  Animated,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileModal from '@/components/modal/profileModal';
import { useSelector } from 'react-redux';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

const Navbar = () => {
  const scheme = useColorScheme();
  const color = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [modalVisible, setModalVisible] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));
  const { user } = useSelector((state: any) => state.auth);

  const getUserPhoto = () => {
    if (user?.role === 'student' && user?.student?.photo) {
      return user.student.photo;
    }
    if (user?.role === 'teacher' && user?.teacher?.photo) {
      return user.teacher.photo;
    }
    return null;
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handleProfilePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    handlePressIn();
    setTimeout(() => {
      handlePressOut();
      setModalVisible(true);
    }, 100);
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  return (
    <>
      <LinearGradient
        colors={[color.primary, color.tertiary, color.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.navbar}>
            <View style={styles.header}>
              <View style={styles.greetingContainer}>
                <Text style={[styles.name, { color: color.text }]}>
                  {user?.name?.toUpperCase() || 'Jimmy'}
                </Text>
                {user?.role && (
                  <View style={[styles.roleBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Text style={[styles.roleText, { color: color.text }]}>
                      {user.role === 'student' ? '🎓 Student' : '👨‍🏫 Teacher'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.iconGroup}>
                <TouchableOpacity 
                  style={[styles.iconBtn, styles.notificationBtn]}
                  onPress={()=> router.push('/screens/settings/notices')}
                >
                  <Ionicons name="notifications-outline" size={24} color={color.text} />
                  <View style={[styles.badge, { backgroundColor: '#FF6B6B' }]} />
                </TouchableOpacity>

                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                  <TouchableOpacity 
                    style={[
                      styles.profileBtn, 
                      { 
                        borderColor: 'rgba(255,255,255,0.4)',
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    ]}
                    onPress={handleProfilePress}
                    activeOpacity={0.8}
                  >
                    {user?.role && getUserPhoto() ? (
                      <Image 
                        source={{ uri: getUserPhoto() }} 
                        style={styles.profileImage} 
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.initialsContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Text style={[styles.initialsText, { color: color.text }]}>
                          {getUserInitials()}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={[styles.statItem, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name="calendar-outline" size={16} color={color.text} />
                <Text style={[styles.statText, { color: color.text }]}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              <View style={[styles.statItem, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name="time-outline" size={16} color={color.text} />
                <Text style={[styles.statText, { color: color.text }]}>
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  safeArea: {
    flex: 1,
  },
  navbar: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 12,
    paddingBottom: -10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greetingContainer: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    fontSize: 15,
    marginBottom: 2,
    opacity: 0.9,
    letterSpacing: 0.3,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 2,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
    letterSpacing: 0.3,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 8,
    position: 'relative',
  },
  notificationBtn: {
    padding: 8,
  },
  profileBtn: {
    borderWidth: 2.5,
    borderRadius: 30,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 20,
  },
});

export default Navbar;
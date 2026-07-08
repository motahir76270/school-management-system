// ProfileModal.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  Image,
  Platform,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import { useRef, useState } from 'react';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const scheme = useColorScheme();
  const color = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { user } = useSelector((state: any) => state.auth);
  const viewShotRef = useRef<ViewShot>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Get user data
  const getUserName = () => {
    if (user?.role === 'student' && user?.student?.full_name) {
      return user.student.full_name;
    }
    if (user?.role === 'teacher' && user?.teacher?.full_name) {
      return user.teacher.full_name;
    }
    return user?.name || 'User';
  };

  const getUserRole = () => {
    const role = user?.role;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
  };

  const getUserPhoto = () => {
    if (user?.role === 'student' && user?.student?.photo) {
      return user.student.photo;
    }
    if (user?.role === 'teacher' && user?.teacher?.photo) {
      return user.teacher.photo;
    }
    return null;
  };

  const getUserQrPhoto = () => {
    if (user?.role === 'student') {
      return user?.student?.qr_image;
    }
    if (user?.role === 'teacher') {
      return user?.teacher?.qr_image;
    }
    return null;
  };

  const getInitials = () => {
    const name = getUserName();
    return name?.charAt(0).toUpperCase() || 'U';
  };

  const getSchoolName = () => user?.school?.name || 'School';

  const handleClose = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  const isDark = scheme === 'dark';

  // Share QR code only
  // const handleShare = async () => {
  //   try {
  //     setIsSharing(true);
      
  //     if (Platform.OS === 'ios') {
  //       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  //     }

  //     // Capture only the QR section
  //     const uri = await viewShotRef.current?.capture?.();
      
  //     if (!uri) {
  //       throw new Error('Failed to capture QR code');
  //     }

  //     // Share the image
  //     const shareResult = await Share.share({
  //       title: `${getUserName()}'s QR Code`,
  //       message: `Scan this QR code to connect with ${getUserName()}`,
  //       url: uri,
  //     });

  //     if (shareResult.action === Share.sharedAction) {
  //       console.log('Shared successfully');
  //     }
  //   } catch (error) {
  //     console.error('Error sharing:', error);
  //     Alert.alert(
  //       'Share Failed',
  //       'Unable to share QR code. Please try again.',
  //       [{ text: 'OK' }]
  //     );
  //   } finally {
  //     setIsSharing(false);
  //   }
  // };

  // Download QR code only
  const handleDownload = async () => {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant storage permission to download QR code.',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsDownloading(true);
      
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Capture only the QR section
      const uri = await viewShotRef.current?.capture?.();
      
      if (!uri) {
        throw new Error('Failed to capture QR code');
      }

      // Save to device
      const asset = await MediaLibrary.createAssetAsync(uri);
      
      if (asset) {
        Alert.alert(
          'Download Complete',
          'QR code has been saved to your gallery.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error downloading:', error);
      Alert.alert(
        'Download Failed',
        'Unable to download QR code. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.modalWrapper,
              {
                backgroundColor: color.backgroundElement,
                borderColor: color.border,
              }
            ]}>
              {/* Gradient Header */}
              <LinearGradient
                colors={[color.primary, color.secondary, color.tertiary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientHeader}
              />

              {/* Content Container */}
              <View style={styles.contentContainer}>
                {/* Close Button */}
                <TouchableOpacity
                  onPress={handleClose}
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.05)',
                      borderColor: color.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={color.text}
                  />
                </TouchableOpacity>

                {/* Full Profile View - Visible in modal */}
                <View style={styles.profileContent}>
                  {/* Avatar with Ring */}
                  <View style={styles.avatarWrapper}>
                    <LinearGradient
                      colors={[color.primary, color.secondary, color.tertiary]}
                      style={styles.avatarRing}
                    >
                      <View
                        style={[
                          styles.avatarContainer,
                          {
                            backgroundColor: color.background,
                            borderColor: color.border,
                          },
                        ]}
                      >
                        {getUserPhoto() ? (
                          <Image
                            source={{ uri: getUserPhoto() }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <Text style={[styles.avatarText, { color: color.primary }]}>
                            {getInitials()}
                          </Text>
                        )}
                      </View>
                    </LinearGradient>

                    {/* Status Dot */}
                    <View style={[styles.statusDot, { borderColor: color.background }]}>
                      <View style={styles.statusDotInner} />
                    </View>
                  </View>

                  {/* Name */}
                  <Text style={[styles.userName, { color: color.text }]}>
                    {getUserName()}
                  </Text>

                  {/* Role and School */}
                  <View style={styles.roleContainer}>
                    <View style={[
                      styles.roleBadge,
                      {
                        backgroundColor: color.primary + '15',
                        borderColor: color.primary + '30',
                      }
                    ]}>
                      <Ionicons
                        name={user?.role === 'student' ? 'school' : 'person'}
                        size={14}
                        color={color.primary}
                      />
                      <Text style={[styles.roleText, { color: color.primary }]}>
                        {getUserRole()}
                      </Text>
                    </View>
                    <View style={[
                      styles.roleBadge,
                      {
                        backgroundColor: color.secondary + '15',
                        borderColor: color.secondary + '30',
                      }
                    ]}>
                      <Ionicons name="business" size={14} color={color.secondary} />
                      <Text style={[styles.roleText, { color: color.secondary }]}>
                        {getSchoolName()}
                      </Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={[styles.divider, { backgroundColor: color.border }]} />

                  {/* QR Code Section - This is what gets captured */}
                  <ViewShot
                    ref={viewShotRef}
                    options={{
                      format: 'png',
                      quality: 0.9,
                      result: 'tmpfile',
                    }}
                    style={styles.qrSection}
                  >
                    <Text style={[styles.qrLabel, { color: color.textSecondary }]}>
                      SCAN TO ATTENDANCE
                    </Text>
                    <View
                      style={[
                        styles.qrContainer,
                        {
                          backgroundColor: color.background,
                          borderColor: color.border,
                          shadowColor: isDark ? '#000' : '#000',
                        },
                      ]}
                    >
                      {getUserQrPhoto() ? (
                        <Image 
                          source={{ uri: getUserQrPhoto() }} 
                          style={styles.qrImage} 
                        />
                      ) : (
                        <View style={[styles.qrPlaceholder, { backgroundColor: color.backgroundElement }]}>
                          <Ionicons name="qr-code" size={80} color={color.textSecondary} />
                          <Text style={[styles.qrPlaceholderText, { color: color.textSecondary }]}>
                            No QR Code Available
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.qrSubtext, { color: color.textSecondary }]}>
                      Show this code to share your profile
                    </Text>
                  </ViewShot>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>

                  {/* <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: color.backgroundSelected,
                        borderColor: color.border,
                      },
                    ]}
                    onPress={handleShare}
                    disabled={isSharing || isDownloading}
                    activeOpacity={0.7}
                  >
                    {isSharing ? (
                      <ActivityIndicator size="small" color={color.primary} />
                    ) : (
                      <>
                        <Ionicons name="share-social" size={20} color={color.primary} />
                        <Text style={[styles.actionButtonText, { color: color.text }]}>
                          Share QR
                        </Text>
                      </>
                    )}
                  </TouchableOpacity> */}

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: color.backgroundSelected,
                        borderColor: color.border,
                      },
                    ]}
                    onPress={handleDownload}
                    disabled={isSharing || isDownloading}
                    activeOpacity={0.7}
                  >
                    {isDownloading ? (
                      <ActivityIndicator size="small" color={color.primary} />
                    ) : (
                      <>
                        <Ionicons name="download" size={20} color={color.primary} />
                        <Text style={[styles.actionButtonText, { color: color.text }]}>
                          Download QR
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientHeader: {
    height: 8,
    width: '100%',
  },
  contentContainer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
  },
  profileContent: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  avatarText: {
    fontSize: 44,
    fontWeight: 'bold',
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  divider: {
    width: 50,
    height: 2,
    borderRadius: 1,
    marginBottom: 20,
  },
  qrSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  qrLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 12,
  },
  qrContainer: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  qrSubtext: {
    fontSize: 11,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    flex: 1,
    maxWidth: 190,
    minWidth:160,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  qrPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ProfileModal;
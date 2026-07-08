import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const color = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { user } = useSelector((state: any) => state.auth);

  // Determine if user is student or teacher
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  
  // Get user data based on role
  const getUserName = () => {
    if (isStudent && user?.student?.full_name) {
      return user.student.full_name;
    }
    if (isTeacher && user?.teacher?.full_name) {
      return user.teacher.full_name;
    }
    return user?.name || 'User';
  };

  const getUserPhoto = () => {
    if (isStudent && user?.student?.photo) {
      return user.student.photo;
    }
    if (isTeacher && user?.teacher?.photo) {
      return user.teacher.photo;
    }
    return null;
  };

  const getUserEmail = () => user?.email || 'No email provided';
  
  const getUserRole = () => {
    const role = user?.role;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
  };
  
  const getSchoolName = () => user?.school?.name || 'School';
  const getSchoolLogo = () => user?.school?.logo || null;

  // Student specific getters
  const getStudentClass = () => user?.student?.class || 'N/A';
  const getStudentSection = () => user?.student?.section || 'N/A';
  const getStudentId = () => user?.student?.student_id || 'N/A';
  const getAdmissionNo = () => user?.student?.admission_no || 'N/A';
  const getRollNo = () => user?.student?.roll_no || 'N/A';
  const getStudentDOB = () => user?.student?.date_of_birth_label || 'N/A';
  const getStudentGender = () => {
    const gender = user?.student?.gender;
    return gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'N/A';
  };
  const getStudentAPAAR = () => user?.student?.apaar_id || null;

  // Teacher specific getters
  const getTeacherId = () => user?.teacher?.employee_id || 'N/A';
  const getTeacherQualification = () => {
    const qual = user?.teacher?.qualification;
    return qual || 'Not specified';
  };
  const getTeacherSpecialization = () => {
    const spec = user?.teacher?.specialization;
    return spec || 'Not specified';
  };
  const getTeacherPhone = () => {
    const phone = user?.teacher?.phone;
    return phone || 'Not provided';
  };
  const getTeacherIsActive = () => {
    return user?.teacher?.is_active !== false;
  };
  const getTeacherDOB = () => user?.teacher?.date_of_birth_label || 'N/A';
  const getTeacherJoiningDate = () => user?.teacher?.joining_date_label || 'N/A';
  const getTeacherGender = () => {
    const gender = user?.teacher?.gender;
    return gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'N/A';
  };
  const getTeacherAddress = () => user?.teacher?.address || null;
  const getTeacherPreviousSchools = () => user?.teacher?.previous_schools || null;
  const getTeacherTotalExperience = () => user?.teacher?.total_experience || null;

  const getInitials = () => {
    const name = getUserName();
    return name?.charAt(0).toUpperCase() || 'U';
  };

  // Check if user has photo
  const hasPhoto = getUserPhoto() !== null;

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[color.primary, color.tertiary, color.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: color.backgroundElement }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: color.primary }]}>
              {hasPhoto ? (
                <Image 
                  source={{ uri: getUserPhoto() }} 
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={[styles.avatarText, { color: color.background }]}>
                  {getInitials()}
                </Text>
              )}
            </View>
            <TouchableOpacity style={[styles.editIcon, { backgroundColor: color.secondary }]}>
              <Ionicons name="camera" size={18} color={color.background} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.studentName, { color: color.text }]}>
            {getUserName()}
          </Text>
          
          <Text style={[styles.studentId, { color: color.textSecondary }]}>
            {isStudent ? `Student ID: ${getStudentId()}` : `Teacher ID: ${getTeacherId()}`}
          </Text>

          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: color.backgroundSelected }]}>
              <Ionicons name="school" size={14} color={color.primary} />
              <Text style={[styles.badgeText, { color: color.textSecondary }]}>
                {getSchoolName()}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: color.backgroundSelected }]}>
              <Ionicons name="person" size={14} color={color.primary} />
              <Text style={[styles.badgeText, { color: color.textSecondary }]}>
                {getUserRole()}
              </Text>
            </View>
          </View>

          {/* School Logo */}
          {getSchoolLogo() && (
            <View style={styles.schoolLogoContainer}>
              <Image 
                source={{ uri: getSchoolLogo() }} 
                style={styles.schoolLogo}
              />
            </View>
          )}
        </View>

        {/* Student Specific Stats */}
        {isStudent && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: color.backgroundElement }]}>
              <Text style={[styles.statNumber, { color: color.primary }]}>Class</Text>
              <Text style={[styles.statLabel, { color: color.textSecondary }]}>
                {getStudentClass()}
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: color.backgroundElement }]}>
              <Text style={[styles.statNumber, { color: color.primary }]}>Section</Text>
              <Text style={[styles.statLabel, { color: color.textSecondary }]}>
                {getStudentSection()}
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: color.backgroundElement }]}>
              <Text style={[styles.statNumber, { color: color.primary }]}>Roll No</Text>
              <Text style={[styles.statLabel, { color: color.textSecondary }]}>
                {getRollNo()}
              </Text>
            </View>
          </View>
        )}

        {/* Teacher Specific Stats */}
        {isTeacher && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: color.backgroundElement }]}>
              <Text style={[styles.statNumber, { color: color.primary }]}>Qualification</Text>
              <Text style={[styles.statLabel, { color: color.textSecondary }]} numberOfLines={2}>
                {getTeacherQualification()}
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: color.backgroundElement }]}>
              <Text style={[styles.statNumber, { color: color.primary }]}>Specialization</Text>
              <Text style={[styles.statLabel, { color: color.textSecondary }]} numberOfLines={2}>
                {getTeacherSpecialization()}
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: color.backgroundElement }]}>
              <Text style={[styles.statNumber, { color: color.primary }]}>Status</Text>
              <Text style={[styles.statLabel, { color: color.textSecondary }]}>
                {getTeacherIsActive() ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        )}

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: color.text }]}>
            {isStudent ? 'Student Information' : 'Teacher Information'}
          </Text>

          <View style={[styles.infoCard, { backgroundColor: color.backgroundElement }]}>
            {/* Name */}
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={color.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Full Name</Text>
                <Text style={[styles.infoValue, { color: color.text }]}>{getUserName()}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: color.border }]} />

            {/* Email */}
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={color.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Email</Text>
                <Text style={[styles.infoValue, { color: color.text }]}>{getUserEmail()}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: color.border }]} />

            {/* School */}
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={20} color={color.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: color.textSecondary }]}>School</Text>
                <Text style={[styles.infoValue, { color: color.text }]}>{getSchoolName()}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: color.border }]} />

            {/* Role */}
            <View style={styles.infoRow}>
              <Ionicons name="person-circle-outline" size={20} color={color.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Role</Text>
                <Text style={[styles.infoValue, { color: color.text }]}>{getUserRole()}</Text>
              </View>
            </View>

            {/* Student Specific Information */}
            {isStudent && (
              <>
                {/* Class */}
                <View style={[styles.divider, { backgroundColor: color.border }]} />
                <View style={styles.infoRow}>
                  <Ionicons name="book-outline" size={20} color={color.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Class</Text>
                    <Text style={[styles.infoValue, { color: color.text }]}>{getStudentClass()}</Text>
                  </View>
                </View>

                {/* Section */}
                <View style={[styles.divider, { backgroundColor: color.border }]} />
                <View style={styles.infoRow}>
                  <Ionicons name="grid-outline" size={20} color={color.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Section</Text>
                    <Text style={[styles.infoValue, { color: color.text }]}>{getStudentSection()}</Text>
                  </View>
                </View>

                {/* Roll Number */}
                <View style={[styles.divider, { backgroundColor: color.border }]} />
                <View style={styles.infoRow}>
                  <Ionicons name="dice-outline" size={20} color={color.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Roll Number</Text>
                    <Text style={[styles.infoValue, { color: color.text }]}>{getRollNo()}</Text>
                  </View>
                </View>

                {/* Admission Number */}
                <View style={[styles.divider, { backgroundColor: color.border }]} />
                <View style={styles.infoRow}>
                  <Ionicons name="card-outline" size={20} color={color.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Admission Number</Text>
                    <Text style={[styles.infoValue, { color: color.text }]}>{getAdmissionNo()}</Text>
                  </View>
                </View>

                {/* Student ID */}
                <View style={[styles.divider, { backgroundColor: color.border }]} />
                <View style={styles.infoRow}>
                  <Ionicons name="id-card-outline" size={20} color={color.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Student ID</Text>
                    <Text style={[styles.infoValue, { color: color.text }]}>{getStudentId()}</Text>
                  </View>
                </View>

                {/* Date of Birth */}
                {user?.student?.date_of_birth_label && (
                  <>
                    <View style={[styles.divider, { backgroundColor: color.border }]} />
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={20} color={color.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Date of Birth</Text>
                        <Text style={[styles.infoValue, { color: color.text }]}>{getStudentDOB()}</Text>
                      </View>
                    </View>
                  </>
                )}

                {/* Gender */}
                {user?.student?.gender && (
                  <>
                    <View style={[styles.divider, { backgroundColor: color.border }]} />
                    <View style={styles.infoRow}>
                      <Ionicons name="male-female-outline" size={20} color={color.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Gender</Text>
                        <Text style={[styles.infoValue, { color: color.text }]}>{getStudentGender()}</Text>
                      </View>
                    </View>
                  </>
                )}

                {/* APAAR ID */}
                {getStudentAPAAR() && (
                  <>
                    <View style={[styles.divider, { backgroundColor: color.border }]} />
                    <View style={styles.infoRow}>
                      <Ionicons name="finger-print-outline" size={20} color={color.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: color.textSecondary }]}>APAAR ID</Text>
                        <Text style={[styles.infoValue, { color: color.text }]}>{getStudentAPAAR()}</Text>
                      </View>
                    </View>
                  </>
                )}
              </>
            )}

            {/* Teacher Specific Information */}
            {isTeacher && (
              <>
                {/* Employee ID */}
                <View style={[styles.divider, { backgroundColor: color.border }]} />
                <View style={styles.infoRow}>
                  <Ionicons name="briefcase-outline" size={20} color={color.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Employee ID</Text>
                    <Text style={[styles.infoValue, { color: color.text }]}>{getTeacherId()}</Text>
                  </View>
                </View>

                {/* Date of Birth */}
                {user?.teacher?.date_of_birth_label && (
                  <>
                    <View style={[styles.divider, { backgroundColor: color.border }]} />
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={20} color={color.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Date of Birth</Text>
                        <Text style={[styles.infoValue, { color: color.text }]}>{getTeacherDOB()}</Text>
                      </View>
                    </View>
                  </>
                )}

                {/* Joining Date */}
                {user?.teacher?.joining_date_label && (
                  <>
                    <View style={[styles.divider, { backgroundColor: color.border }]} />
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={20} color={color.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Joining Date</Text>
                        <Text style={[styles.infoValue, { color: color.text }]}>{getTeacherJoiningDate()}</Text>
                      </View>
                    </View>
                  </>
                )}

                {/* Total Experience - NEW */}
                {getTeacherTotalExperience() !== null && (
                  <>
                    <View style={[styles.divider, { backgroundColor: color.border }]} />
                    <View style={styles.infoRow}>
                      <Ionicons name="time-outline" size={20} color={color.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Total Experience</Text>
                        <Text style={[styles.infoValue, { color: color.text }]}>
                          {getTeacherTotalExperience()} {getTeacherTotalExperience() === 1 ? 'year' : 'years'}
                        </Text>
                      </View>
                    </View>
                  </>
                )}

                {/* Qualification */}
                <View style={[styles.divider, { backgroundColor: color.border }]} />
                <View style={styles.infoRow}>
                  <Ionicons name="school-outline" size={20} color={color.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Qualification</Text>
                    <Text style={[styles.infoValue, { color: color.text }]}>{getTeacherQualification()}</Text>
                  </View>
                </View>

                {/* Specialization */}
                <View style={[styles.divider, { backgroundColor: color.border }]} />
                <View style={styles.infoRow}>
                  <Ionicons name="bulb-outline" size={20} color={color.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Specialization</Text>
                    <Text style={[styles.infoValue, { color: color.text }]}>{getTeacherSpecialization()}</Text>
                  </View>
                </View>

                {/* Previous Schools - NEW */}
                {getTeacherPreviousSchools() !== null && (
                  <>
                    <View style={[styles.divider, { backgroundColor: color.border }]} />
                    <View style={styles.infoRow}>
                      <Ionicons name="business-outline" size={20} color={color.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Previous Schools</Text>
                        <Text style={[styles.infoValue, { color: color.text }]}>{getTeacherPreviousSchools()}</Text>
                      </View>
                    </View>
                  </>
                )}

                {/* Phone */}
                {getTeacherPhone() !== 'Not provided' && (
                  <>
                    <View style={[styles.divider, { backgroundColor: color.border }]} />
                    <View style={styles.infoRow}>
                      <Ionicons name="call-outline" size={20} color={color.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Phone</Text>
                        <Text style={[styles.infoValue, { color: color.text }]}>{getTeacherPhone()}</Text>
                      </View>
                    </View>
                  </>
                )}

                {/* Gender */}
                {user?.teacher?.gender && (
                  <>
                    <View style={[styles.divider, { backgroundColor: color.border }]} />
                    <View style={styles.infoRow}>
                      <Ionicons name="male-female-outline" size={20} color={color.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Gender</Text>
                        <Text style={[styles.infoValue, { color: color.text }]}>{getTeacherGender()}</Text>
                      </View>
                    </View>
                  </>
                )}

                {/* Address */}
                {getTeacherAddress() && (
                  <>
                    <View style={[styles.divider, { backgroundColor: color.border }]} />
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={20} color={color.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: color.textSecondary }]}>Address</Text>
                        <Text style={[styles.infoValue, { color: color.text }]}>{getTeacherAddress()}</Text>
                      </View>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </View>

        {/* Account Status */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={[styles.statusCard, { backgroundColor: color.backgroundElement }]}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { 
                backgroundColor: user?.is_active !== false ? color.success : color.error 
              }]} />
              <Text style={[styles.statusText, { color: color.text }]}>
                Account Status: {user?.is_active !== false ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileCard: {
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
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 45,
    fontWeight: 'bold',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 15,
    padding: 6,
  },
  studentName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  studentId: {
    fontSize: 14,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
  },
  schoolLogoContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  schoolLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 15,
    marginVertical: 20,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  lastSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoCard: {
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
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
  },
  statusCard: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
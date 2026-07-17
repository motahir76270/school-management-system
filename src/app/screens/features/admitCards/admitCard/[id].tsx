import { View, Text, Alert, useColorScheme, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import HeaderSection from '@/components/features/header'
import { FullScreenLoader } from '@/hooks/use-screensLoder'
import { useLocalSearchParams } from 'expo-router'
import { getStudentsAdminCArdById } from '@/hooks/apiCalls/student'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

const AdminCardByID = () => {
    const [loading, setLoading] = useState(false)
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
    const [admitCardData, setAdmitCardData] = useState<any>(null)
    const { id } = useLocalSearchParams();

    const fetchAllAdmitCardDataById = async () => {
        setLoading(true);
        try {
            const res = await getStudentsAdminCArdById(id);
            if (res?.success === true) {
                setAdmitCardData(res);
            } else {
                Alert.alert("Failed", res?.message || "Failed to fetch reports")
            }
        } catch (error) {
            Alert.alert("Failed", "Server Not Responding! Please Check Internet Connection")
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAllAdmitCardDataById()
    }, []);

    const renderScheduleItem = ({ item, index }: { item: any, index: number }) => {
        const isEven = index % 2 === 0;
        return (
            <View style={[styles.scheduleRow, isEven ? styles.evenRow : styles.oddRow]}>
                <Text style={[styles.scheduleText, styles.subjectCell]}>{item.subject}</Text>
                <Text style={[styles.scheduleText, styles.dateCell]}>{item.exam_date_label}</Text>
                <Text style={[styles.scheduleText, styles.timeCell]}>{item.start_time} - {item.end_time}</Text>
                <Text style={[styles.scheduleText, styles.roomCell]}>{item.room}</Text>
                <Text style={[styles.scheduleText, styles.marksCell]}>{item.max_marks}</Text>
            </View>
        )
    }

    if (!admitCardData) {
        return (
            <View style={styles.container}>
                <HeaderSection title="Admit Card Details" />
                <FullScreenLoader loading={loading} />
            </View>
        )
    }

    const { exam, student, schedules } = admitCardData;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <HeaderSection title="Admit Card Details" />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Student Info Card */}
                <View style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.studentHeader}>
                        <View style={styles.studentInfo}>
                            <Text style={[styles.studentName, { color: colors.text }]}>{student.name}</Text>
                            <Text style={[styles.studentRoll, { color: colors.textSecondary }]}>Roll No: {student.roll_no}</Text>
                            <Text style={[styles.studentClass, { color: colors.textSecondary }]}>
                                Class: {student.class} - {student.section}
                            </Text>
                            <Text style={[styles.studentAdmission, { color: colors.textSecondary }]}>
                                Admission: {student.admission_no}
                            </Text>
                        </View>
                        {student.qr_image && (
                            <View style={styles.qrContainer}>
                                <Image 
                                    source={{ uri: student.qr_image }} 
                                    style={styles.qrImage}
                                    resizeMode="contain"
                                />
                            </View>
                        )}
                    </View>
                </View>

                {/* Exam Info Card */}
                <View style={[styles.examCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Exam Details</Text>
                    <View style={styles.examInfoRow}>
                        <Text style={[styles.examLabel, { color: colors.textSecondary }]}>Exam Name:</Text>
                        <Text style={[styles.examValue, { color: colors.text }]}>{exam.name}</Text>
                    </View>
                    <View style={styles.examInfoRow}>
                        <Text style={[styles.examLabel, { color: colors.textSecondary }]}>Type:</Text>
                        <Text style={[styles.examValue, { color: colors.text }]}>{exam.type_label}</Text>
                    </View>
                    <View style={styles.examInfoRow}>
                        <Text style={[styles.examLabel, { color: colors.textSecondary }]}>Duration:</Text>
                        <Text style={[styles.examValue, { color: colors.text }]}>
                            {exam.start_date} - {exam.end_date}
                        </Text>
                    </View>
                </View>

                {/* Schedule Card */}
                <View style={[styles.scheduleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Exam Schedule</Text>
                    
                    {/* Table Header */}
                    <View style={[styles.scheduleHeader, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.headerText, styles.subjectCell]}>Subject</Text>
                        <Text style={[styles.headerText, styles.dateCell]}>Date</Text>
                        <Text style={[styles.headerText, styles.timeCell]}>Time</Text>
                        <Text style={[styles.headerText, styles.roomCell]}>Room</Text>
                        <Text style={[styles.headerText, styles.marksCell]}>Max Marks</Text>
                    </View>

                    {/* Schedule Rows */}
                    {schedules?.map((item: any, index: number) => renderScheduleItem({ item, index }))}
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        onPress={() => Alert.alert('Download', 'Download PDF functionality coming soon')}
                    >
                        <Ionicons name="download-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Download PDF</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: colors.success || '#4CAF50' }]}
                        onPress={() => Alert.alert('Print', 'Print functionality coming soon')}
                    >
                        <Ionicons name="print-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Print</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <FullScreenLoader loading={loading} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    studentCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    studentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    studentRoll: {
        fontSize: 14,
        marginBottom: 2,
    },
    studentClass: {
        fontSize: 14,
        marginBottom: 2,
    },
    studentAdmission: {
        fontSize: 14,
    },
    qrContainer: {
        marginLeft: 12,
    },
    qrImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    examCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    examInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    examLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    examValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    scheduleCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    scheduleHeader: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    headerText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
    },
    scheduleRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    evenRow: {
        backgroundColor: '#f8f9fa',
    },
    oddRow: {
        backgroundColor: '#fff',
    },
    scheduleText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    },
    subjectCell: {
        flex: 1.5,
    },
    dateCell: {
        flex: 1.2,
    },
    timeCell: {
        flex: 1.5,
    },
    roomCell: {
        flex: 0.8,
    },
    marksCell: {
        flex: 0.8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})

export default AdminCardByID
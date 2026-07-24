import { View, Text, useColorScheme, TouchableOpacity, FlatList, Alert, Dimensions } from 'react-native'
import React, { useEffect } from 'react'
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';
import { useDispatch, useSelector } from 'react-redux';
import { getMCQExamData, startMCQExamApiCall, resetExamState } from '@/redux/examSlice/studentExamSlice';
import { FullScreenLoader } from '@/hooks/use-screensLoder';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ExamPanelScreen = () => {
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
    const router = useRouter();
    
    const { getExamData, loading } = useSelector((state: any) => state?.studentExam)
    const dispatch = useDispatch();
    
    useEffect(() => {
        getMCQExamData(dispatch)
        return () => {
            dispatch(resetExamState());
        }
    }, [dispatch])

    const handleStartExam = async (examId: any) => {
        try {
            const result: any = await startMCQExamApiCall(examId, dispatch);
            if (result?.success) {
                router.push(`/screens/student/exam/${result.attempt.id}` as any);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to start exam");
        }
    }

    const handleViewResult = (examId: any) => {
        router.push(`/screens/student/exam/result/${examId}` as any);
    }

    const getStatusColor = (status: any) => {
        switch(status) {
            case 'submitted':
                return '#28a745';
            case 'auto_submitted':
                return '#ffc107';
            case 'in_progress':
                return '#007bff';
            default:
                return '#6c757d';
        }
    }

    const getStatusText = (status: any) => {
        switch(status) {
            case 'submitted':
                return '✅ Submitted';
            case 'auto_submitted':
                return '⏰ Auto Submitted';
            case 'in_progress':
                return '🔄 In Progress';
            default:
                return '📝 Not Started';
        }
    }

    const renderExamItem = ({ item }: any) => {
        const isCompleted = item.is_submitted === true;
        const isInProgress = item.attempt_status === 'in_progress';
        const isAvailable = !isCompleted && !isInProgress;

        return (
            <View style={{
                padding: 12,
                marginVertical: 6,
                marginHorizontal: 12,
                backgroundColor: colors.card,
                borderRadius: 10,
                elevation: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
            }}>
                {/* Header - Title & Status */}
                <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: 6
                }}>
                    <Text style={{ 
                        fontSize: width < 380 ? 14 : 16, 
                        fontWeight: '600', 
                        color: colors.text, 
                        flex: 1,
                        marginRight: 8
                    }} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={{ 
                        fontSize: 10,
                        color: getStatusColor(item.attempt_status || 'available'),
                        fontWeight: '600',
                        backgroundColor: `${getStatusColor(item.attempt_status || 'available')}15`,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 12,
                        flexShrink: 0
                    }}>
                        {getStatusText(item.attempt_status)}
                    </Text>
                </View>
                
                {/* Details in 2 rows */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginVertical: 4 }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                        📚 {item.subject}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                        📖 {item.class}-{item.section}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                        ⏱️ {item.duration_minutes}m
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                        📝 {item.total_questions}Q
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                        📊 {item.total_marks}M
                    </Text>
                    {item.negative_marking && (
                        <Text style={{ fontSize: 11, color: '#dc3545' }}>
                            -{item.negative_marks}M
                        </Text>
                    )}
                </View>

                {/* Date */}
                <Text style={{ 
                    fontSize: 10, 
                    color: colors.textSecondary,
                    marginTop: 2,
                    opacity: 0.7
                }} numberOfLines={1}>
                    📅 {item.starts_at_label} - {item.ends_at_label}
                </Text>

                {/* Action Buttons */}
                <View style={{ marginTop: 8 }}>
                    {isCompleted ? (
                        <View style={{ 
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: `${getStatusColor('submitted')}10`,
                            padding: 8,
                            borderRadius: 6,
                        }}>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                                    Score: <Text style={{ fontWeight: '600', color: colors.text }}>{item.score}/{item.total_marks}</Text>
                                </Text>
                                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                                    <Text style={{ fontWeight: '600', color: colors.text }}>{item.percentage}%</Text>
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: colors.primary,
                                    paddingVertical: 4,
                                    paddingHorizontal: 12,
                                    borderRadius: 4,
                                }}
                                onPress={() => handleViewResult(item.id)}
                            >
                                <Text style={{ color: 'white', fontSize: 11, fontWeight: '500' }}>
                                    Result
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={{
                                backgroundColor: isInProgress ? colors.primary : '#28a745',
                                paddingVertical: 6,
                                borderRadius: 6,
                                alignItems: 'center'
                            }}
                            onPress={() => handleStartExam(item.id)}
                        >
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: '500' }}>
                                {isInProgress ? '▶ Resume' : '▶ Start'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const renderSection = (title: string, data: any[], icon: string, count: number) => {
        if (!data?.length) return null;
        
        return (
            <View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                        {icon} {title}
                    </Text>
                    <View style={{
                        backgroundColor: colors.primary + '20',
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginLeft: 8,
                    }}>
                        <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '500' }}>
                            {count}
                        </Text>
                    </View>
                </View>
                <FlatList
                    data={data}
                    renderItem={renderExamItem}
                    keyExtractor={(item: any) => item.id}
                    contentContainerStyle={{ paddingBottom: 8 }}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <HeaderSection title="Online Exams" />
            
            <FlatList
                data={[]}
                renderItem={() => null}
                ListHeaderComponent={
                    <View>
                        {renderSection('Available Exams', getExamData?.available, '📚', getExamData?.counts?.available || 0)}
                        {renderSection('Completed Exams', getExamData?.completed, '✅', getExamData?.counts?.completed || 0)}
                        
                        {(!getExamData?.available?.length && !getExamData?.completed?.length) && (
                            <View style={{ 
                                padding: 40,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Ionicons name="document-text-outline" size={50} color={colors.textSecondary} />
                                <Text style={{ 
                                    fontSize: 16, 
                                    color: colors.textSecondary,
                                    marginTop: 12,
                                    textAlign: 'center'
                                }}>
                                    No exams available
                                </Text>
                            </View>
                        )}
                    </View>
                }
                contentContainerStyle={{ flexGrow: 1 }}
            />

            <FullScreenLoader loading={loading} />
        </View>
    )
}

export default ExamPanelScreen;
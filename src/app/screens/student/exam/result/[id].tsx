import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  useColorScheme, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Linking,
  ActivityIndicator,
  Share,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';
import { getResultExamApiCall, resetExamState } from '@/redux/examSlice/studentExamSlice';
import { FullScreenLoader } from '@/hooks/use-screensLoder';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const ExamResultScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  
  const { examResult, loading } = useSelector((state: any) => state?.studentExam);
  const [downloading, setDownloading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (id) {
      getResultExamApiCall(id, dispatch);
    }
    return () => {
      dispatch(resetExamState());
    };
  }, [id]);

  // Request permission for saving files
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
    })();
  }, []);

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
  };

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
  };

  const getGradeColor = (grade: any) => {
    const gradeMap: any = {
      'A': '#28a745',
      'B': '#007bff',
      'C': '#ffc107',
      'D': '#fd7e14',
      'F': '#dc3545'
    };
    return gradeMap[grade] || colors.textSecondary;
  };

  const getGradeEmoji = (grade: any) => {
    const gradeMap: any = {
      'A': '🌟',
      'B': '⭐',
      'C': '📘',
      'D': '📗',
      'F': '📕'
    };
    return gradeMap[grade] || '📝';
  };

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      return token ? JSON.parse(token) : null;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };


  // Save PDF to device
  const savePdfToDevice = async (pdfUri: string) => {
    try {
      const fileName = `certificate_${Date.now()}.pdf`;
      const newPath = FileSystem.documentDirectory + fileName;
      
      // Copy the file to a permanent location
      await FileSystem.copyAsync({
        from: pdfUri,
        to: newPath
      });

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(newPath);
      await MediaLibrary.createAlbumAsync('Certificates', asset, false);
      
      return newPath;
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw error;
    }
  };

    const downloadCertificate = async (certificateUrl: any) => {
      const token = await getToken();
     const htmlContent = await fetch(certificateUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          dialogTitle: "Share Transaction Receipt",
          mimeType: "application/pdf",
        });
      } else {
        Alert.alert("PDF Generated", `PDF saved at: ${uri}`, [{ text: "OK" }]);
      }
    } catch {
      Alert.alert("Error", "Failed to generate PDF receipt. Please try again.");
    } finally {
    }
  };


  // Share certificate
  const shareCertificate = async (certificateUrl: string) => {
    try {
      setDownloading(true);
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Please login again");
        return;
      }

      // Fetch the certificate content
      const response = await fetch(certificateUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/html,application/xhtml+xml,application/xml',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      let fileUri;
      let fileName = `certificate_${Date.now()}`;

      if (contentType.includes('application/pdf')) {
        // If PDF
        const blob = await response.blob();
        const reader = new FileReader();
        
        const base64Data = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        const base64String = base64Data.toString().split(',')[1];
        fileUri = FileSystem.documentDirectory + `${fileName}.pdf`;
        
        await FileSystem.writeAsStringAsync(fileUri, base64String, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        // If HTML
        const htmlContent = await response.text();
        if (htmlContent.includes('<!DOCTYPE html') || htmlContent.includes('<html')) {
          const pdfUri = await convertHtmlToPdf(htmlContent);
          fileUri = await savePdfToDevice(pdfUri);
        } else {
          fileUri = FileSystem.documentDirectory + `${fileName}.txt`;
          await FileSystem.writeAsStringAsync(fileUri, htmlContent);
        }
      }

      // Share the file
      if (fileUri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Certificate',
        });
      } else {
        Alert.alert("Info", "Sharing is not available on this device");
      }

    } catch (error) {
      console.error("Error sharing certificate:", error);
      Alert.alert("Error", "Failed to share certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <FullScreenLoader loading={true} />;
  }

  if (!examResult) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Ionicons name="document-text-outline" size={60} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary, marginTop: 16 }}>
          No result data available
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: colors.primary,
            padding: 12,
            borderRadius: 8,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderSection title="Exam Result" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      >
        {/* Exam Title */}
        <View style={{ 
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
          marginBottom: 12
        }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4
          }}>
            {examResult.exam?.title || 'Exam'}
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            {examResult.exam?.subject} - {examResult.exam?.class} {examResult.exam?.section}
          </Text>
          <Text style={{ 
            color: colors.textSecondary,
            fontSize: 12,
            marginTop: 4
          }}>
            {examResult.exam?.starts_at_label} to {examResult.exam?.ends_at_label}
          </Text>
        </View>

        {/* Score and Percentage */}
        <View style={{ 
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: 12
        }}>
          <View style={{ 
            alignItems: 'center',
            backgroundColor: colors.card,
            padding: 12,
            borderRadius: 8,
            flex: 1,
            marginHorizontal: 4
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Score</Text>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: colors.text 
            }}>
              {examResult.attempt?.score || 0}/{examResult.exam?.total_marks || 0}
            </Text>
          </View>
          <View style={{ 
            alignItems: 'center',
            backgroundColor: colors.card,
            padding: 12,
            borderRadius: 8,
            flex: 1,
            marginHorizontal: 4
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Percentage</Text>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: colors.text 
            }}>
              {examResult.attempt?.percentage || 0}%
            </Text>
          </View>
        </View>

        {/* Grade */}
        <View style={{ 
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 8,
          marginBottom: 12,
          alignItems: 'center'
        }}>
          <Text style={{ color: colors.textSecondary }}>Grade</Text>
          <Text style={{ 
            fontSize: 44, 
            fontWeight: 'bold',
            color: getGradeColor(examResult.attempt?.grade)
          }}>
            {getGradeEmoji(examResult.attempt?.grade)} {examResult.attempt?.grade || 'N/A'}
          </Text>
          {examResult.attempt?.status && (
            <Text style={{ 
              color: getStatusColor(examResult.attempt.status),
              fontSize: 12,
              marginTop: 4
            }}>
              {getStatusText(examResult.attempt.status)}
            </Text>
          )}
          {examResult.rank && (
            <Text style={{ 
              color: colors.primary,
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 8
            }}>
              🏆 Rank: #{examResult.rank}
            </Text>
          )}
        </View>

        {/* Summary */}
        <View style={{ 
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 8,
          marginBottom: 12
        }}>
          <Text style={{ 
            fontWeight: 'bold', 
            color: colors.text, 
            marginBottom: 8 
          }}>
            📊 Summary
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary }}>
              ✅ Correct: {examResult.attempt?.correct_count || 0}
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              ❌ Wrong: {examResult.attempt?.wrong_count || 0}
            </Text>
          </View>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            marginTop: 4 
          }}>
            <Text style={{ color: colors.textSecondary }}>
              📝 Total Questions: {examResult.exam?.total_questions || 0}
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              🔄 Tab Switches: {examResult.attempt?.tab_switches || 0}
            </Text>
          </View>
          {examResult.attempt?.submitted_at && (
            <Text style={{ 
              color: colors.textSecondary, 
              marginTop: 4,
              fontSize: 12
            }}>
              Submitted: {new Date(examResult.attempt.submitted_at).toLocaleString()}
            </Text>
          )}
          {examResult.attempt?.started_at && (
            <Text style={{ 
              color: colors.textSecondary, 
              fontSize: 12
            }}>
              Started: {new Date(examResult.attempt.started_at).toLocaleString()}
            </Text>
          )}
        </View>

        {/* Leaderboard */}
        {examResult.leaderboard && examResult.leaderboard.length > 0 && (
          <View style={{ 
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 8,
            marginBottom: 12
          }}>
            <Text style={{ 
              fontWeight: 'bold', 
              color: colors.text, 
              marginBottom: 8 
            }}>
              🏅 Leaderboard
            </Text>
            {examResult.leaderboard.map((entry: any, index: number) => (
              <View key={index} style={{ 
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 6,
                borderBottomWidth: index < examResult.leaderboard.length - 1 ? 1 : 0,
                borderBottomColor: colors.border || '#e0e0e0',
                backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ 
                    fontWeight: 'bold',
                    color: index === 0 ? '#ffd700' : colors.text,
                    marginRight: 8,
                    fontSize: index === 0 ? 18 : 14
                  }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </Text>
                  <Text style={{ color: colors.text }}>
                    {entry.student_name}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary, marginRight: 8 }}>
                    {entry.score} pts
                  </Text>
                  <Text style={{ 
                    color: getGradeColor(entry.grade),
                    fontWeight: 'bold'
                  }}>
                    {entry.grade}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Certificate Section - Download Only */}
        {examResult.certificate_url && (
          <View style={{ 
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 8,
            marginBottom: 12
          }}>
            <Text style={{ 
              fontWeight: 'bold', 
              color: colors.text, 
              marginBottom: 12 
            }}>
              📜 Certificate
            </Text>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#28a745',
                padding: 14,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8
              }}
              onPress={() => downloadCertificate(examResult.certificate_url)}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color="white" />
                  <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>
                    Download Certificate
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: '#17a2b8',
                padding: 14,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={() => shareCertificate(examResult.certificate_url)}
              disabled={downloading}
            >
              <Ionicons name="share-outline" size={20} color="white" />
              <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>
                Share Certificate
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Question-wise answers */}
        {examResult.attempt?.answers && Object.keys(examResult.attempt.answers).length > 0 && (
          <View style={{ 
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 8,
            marginBottom: 12
          }}>
            <Text style={{ 
              fontWeight: 'bold', 
              color: colors.text, 
              marginBottom: 8 
            }}>
              📝 Your Answers
            </Text>
            {Object.entries(examResult.attempt.answers).map(([questionId, answer], index) => (
              <View key={index} style={{ 
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 6,
                borderBottomWidth: index < Object.keys(examResult.attempt.answers).length - 1 ? 1 : 0,
                borderBottomColor: colors.border || '#e0e0e0'
              }}>
                <Text style={{ color: colors.text }}>
                  Q{index + 1}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  Answer: {answer || 'Not answered'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Performance Tips */}
        {examResult.attempt?.percentage < 40 && (
          <View style={{ 
            backgroundColor: '#fff3cd',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12
          }}>
            <Text style={{ color: '#856404', fontSize: 13 }}>
              💡 Tip: Review the topics you got wrong and practice more.
            </Text>
          </View>
        )}

        {examResult.attempt?.percentage >= 80 && (
          <View style={{ 
            backgroundColor: '#d4edda',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12
          }}>
            <Text style={{ color: '#155724', fontSize: 13 }}>
              🎉 Excellent performance! Keep up the good work!
            </Text>
          </View>
        )}

        {examResult.attempt?.percentage >= 60 && examResult.attempt?.percentage < 80 && (
          <View style={{ 
            backgroundColor: '#cce5ff',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12
          }}>
            <Text style={{ color: '#004085', fontSize: 13 }}>
              💪 Good job! Focus on the topics where you lost marks to improve further.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ExamResultScreen;
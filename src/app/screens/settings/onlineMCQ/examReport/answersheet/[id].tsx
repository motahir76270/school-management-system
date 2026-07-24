import { View, Text, useColorScheme, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import HeaderSection from '@/components/features/header'
import { FullScreenLoader } from '@/hooks/use-screensLoder'
import { useDispatch, useSelector } from 'react-redux'
import { Colors } from '@/constants/theme'
import { getExamResportAnswerSheetApiCall } from '@/redux/examSlice/teacherExamSlice'
import { useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { WebView } from 'react-native-webview'

const { height, width } = Dimensions.get('window')

// ============= SHARABLE PDF HTML GENERATOR =============
// This function can be exported and used anywhere in the app
export const generatePDFHTML = (pdfBase64: string, title: string = 'PDF Viewer') => {
  if (!pdfBase64) return ''
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
        <title>${title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            background: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            height: 100vh;
            overflow: auto;
          }
          #viewer {
            width: 100%;
            min-height: 100%;
            padding: 10px;
          }
          .page-container {
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin: 10px auto;
            max-width: 100%;
            overflow: hidden;
            border-radius: 4px;
          }
          canvas {
            display: block;
            width: 100%;
            height: auto;
          }
          .loading-text {
            text-align: center;
            padding: 40px;
            color: #666;
            font-size: 16px;
          }
          .error-text {
            text-align: center;
            padding: 40px;
            color: #F44336;
            font-size: 16px;
          }
          .pdf-info {
            text-align: center;
            padding: 10px;
            color: #999;
            font-size: 12px;
            background: #fff;
            margin: 10px auto;
            max-width: 90%;
            border-radius: 4px;
          }
          @media print {
            body { background: white; }
            .page-container { 
              box-shadow: none; 
              margin: 0 auto;
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <div id="viewer">
          <div class="loading-text">Loading PDF...</div>
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script>
          (function() {
            const pdfData = '${pdfBase64}';
            const title = '${title}';
            
            // Set worker source
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const viewer = document.getElementById('viewer');
            
            // Update document title
            document.title = title;
            
            async function renderPDF() {
              try {
                // Convert base64 to Uint8Array
                const binaryString = atob(pdfData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                
                // Load PDF
                const loadingTask = pdfjsLib.getDocument({ data: bytes });
                const pdf = await loadingTask.promise;
                const totalPages = pdf.numPages;
                
                // Clear viewer
                viewer.innerHTML = '';
                
                // Add info
                const infoDiv = document.createElement('div');
                infoDiv.className = 'pdf-info';
                infoDiv.textContent = \`Page 1 of \${totalPages} | \${title}\`;
                viewer.appendChild(infoDiv);
                
                // Render all pages
                for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                  const page = await pdf.getPage(pageNum);
                  
                  const container = document.createElement('div');
                  container.className = 'page-container';
                  container.id = \`page-\${pageNum}\`;
                  
                  const canvas = document.createElement('canvas');
                  container.appendChild(canvas);
                  viewer.appendChild(container);
                  
                  // Calculate viewport with responsive scaling
                  const scale = Math.min(1.5, (window.innerWidth - 40) / page.getViewport({ scale: 1 }).width);
                  const viewport = page.getViewport({ scale: Math.max(scale, 0.8) });
                  const context = canvas.getContext('2d');
                  
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;
                  
                  const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                  };
                  
                  await page.render(renderContext).promise;
                  
                  // Update page info on scroll
                  if (pageNum === 1) {
                    // Set up intersection observer for page tracking
                    const observer = new IntersectionObserver((entries) => {
                      entries.forEach(entry => {
                        if (entry.isIntersecting) {
                          const pageId = entry.target.id;
                          const pageNumber = pageId.split('-')[1];
                          const infoDiv = document.querySelector('.pdf-info');
                          if (infoDiv) {
                            infoDiv.textContent = \`Page \${pageNumber} of \${totalPages} | \${title}\`;
                          }
                        }
                      });
                    }, { threshold: 0.5 });
                    
                    // Observe all page containers
                    document.querySelectorAll('.page-container').forEach(el => {
                      observer.observe(el);
                    });
                  }
                }
                
                // Post success message
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage('SUCCESS');
                }
                
              } catch (error) {
                console.error('Error rendering PDF:', error);
                viewer.innerHTML = \`
                  <div class="error-text">
                    <p>Failed to render PDF</p>
                    <p style="font-size: 14px; margin-top: 8px;">\${error.message || 'Please try again'}</p>
                  </div>
                \`;
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage('ERROR');
                }
              }
            }
            
            // Handle window resize for responsive rendering
            let resizeTimeout;
            window.addEventListener('resize', () => {
              clearTimeout(resizeTimeout);
              resizeTimeout = setTimeout(() => {
                renderPDF();
              }, 500);
            });
            
            renderPDF();
          })();
        </script>
      </body>
    </html>
  `;
};

// ============= MAIN COMPONENT =============
const ReportAnswerSheetScreen = () => {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme]
  const { examAnswerSheet, loading } = useSelector((state: any) => state.teacherExam)
  const { id, attemptId } = useLocalSearchParams()
  const dispatch = useDispatch()
  
  const [pdfModalVisible, setPdfModalVisible] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(true)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)

  useEffect(() => {
    if (id && attemptId) {
      getExamResportAnswerSheetApiCall(dispatch, id, attemptId)
    }
  }, [id, attemptId])

  const getStatusColor = (isCorrect: boolean | null) => {
    if (isCorrect === true) return '#4CAF50'
    if (isCorrect === false) return '#FF3B30'
    return '#FFC107'
  }

  const getStatusIcon = (isCorrect: boolean | null) => {
    if (isCorrect === true) return 'check-circle'
    if (isCorrect === false) return 'x-circle'
    return 'minus-circle'
  }

  const getStatusLabel = (isCorrect: boolean | null) => {
    if (isCorrect === true) return 'Correct'
    if (isCorrect === false) return 'Wrong'
    return 'Skipped'
  }

  const fetchPDFWithToken = async (url: string) => {
    try {
      setPdfLoading(true)
      setPdfError(null)
      
      const token = await AsyncStorage.getItem('token')
      const parsedToken = token && token.startsWith('"') ? JSON.parse(token) : token
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${parsedToken}`,
          'Accept': 'application/pdf',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to load PDF: ${response.status}`)
      }

      const blob = await response.blob()
      const reader = new FileReader()
      
      reader.onload = () => {
        try {
          const base64Data = reader.result as string
          const base64String = base64Data.split(',')[1]
          setPdfBase64(base64String)
          setPdfLoading(false)
        } catch (err) {
          console.error('Error processing PDF:', err)
          setPdfError('Failed to process PDF')
          setPdfLoading(false)
        }
      }

      reader.onerror = () => {
        console.error('Error reading blob')
        setPdfError('Failed to read PDF file')
        setPdfLoading(false)
      }

      reader.readAsDataURL(blob)
      
    } catch (error: any) {
      console.error('Error fetching PDF:', error)
      setPdfError(error.message || 'Failed to load PDF')
      setPdfLoading(false)
    }
  }

  const openPDFModal = async () => {
    const pdfUrl = examAnswerSheet?.pdf_url
    if (pdfUrl) {
      setPdfModalVisible(true)
      await fetchPDFWithToken(pdfUrl)
    }
  }

  const closePDFModal = () => {
    setPdfModalVisible(false)
    setTimeout(() => {
      setPdfBase64(null)
      setPdfLoading(true)
      setPdfError(null)
    }, 300)
  }

  const handleRetry = () => {
    const pdfUrl = examAnswerSheet?.pdf_url
    if (pdfUrl) {
      fetchPDFWithToken(pdfUrl)
    }
  }

  const attempt = examAnswerSheet?.attempt
  const answerSheet = examAnswerSheet?.answer_sheet || []
  const pdfUrl = examAnswerSheet?.pdf_url
  const examTitle = examAnswerSheet?.exam?.title || 'Answer Sheet'

  // Generate PDF HTML using the sharable function
  const getPDFHTML = () => {
    return generatePDFHTML(pdfBase64 || '', `${examTitle} - Answer Sheet`)
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#f5f5f5' }]}>
      <HeaderSection title="Answer Sheet" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Student Info */}
        {attempt && (
          <View style={[styles.studentCard, { backgroundColor: colors.card || '#fff' }]}>
            <View style={styles.studentHeader}>
              <View style={styles.studentAvatar}>
                <Text style={styles.avatarText}>
                  {attempt.student?.full_name?.charAt(0) || 'S'}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: colors.text || '#333' }]}>
                  {attempt.student?.full_name || 'Unknown Student'}
                </Text>
                <Text style={[styles.studentDetails, { color: colors.text || '#666' }]}>
                  Roll: {attempt.student?.roll_no || 'N/A'} | ID: {attempt.student?.student_id || 'N/A'}
                </Text>
                <Text style={[styles.studentDetails, { color: colors.text || '#666' }]}>
                  {attempt.student?.class || ''} - {attempt.student?.section || ''}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Attempt Summary */}
        {attempt && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card || '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text || '#333' }]}>
              Attempt Summary
            </Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Score</Text>
                <Text style={[styles.summaryValue, { color: colors.text || '#333' }]}>
                  {attempt.score || 0}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Percentage</Text>
                <Text style={[styles.summaryValue, { color: colors.text || '#333' }]}>
                  {attempt.percentage || 0}%
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Grade</Text>
                <Text style={[styles.summaryValue, { color: attempt.grade === 'F' ? '#FF3B30' : '#4CAF50' }]}>
                  {attempt.grade || 'N/A'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: attempt.status === 'submitted' ? '#4CAF5020' : '#FFC10720' }]}>
                  <View style={[styles.statusDot, { backgroundColor: attempt.status === 'submitted' ? '#4CAF50' : '#FFC107' }]} />
                  <Text style={[styles.statusText, { color: attempt.status === 'submitted' ? '#4CAF50' : '#FFC107' }]}>
                    {attempt.status || 'Pending'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.attemptStats}>
              <View style={styles.attemptStat}>
                <Feather name="check-circle" size={16} color="#4CAF50" />
                <Text style={[styles.attemptStatText, { color: colors.text || '#666' }]}>
                  Correct: {attempt.correct_count || 0}
                </Text>
              </View>
              <View style={styles.attemptStat}>
                <Feather name="x-circle" size={16} color="#FF3B30" />
                <Text style={[styles.attemptStatText, { color: colors.text || '#666' }]}>
                  Wrong: {attempt.wrong_count || 0}
                </Text>
              </View>
              <View style={styles.attemptStat}>
                <Feather name="clock" size={16} color={colors.text || '#666'} />
                <Text style={[styles.attemptStatText, { color: colors.text || '#666' }]}>
                  Started: {attempt.started_at_label || 'N/A'}
                </Text>
              </View>
              <View style={styles.attemptStat}>
                <Feather name="calendar" size={16} color={colors.text || '#666'} />
                <Text style={[styles.attemptStatText, { color: colors.text || '#666' }]}>
                  Submitted: {attempt.submitted_at_label || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Answer Sheet */}
        {answerSheet.length > 0 && (
          <View style={[styles.answerSheetCard, { backgroundColor: colors.card || '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text || '#333' }]}>
              Answer Sheet
            </Text>
            {answerSheet.map((item: any, index: number) => (
              <View key={item.question_id} style={[styles.questionItem, index < answerSheet.length - 1 && styles.questionDivider]}>
                <View style={styles.questionHeader}>
                  <View style={styles.questionNumber}>
                    <Text style={[styles.questionNumberText, { color: colors.text || '#333' }]}>
                      Q{index + 1}
                    </Text>
                  </View>
                  <View style={[
                    styles.questionStatus,
                    { backgroundColor: getStatusColor(item.is_correct) + '20' }
                  ]}>
                    <Feather
                      name={getStatusIcon(item.is_correct)}
                      size={16}
                      color={getStatusColor(item.is_correct)}
                    />
                    <Text style={[styles.questionStatusText, { color: getStatusColor(item.is_correct) }]}>
                      {getStatusLabel(item.is_correct)}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.questionText, { color: colors.text || '#333' }]}>
                  {item.question}
                </Text>

                <View style={styles.answerGrid}>
                  <View style={styles.answerItem}>
                    <Text style={[styles.answerLabel, { color: colors.text || '#666' }]}>
                      Your Answer:
                    </Text>
                    <Text style={[styles.answerValue, { color: colors.text || '#333' }]}>
                      {item.given_label || '—'}
                    </Text>
                  </View>
                  <View style={styles.answerItem}>
                    <Text style={[styles.answerLabel, { color: colors.text || '#666' }]}>
                      Correct Answer:
                    </Text>
                    <Text style={[styles.answerValue, { color: '#4CAF50' }]}>
                      {item.correct_label || '—'}
                    </Text>
                  </View>
                  <View style={styles.answerItem}>
                    <Text style={[styles.answerLabel, { color: colors.text || '#666' }]}>
                      Marks:
                    </Text>
                    <Text style={[styles.answerValue, { color: colors.text || '#333' }]}>
                      {item.earned || 0}/{item.marks || 0}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* View PDF Button */}
        {pdfUrl && (
          <TouchableOpacity
            style={[styles.viewPDFButton, { backgroundColor: colors.primary || '#4CAF50' }]}
            onPress={openPDFModal}
          >
            <Feather name="file-text" size={20} color="#fff" />
            <Text style={styles.viewPDFButtonText}>View Answer Sheet PDF</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* PDF Modal with 80% max height */}
      <Modal
        visible={pdfModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePDFModal}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background || '#f5f5f5' }]}>
            <View style={[styles.modalHeader, { backgroundColor: colors.card || '#fff', borderBottomColor: colors.border || '#e0e0e0' }]}>
              <TouchableOpacity onPress={closePDFModal} style={styles.modalCloseButton}>
                <Feather name="arrow-left" size={24} color={colors.text || '#333'} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text || '#333' }]}>
                Answer Sheet PDF
              </Text>
              <TouchableOpacity onPress={closePDFModal} style={styles.modalCloseButton}>
                <Feather name="x" size={24} color={colors.text || '#333'} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {pdfLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary || '#4CAF50'} />
                  <Text style={[styles.loadingText, { color: colors.text || '#666' }]}>
                    Loading PDF...
                  </Text>
                </View>
              ) : pdfError ? (
                <View style={styles.errorContainer}>
                  <Feather name="alert-circle" size={48} color="#FF3B30" />
                  <Text style={[styles.errorText, { color: colors.text || '#333' }]}>
                    Failed to load PDF
                  </Text>
                  <Text style={[styles.errorSubtext, { color: colors.text || '#666' }]}>
                    {pdfError}
                  </Text>
                  <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.primary || '#4CAF50' }]}
                    onPress={handleRetry}
                  >
                    <Feather name="refresh-cw" size={16} color="#fff" />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : pdfBase64 ? (
                <WebView
                  source={{ html: getPDFHTML() }}
                  style={styles.webView}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  scalesPageToFit={true}
                  originWhitelist={['*']}
                  startInLoadingState={true}
                  renderLoading={() => (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={colors.primary || '#4CAF50'} />
                      <Text style={[styles.loadingText, { color: colors.text || '#666' }]}>
                        Rendering PDF...
                      </Text>
                    </View>
                  )}
                  onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent
                    console.error('WebView error:', nativeEvent)
                    setPdfError('WebView error: ' + (nativeEvent.description || 'Unknown error'))
                    setPdfLoading(false)
                  }}
                  onMessage={(event) => {
                    if (event.nativeEvent.data === 'ERROR') {
                      setPdfError('Failed to render PDF. Please try again.')
                      setPdfLoading(false)
                    }
                  }}
                  onLoadEnd={() => {
                    setPdfLoading(false)
                  }}
                  mixedContentMode="always"
                  allowUniversalAccessFromFileURLs={true}
                  allowFileAccess={true}
                />
              ) : (
                <View style={styles.errorContainer}>
                  <Feather name="file" size={48} color={colors.text || '#ccc'} />
                  <Text style={[styles.errorText, { color: colors.text || '#333' }]}>
                    No PDF content available
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <FullScreenLoader loading={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  studentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
  },
  studentDetails: {
    fontSize: 13,
    marginTop: 2,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  attemptStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  attemptStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  attemptStatText: {
    fontSize: 12,
  },
  answerSheetCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  questionItem: {
    paddingVertical: 12,
  },
  questionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  questionStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 15,
    marginBottom: 8,
  },
  answerGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  answerItem: {
    flex: 1,
  },
  answerLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  answerValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewPDFButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  viewPDFButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight:"80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    // flex: 1,
    minHeight: "90%",
  },
  webView: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 12,
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
})

export default ReportAnswerSheetScreen
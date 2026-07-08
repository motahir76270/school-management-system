import React, { useState, useCallback } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { File, Directory, Paths } from 'expo-file-system'
import * as Haptics from 'expo-haptics'
import * as Sharing from 'expo-sharing'

interface ViewClassNotesModalProps {
  visible: boolean
  onClose: () => void
  note: any 
}

const ViewClassNotesModal = ({ 
  visible, 
  onClose, 
  note,
}: ViewClassNotesModalProps) => {
  const [downloading, setDownloading] = useState(false)

  // Format date
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }, [])

  // Get file icon based on file type
  const getFileIcon = useCallback((fileType?: string) => {
    if (!fileType) return 'document-outline'
    
    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return 'document-text-outline'
    if (type.includes('doc') || type.includes('word')) return 'document-text-outline'
    if (type.includes('ppt') || type.includes('powerpoint')) return 'document-text-outline'
    if (type.includes('xls') || type.includes('excel')) return 'document-text-outline'
    if (type.includes('image')) return 'image-outline'
    if (type.includes('video')) return 'videocam-outline'
    if (type.includes('audio')) return 'musical-notes-outline'
    return 'document-outline'
  }, [])

  // Get file color based on file type
  const getFileColor = useCallback((fileType?: string) => {
    if (!fileType) return '#6B7280'
    
    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return '#EF4444'
    if (type.includes('doc') || type.includes('word')) return '#2563EB'
    if (type.includes('ppt') || type.includes('powerpoint')) return '#F59E0B'
    if (type.includes('xls') || type.includes('excel')) return '#10B981'
    if (type.includes('image')) return '#8B5CF6'
    if (type.includes('video')) return '#EC4899'
    if (type.includes('audio')) return '#3B82F6'
    return '#6B7280'
  }, [])

  // Open file in browser or external app
  const handleOpenFile = useCallback(async () => {
    if (!note?.file_url) {
      Alert.alert('Error', 'No file available to view')
      return
    }

    try {
      const fileUrl = note.file_url
      
      // Check if URL is valid
      const canOpen = await Linking.canOpenURL(fileUrl)
      
      if (canOpen) {
        await Linking.openURL(fileUrl)
      } else {
        Alert.alert('Error', 'Cannot open this file type on this device')
      }
    } catch (error) {
      console.error('Open file error:', error)
      Alert.alert('Error', 'Failed to open file. Please try again.')
    }
  }, [note])

  // Handle video URL
  const handleOpenVideo = useCallback(async () => {
    if (!note?.video_url) {
      Alert.alert('Error', 'No video available')
      return
    }

    try {
      const videoUrl = note.video_url
      const canOpen = await Linking.canOpenURL(videoUrl)
      
      if (canOpen) {
        await Linking.openURL(videoUrl)
      } else {
        Alert.alert('Error', 'Cannot open video URL')
      }
    } catch (error) {
      console.error('Open video error:', error)
      Alert.alert('Error', 'Failed to open video. Please try again.')
    }
  }, [note])

  if (!note) return null

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="document-text-outline" size={24} color="#2563EB" />
                <Text style={styles.modalHeaderTitle}>Note Details</Text>
              </View>
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Title */}
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="book-outline" size={20} color="#6B7280" />
                  <Text style={styles.detailLabel}>Title</Text>
                </View>
                <Text style={styles.detailValue}>{note.title || 'N/A'}</Text>
              </View>

              {/* Chapter */}
              {note.chapter && (
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Ionicons name="bookmark-outline" size={20} color="#6B7280" />
                    <Text style={styles.detailLabel}>Chapter</Text>
                  </View>
                  <Text style={styles.detailValue}>{note.chapter}</Text>
                </View>
              )}

              {/* Description */}
              {note.description && (
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Ionicons name="text-outline" size={20} color="#6B7280" />
                    <Text style={styles.detailLabel}>Description</Text>
                  </View>
                  <Text style={styles.detailValue}>{note.description}</Text>
                </View>
              )}

              {/* Class Information */}
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="school-outline" size={20} color="#6B7280" />
                  <Text style={styles.detailLabel}>Class Information</Text>
                </View>
                <View style={styles.infoGrid}>
                  {note.class_name && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Class:</Text>
                      <Text style={styles.infoValue}>{note.class_name}</Text>
                    </View>
                  )}
                  {note.section_name && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Section:</Text>
                      <Text style={styles.infoValue}>{note.section_name}</Text>
                    </View>
                  )}
                  {note.subject_name && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Subject:</Text>
                      <Text style={styles.infoValue}>{note.subject_name}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* File Attachment */}
              {note.file_url && (
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Ionicons name="attach-outline" size={20} color="#6B7280" />
                    <Text style={styles.detailLabel}>File Attachment</Text>
                  </View>
                  
                  <View style={styles.fileCard}>
                    <View style={styles.fileInfo}>
                      <View style={[
                        styles.fileIconContainer,
                        { backgroundColor: getFileColor(note.file_type) + '20' }
                      ]}>
                        <Ionicons 
                          name={getFileIcon(note.file_type)} 
                          size={32} 
                          color={getFileColor(note.file_type)} 
                        />
                      </View>
                      <View style={styles.fileDetails}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {note.file_url.split('/').pop() || 'File'}
                        </Text>
                        <Text style={styles.fileType}>
                          {note.file_type || 'Unknown type'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.fileActions}>
                      <TouchableOpacity 
                        style={styles.fileActionButton}
                        onPress={handleOpenFile}
                      >
                        <Ionicons name="eye-outline" size={20} color="#2563EB" />
                        <Text style={styles.fileActionText}>View</Text>
                      </TouchableOpacity>     
                    </View>
                  </View>
                </View>
              )}

              {/* Video URL */}
              {note.video_url && (
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Ionicons name="videocam-outline" size={20} color="#6B7280" />
                    <Text style={styles.detailLabel}>Video Link</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.videoCard}
                    onPress={handleOpenVideo}
                  >
                    <View style={styles.videoInfo}>
                      <Ionicons name="play-circle-outline" size={40} color="#EC4899" />
                      <View style={styles.videoDetails}>
                        <Text style={styles.videoLabel}>Watch Video</Text>
                        <Text style={styles.videoUrl} numberOfLines={1}>
                          {note.video_url}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Created Information */}
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                  <Text style={styles.detailLabel}>Created</Text>
                </View>
                <Text style={styles.detailValue}>
                  {note.teacher_name ? `By ${note.teacher_name}` : ''}
                  {note.teacher_name && note.created_at ? ' - ' : ''}
                  {formatDate(note.created_at)}
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButtonBottom}
                onPress={onClose}
              >
                <Ionicons name="close-circle-outline" size={20} color="#6B7280" />
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>

              <View style={styles.bottomSpacer} />
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  detailSection: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  infoGrid: {
    marginTop: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 70,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  fileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  fileType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  fileActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  fileActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  fileActionButtonPrimary: {
    backgroundColor: '#2563EB',
  },
  fileActionButtonSecondary: {
    backgroundColor: '#F5F3FF',
  },
  fileActionText: {
    fontSize: 14,
    color: '#2563EB',
    marginLeft: 6,
    fontWeight: '500',
  },
  fileActionTextPrimary: {
    color: 'white',
  },
  fileActionTextSecondary: {
    color: '#7C3AED',
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  videoDetails: {
    marginLeft: 12,
    flex: 1,
  },
  videoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  videoUrl: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButtonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
})

export default ViewClassNotesModal
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, TextInput, ScrollView, Modal, LayoutAnimation, UIManager, Platform } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { Picker } from '@react-native-picker/picker'
import HeaderSection from '@/components/features/header'
import { getAttendanceHistory, getStudentSectionTypes } from '@/hooks/apiCalls/teacher'
import { FullScreenLoader } from '@/hooks/use-screensLoder'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DateTimePicker from '@react-native-community/datetimepicker'

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface HistoryRecord {
  id: string
  date: string
  date_label: string
  status: string
  status_label: string
  method: string
  remarks: string | null
  student: {
    id: string
    full_name: string
    student_id: string
    roll_no: string
    class: string
    section: string
  }
}

interface HistoryStats {
  total: number
  present: number
  absent: number
  late: number
  half_day: number
}

interface HistoryResponse {
  success: boolean
  message: string
  month: string
  month_label: string
  stats: HistoryStats
  count: number
  records: HistoryRecord[]
}

const history = () => {
  const [loading, setLoading] = useState(false)
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null)
  const [classOptions, setClassOptions] = useState<any[]>([])
  const [sectionOptions, setSectionOptions] = useState<any[]>([])
  const [classesData, setClassesData] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [filteredRecords, setFilteredRecords] = useState<HistoryRecord[]>([])
  const [showFilters, setShowFilters] = useState(true)
  const [showStats, setShowStats] = useState(true)
  const safeInset = useSafeAreaInsets()

  // Toggle functions with animation
  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setShowFilters(!showFilters)
  }

  const toggleStats = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setShowStats(!showStats)
  }

  // Fetch section types for dropdowns
  const fetchStudentSectionTypes = async () => {
    try {
      setLoading(true)
      const res = await getStudentSectionTypes()
      if (res.success === true) {
        const classes = res.classes.map((item: any) => ({
          label: item.name,
          value: item.id
        }))
        setClassOptions(classes)
        setClassesData(res.classes)
      }
    } catch (error) {
      console.error("Error fetching section types:", error)
      Alert.alert('Error', 'Failed to fetch section types')
    } finally {
      setLoading(false)
    }
  }

  // Update sections when class is selected
  useEffect(() => {
    if (selectedClass && classesData.length > 0) {
      const selectedClassData: any = classesData.find((item: any) => item.id === selectedClass)
      if (selectedClassData) {
        const sections = selectedClassData.sections || []
        const options = sections.map((section: any) => ({
          label: section.name,
          value: section.id
        }))
        setSectionOptions(options)
        setSelectedSection('')
      }
    }
  }, [selectedClass, classesData])

  // Handle attendance history fetch
  const handleAttendanceHistory = async () => {
    try {
      setLoading(true)
      
      const month = selectedMonth.toISOString().slice(0, 7)
      
      const payload = {
        class_id: selectedClass || null,
        section_id: selectedSection || null,
        month: month,
        search: searchQuery || ""
      }
      
      const res = await getAttendanceHistory(payload)
      
      if (res && res.success) {
        setHistoryData(res)
        setFilteredRecords(res.records || [])
        
        if (res.records && res.records.length === 0) {
          Alert.alert('Info', 'No attendance records found for the selected filters')
        }
      } else {
        Alert.alert('Error', res?.message || 'Failed to fetch history')
      }
    } catch (error) {
      console.error("Error fetching history:", error)
      Alert.alert('Error', 'Failed to fetch attendance history')
    } finally {
      setLoading(false)
    }
  }

  // Filter records when search changes
  useEffect(() => {
    if (historyData?.records) {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const filtered = historyData.records.filter(record => {
          const name = record.student.full_name?.toLowerCase() || ''
          const rollNo = record.student.roll_no?.toLowerCase() || ''
          const studentId = record.student.student_id?.toLowerCase() || ''
          const status = record.status_label?.toLowerCase() || ''
          const className = record.student.class?.toLowerCase() || ''
          const section = record.student.section?.toLowerCase() || ''
          
          return name.includes(query) || 
                 rollNo.includes(query) || 
                 studentId.includes(query) ||
                 status.includes(query) ||
                 className.includes(query) ||
                 section.includes(query)
        })
        setFilteredRecords(filtered)
      } else {
        setFilteredRecords(historyData.records)
      }
    }
  }, [searchQuery, historyData])

  // Clear filters
  const clearFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setSelectedClass('')
    setSelectedSection('')
    setSearchQuery('')
    setSelectedMonth(new Date())
    setHistoryData(null)
    setFilteredRecords([])
    setSectionOptions([])
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'present': return '#34C759'
      case 'absent': return '#FF3B30'
      case 'halfday': return '#FF9500'
      case 'late': return '#FF6B35'
      default: return '#8E8E93'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'present': return '✅'
      case 'absent': return '❌'
      case 'halfday': return '🌓'
      case 'late': return '⏰'
      default: return '📋'
    }
  }

  // Get status background color
  const getStatusBgColor = (status: string) => {
    switch(status) {
      case 'present': return '#e8f5e9'
      case 'absent': return '#ffebee'
      case 'halfday': return '#fff8e1'
      case 'late': return '#fff3e0'
      default: return '#f5f5f5'
    }
  }

  

  // Render individual record
  const renderRecord = ({ item }: { item: HistoryRecord }) => {
    const statusColor = getStatusColor(item.status)
    const statusBg = getStatusBgColor(item.status)
    
    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordLeft}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <View style={styles.recordInfo}>
              <Text style={styles.studentName}>{item.student.full_name}</Text>
              <View style={styles.recordMeta}>
                <Text style={styles.metaText}>Roll: {item.student.roll_no}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>ID: {item.student.student_id}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.recordRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status_label}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.recordFooter}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>Class: {item.student.class}</Text>
            <Text style={styles.footerDot}>•</Text>
            <Text style={styles.footerText}>Section: {item.student.section}</Text>
            {item.method && (
              <>
                <Text style={styles.footerDot}>•</Text>
                <Text style={[styles.footerText, styles.methodText]}>{item.method}</Text>
              </>
            )}
          </View>
          <Text style={styles.dateText}>{item.date_label}</Text>
        </View>
        
        {item.remarks && (
          <View style={styles.remarksContainer}>
            <Text style={styles.remarksLabel}>💬</Text>
            <Text style={styles.remarksText}>{item.remarks}</Text>
          </View>
        )}
      </View>
    )
  }

  // Date picker modal
  const renderDatePicker = () => {
    if (!showDatePicker) return null
    
    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <DateTimePicker
              value={selectedMonth}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                if (date) {
                  setSelectedMonth(date)
                }
              }}
              style={styles.datePicker}
            />
            
            <TouchableOpacity 
              style={styles.modalConfirmButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.modalConfirmText}>Confirm Month</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  // Initial load
  useEffect(() => {
    fetchStudentSectionTypes()
  }, [])

  return (
    <View style={styles.container}>
      <HeaderSection title="History" />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterHeader} onPress={toggleFilters}>
          <View style={styles.filterHeaderLeft}>
            <Text style={styles.filterHeaderIcon}>🔍</Text>
            <Text style={styles.filterHeaderTitle}>Filters</Text>
            {historyData && (
              <View style={styles.resultCount}>
                <Text style={styles.resultCountText}>{historyData.count} records</Text>
              </View>
            )}
          </View>
          <Text style={[styles.filterHeaderArrow, !showFilters && styles.filterHeaderArrowDown]}>
            ▼
          </Text>
        </TouchableOpacity>
        
        {showFilters && (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.filterBody}>
              {/* Class and Section Pickers */}
              <View style={styles.pickerRow}>
                <View style={[styles.pickerWrapper, styles.pickerWrapperHalf]}>
                  <Text style={styles.label}>Class</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedClass}
                      onValueChange={setSelectedClass}
                      style={styles.picker}
                      dropdownIconColor="#007AFF"
                    >
                      <Picker.Item label="All Classes" value="" />
                      {classOptions.map((item: any) => (
                        <Picker.Item key={item.value} label={item.label} value={item.value} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={[styles.pickerWrapper, styles.pickerWrapperHalf]}>
                  <Text style={styles.label}>Section</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedSection}
                      onValueChange={setSelectedSection}
                      enabled={!!selectedClass}
                      style={styles.picker}
                      dropdownIconColor="#007AFF"
                    >
                      <Picker.Item label="All Sections" value="" />
                      {sectionOptions.length > 0 ? (
                        sectionOptions.map((item: any) => (
                          <Picker.Item key={item.value} label={item.label} value={item.value} />
                        ))
                      ) : (
                        <Picker.Item label="Select class first" value="" />
                      )}
                    </Picker>
                  </View>
                </View>
              </View>

              {/* Month Picker */}
              <View style={styles.monthContainer}>
                <Text style={styles.label}>Month</Text>
                <TouchableOpacity 
                  style={styles.monthPicker}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.monthText}>
                    {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </Text>
                  <Text style={styles.monthIcon}>📅</Text>
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name, roll no, or status..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.loadButton}
                  onPress={handleAttendanceHistory}
                  disabled={loading}
                >
                  <Text style={styles.loadButtonText}>
                    {loading ? 'Loading...' : '📊 Load History'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={clearFilters}
                  disabled={loading}
                >
                  <Text style={styles.resetButtonText}>↺ Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </View>


      {/* Records List */}
      <View style={styles.listWrapper}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecords}
            keyExtractor={(item) => item.id}
            renderItem={renderRecord}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No matching records found' : 'No attendance records'}
                </Text>
                <Text style={styles.emptySubText}>
                  {searchQuery 
                    ? 'Try adjusting your search' 
                    : 'Select filters and tap "Load History"'}
                </Text>
              </View>
            }
            contentContainerStyle={[styles.listContent, { paddingBottom: safeInset.bottom || 16 }]}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        )}
      </View>

      {renderDatePicker()}
      <FullScreenLoader loading={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'white',
  },
  filterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterHeaderIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  filterHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultCount: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 10,
  },
  resultCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  filterHeaderArrow: {
    fontSize: 16,
    color: '#666',
    transform: [{ rotate: '0deg' }],
  },
  filterHeaderArrowDown: {
    transform: [{ rotate: '-90deg' }],
  },
  filterBody: {
    padding: 16,
    paddingTop: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  pickerWrapper: {
    marginBottom: 8,
  },
  pickerWrapperHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
    height: 50,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  monthContainer: {
    marginBottom: 12,
  },
  monthPicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 50,
  },
  monthText: {
    fontSize: 16,
    color: '#333',
  },
  monthIcon: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  loadButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 12,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'white',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderArrow: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    transform: [{ rotate: '0deg' }],
  },
  sectionHeaderArrowDown: {
    transform: [{ rotate: '-90deg' }],
  },
  statsMonth: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    paddingTop: 0,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  statTotal: {
    backgroundColor: '#e3f2fd',
  },
  statPresent: {
    backgroundColor: '#e8f5e9',
  },
  statAbsent: {
    backgroundColor: '#ffebee',
  },
  statLate: {
    backgroundColor: '#fff3e0',
  },
  statHalfDay: {
    backgroundColor: '#fff8e1',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    paddingTop: 8,
  },
  recordCard: {
    backgroundColor: 'white',
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  recordInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  metaDot: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 4,
  },
  recordRight: {
    flexShrink: 0,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
  footerDot: {
    fontSize: 12,
    color: '#888',
    marginHorizontal: 4,
  },
  methodText: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  remarksLabel: {
    fontSize: 14,
    marginRight: 6,
  },
  remarksText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    fontStyle: 'italic',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalClose: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  datePicker: {
    height: 200,
  },
  modalConfirmButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  modalConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default history
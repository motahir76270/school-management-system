// SalarySlipsScreen.tsx
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import HeaderSection from '@/components/features/header'
import { getSalaryHistory } from '@/hooks/apiCalls/teacher'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'

const SalarySlipsScreen = () => {
  const [salaryData, setSalaryData] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [token, setToken] = useState("")
  const router = useRouter()

  useEffect(() => {
    getToken()
    fetchSalarySlips()
  }, [])

  const getToken = async () => {
    try {
      const tokenData = await AsyncStorage.getItem("token")
      if (tokenData) {
        setToken(JSON.parse(tokenData))
      }
    } catch (error) {
      console.error('Error getting token:', error)
    }
  }

  const fetchSalarySlips = async (month?: Date) => {
    try {
      setLoading(true)
      const monthToFetch = month || selectedMonth
      const year = monthToFetch.getFullYear()
      const monthNum = String(monthToFetch.getMonth() + 1).padStart(2, '0')
      const period = `${year}-${monthNum}`
      
      const res = await getSalaryHistory(period)
      
      if (res?.success) {
        setSalaryData(res)
        setRecords(res.records || [])
      }
    } catch (error) {
      console.error('Error fetching salary slips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // For Android, close picker after selection
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    
    if (selectedDate) {
      setSelectedMonth(selectedDate)
      fetchSalarySlips(selectedDate)
    }
  }

  const showDatepicker = () => {
    setShowDatePicker(true)
  }

  const handleViewSlip = (record: any) => {
    router.push({
      pathname: `/screens/features/slarySlip/${record.id}` as any,
      params: { 
        recordData: JSON.stringify(record),
        token: token
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return '#2e7d32'
      case 'pending': return '#ed6c02'
      case 'cancelled': return '#d32f2f'
      default: return '#666'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid': return 'checkmark-circle-outline'
      case 'pending': return 'time-outline'
      case 'cancelled': return 'close-circle-outline'
      default: return 'help-circle-outline'
    }
  }

  const renderSalaryItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.salaryCard}
      onPress={() => handleViewSlip(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.monthContainer}>
          <Text style={styles.monthText}>{item.month_label}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status_label}
            </Text>
          </View>
        </View>
        <Text style={styles.netSalary}>₹{item.net_salary.toLocaleString()}</Text>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailLabel}>Period:</Text>
            <Text style={styles.detailValue}>{item.period}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.detailLabel}>Days:</Text>
            <Text style={styles.detailValue}>{item.present_days}/{item.working_days}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={16} color="#666" />
            <Text style={styles.detailLabel}>Payment:</Text>
            <Text style={styles.detailValue}>{item.payment_method_label}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="receipt-outline" size={16} color="#666" />
            <Text style={styles.detailLabel}>Receipt:</Text>
            <Text style={styles.detailValue}>{item.receipt_no}</Text>
          </View>
        </View>

        {item.deductions && item.deductions.length > 0 && (
          <View style={styles.deductionsContainer}>
            <Text style={styles.deductionsLabel}>Deductions:</Text>
            <View style={styles.deductionsList}>
              {item.deductions.map((deduction: any, index: number) => (
                <View key={index} style={styles.deductionItem}>
                  <Text style={styles.deductionName}>{deduction.name}</Text>
                  <Text style={styles.deductionAmount}>-₹{deduction.amount}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.paidDate}>Paid: {item.paid_at_label}</Text>
          {item.receipt_available && (
            <View style={styles.pdfIndicator}>
              <Ionicons name="document-text-outline" size={16} color="#1976d2" />
              <Text style={styles.pdfText}>PDF Available</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderStats = () => {
    if (!salaryData?.stats) return null
    
    const { stats } = salaryData
    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#f5f5f5' }]}>
          <Text style={styles.statNumber}>{stats.total_records}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
          <Text style={[styles.statNumber, { color: '#2e7d32' }]}>{stats.paid_records}</Text>
          <Text style={[styles.statLabel, { color: '#2e7d32' }]}>Paid</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
          <Text style={[styles.statNumber, { color: '#ed6c02' }]}>{stats.pending_records}</Text>
          <Text style={[styles.statLabel, { color: '#ed6c02' }]}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
          <Text style={[styles.statNumber, { color: '#1976d2' }]}>₹{stats.total_paid_amount.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: '#1976d2' }]}>Total Paid</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <HeaderSection title="Salary Slips" />

      {/* Month Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.monthPicker}
          onPress={showDatepicker}
        >
          <Ionicons name="calendar-outline" size={20} color="#1976d2" />
          <Text style={styles.monthPickerText}>
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#1976d2" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => fetchSalarySlips(selectedMonth)}
        >
          <Ionicons name="refresh-outline" size={20} color="#1976d2" />
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedMonth}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Stats */}
      {renderStats()}

      {/* Records List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading salary slips...</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No salary slips found</Text>
          <Text style={styles.emptySubText}>for the selected month</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderSalaryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
    gap: 12,
  },
  monthPicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  monthPickerText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  refreshButton: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  salaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  monthContainer: {
    flex: 1,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  netSalary: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2e7d32',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginLeft: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  deductionsContainer: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deductionsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  deductionsList: {
    gap: 4,
  },
  deductionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  deductionName: {
    fontSize: 13,
    color: '#666',
  },
  deductionAmount: {
    fontSize: 13,
    color: '#d32f2f',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paidDate: {
    fontSize: 12,
    color: '#999',
  },
  pdfIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
  },
  pdfText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
})

export default SalarySlipsScreen
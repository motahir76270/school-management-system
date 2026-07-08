import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import HeaderSection from '@/components/features/header'
import { useSelector } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

const FeeReceipts = () => {
  const feeData = useSelector((state: any) => state.student.feesData)
  const receipts = feeData?.receipts || []
  const [token, setToken] = useState("")
  const router = useRouter()

  useEffect(() => {
    getToken()
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

  // Navigate to dynamic screen
  const handleViewPDF = (receipt: any) => {
    router.push({
      pathname: `/screens/features/fees/${receipt.id}` as any,
      params: { 
        receiptData: JSON.stringify(receipt),
        token: token
      }
    })
  }

  const renderReceiptItem = ({ item }: { item: any }) => (
    <View style={styles.receiptCard}>
      <View style={styles.receiptHeader}>
        <View style={styles.receiptNameContainer}>
          <Text style={styles.receiptName}>{item.fee_name}</Text>
          <Text style={styles.receiptNo}>{item.receipt_no}</Text>
        </View>
        <Text style={styles.receiptAmount}>₹{item.amount}</Text>
      </View>
      
      <View style={styles.receiptDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaction ID:</Text>
          <Text style={styles.detailValue}>{item.transaction_id}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Paid On:</Text>
          <Text style={styles.detailValue}>{item.paid_at_label}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.pdfButton}
        onPress={() => handleViewPDF(item)}
      >
        <Ionicons name="eye-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Preview PDF</Text>
      </TouchableOpacity>
    </View>
  )

  if (receipts.length === 0) {
    return (
      <View style={styles.container}>
        <HeaderSection title="Fee Receipts" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No receipts found</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <HeaderSection title="Fee Receipts" />
      <FlatList
        data={receipts}
        renderItem={renderReceiptItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  receiptNameContainer: {
    flex: 1,
  },
  receiptName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  receiptNo: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  receiptAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e7d32',
  },
  receiptDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  pdfButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
})

export default FeeReceipts
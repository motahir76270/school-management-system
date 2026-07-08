import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';
import { getStudentFeeData } from '@/hooks/apiCalls/student';
import { FullScreenLoader } from '@/hooks/use-screensLoder';
import { useDispatch, useSelector } from 'react-redux';
import { setFeesData } from '@/redux/studentSlice';

// Updated interfaces to match the actual data structure
interface InstallmentReceipt {
  id: string;
  amount: number;
  receipt_no: string;
  transaction_id: string;
  payment_method: string;
  paid_at: string;
  paid_at_label: string;
  print_url: string;
  pdf_url: string;
}

interface Payment {
  id: string;
  fee_name: string;
  fee_structure_id: string;
  amount: number;
  base_amount: number;
  late_fee_amount: number;
  late_fee_days: number;
  late_fee_per_day: number;
  total_payable: number;
  paid_amount: number;
  due_amount: number;
  due_date: string | null;
  due_date_label: string | null;
  status: string;
  status_label: string;
  is_overdue: boolean;
  payment_method: string | null;
  paid_at: string | null;
  paid_at_label: string | null;
  receipt_no: string;
  transaction_id: string | null;
  notes: string | null;
  frequency: string;
  installment_receipts: InstallmentReceipt[];
  receipt_count: number;
}

interface FeeSummary {
  total_assigned: number;
  total_paid: number;
  total_due: number;
  pending_count: number;
  overdue_count: number;
}

interface Receipt {
  id: string;
  fee_name: string;
  receipt_no: string;
  transaction_id: string;
  amount: number;
  paid_at: string;
  paid_at_label: string;
  print_url: string;
  pdf_url: string;
}

interface FeeDataResponse {
  success: boolean;
  message: string;
  summary: FeeSummary;
  payments: Payment[];
  receipts: Receipt[];
}

const FeeStructure = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const feeData = useSelector((state: any) => state.student.feesData) as FeeDataResponse | null;

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'paid': return '#4CAF50';
      case 'partial': return '#FF9800';
      case 'pending': return '#FFC107';
      case 'due': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch(status?.toLowerCase()) {
      case 'paid': return 'checkmark-circle';
      case 'partial': return 'partly-sunny';
      case 'pending': return 'time';
      case 'due': return 'time';
      case 'overdue': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const paymentProgress = feeData ? (feeData.summary.total_paid / feeData.summary.total_assigned) * 100 : 0;

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const res = await getStudentFeeData();
      if (res?.success === true) {
        dispatch(setFeesData(res));
      } else {
        Alert.alert("Failed", res?.message || "Failed to load fee data");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while fetching fee data");
    } finally {
      setLoading(false);
    }
  };

  const handlePayPress = (fee: Payment) => {
    
  };

  const handleReceiptsPress = () => {
    router.push("/screens/features/fees/feeReceipts");
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.centerContent]}>
        <HeaderSection title="Fee Structure" />
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>Loading fee data...</Text>
        </View>
      </View>
    );
  }

  if (!feeData || feeData.payments.length === 0) {
    return (
      <View style={[styles.mainContainer, styles.centerContent]}>
        <HeaderSection title="Fee Structure" />
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No Fee Records Found</Text>
          <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
            You don't have any fee records at the moment.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderSection title="Fee Structure" />
      
      <ScrollView 
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.termTitle, { color: colors.text }]}>Fee Summary</Text>
            
            <View style={styles.amountContainer}>
              <View style={styles.amountItem}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Total Amount</Text>
                <Text style={[styles.amountValue, { color: colors.text }]}>₹{feeData.summary.total_assigned.toLocaleString()}</Text>
              </View>
              <View style={styles.amountItem}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Paid Amount</Text>
                <Text style={[styles.amountValue, { color: '#4CAF50' }]}>₹{feeData.summary.total_paid.toLocaleString()}</Text>
              </View>
              <View style={styles.amountItem}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Due Amount</Text>
                <Text style={[styles.amountValue, { color: '#F44336' }]}>₹{feeData.summary.total_due.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(paymentProgress, 100)}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {paymentProgress.toFixed(1)}% Paid
              </Text>
            </View>

            <View style={styles.statusSummary}>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: '#FFC107' }]} />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                  Pending: {feeData.summary.pending_count}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: '#F44336' }]} />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                  Overdue: {feeData.summary.overdue_count}
                </Text>
              </View>
            </View>
          </View>

          {/* Fee Breakdown Section */}
          <View style={styles.feesList}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Fee Breakdown</Text>
              <TouchableOpacity 
                style={[styles.receiptsButton, { backgroundColor: colors.primary + '15' }]}
                onPress={handleReceiptsPress}
              >
                <Ionicons name="receipt-outline" size={18} color={colors.primary} />
                <Text style={[styles.receiptsButtonText, { color: colors.primary }]}>Receipts</Text>
              </TouchableOpacity>
            </View>
            
            {feeData.payments.map((fee) => (
              <View 
                key={fee.id} 
                style={[styles.feeCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.feeHeader}>
                  <View style={styles.feeLeft}>
                    <Text style={[styles.feeTitle, { color: colors.text }]}>{fee.fee_name}</Text>
                    <Text style={[styles.dueDate, { color: colors.textSecondary }]}>
                      Due: {fee.due_date_label || 'Not set'}
                    </Text>
                    {fee.frequency && (
                      <Text style={[styles.frequencyText, { color: colors.textSecondary }]}>
                        Frequency: {fee.frequency}
                      </Text>
                    )}
                    {fee.receipt_no && (
                      <Text style={[styles.receiptText, { color: colors.textSecondary }]}>
                        Receipt: {fee.receipt_no}
                      </Text>
                    )}
                  </View>
                  <View style={styles.feeRight}>
                    <Text style={[styles.amount, { color: colors.text }]}>₹{fee.amount.toLocaleString()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fee.status) + '20' }]}>
                      <Ionicons name={getStatusIcon(fee.status)} size={12} color={getStatusColor(fee.status)} />
                      <Text style={[styles.statusText, { color: getStatusColor(fee.status) }]}>
                        {fee.status_label}
                      </Text>
                    </View>
                    {fee.is_overdue && (
                      <View style={[styles.overdueBadge, { backgroundColor: '#F44336' }]}>
                        <Text style={styles.overdueText}>Overdue</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Show total payable with late fee if applicable */}
                {fee.total_payable > fee.amount && (
                  <View style={styles.lateFeeInfo}>
                    <Ionicons name="alert-circle" size={14} color="#FF9800" />
                    <Text style={[styles.lateFeeText, { color: '#FF9800' }]}>
                      Late Fee: ₹{fee.late_fee_amount} ({fee.late_fee_days} days × ₹{fee.late_fee_per_day} ) + ₹{fee.amount}
                    </Text>
                  </View>
                )}
                
                {fee.paid_amount > 0 && (
                  <View style={styles.paidInfo}>
                    <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                    <Text style={[styles.paidText, { color: '#4CAF50' }]}>
                      Paid: ₹{fee.paid_amount.toLocaleString()} of ₹{fee.amount.toLocaleString()}
                    </Text>
                    {fee.payment_method && (
                      <Text style={[styles.paymentMethod, { color: colors.textSecondary }]}>
                        via {fee.payment_method}
                      </Text>
                    )}
                  </View>
                )}

                {/* Show installment receipts count if any */}
                {fee.installment_receipts && fee.installment_receipts.length > 0 && (
                  <View style={styles.installmentInfo}>
                    <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.installmentText, { color: colors.textSecondary }]}>
                      {fee.installment_receipts.length} installment receipt(s)
                    </Text>
                  </View>
                )}

                {/* Pay button for individual fee if due */}
                {fee.due_amount > 0 && (
                  <TouchableOpacity 
                    style={[styles.quickPayButton, { backgroundColor: colors.primary }]}
                    onPress={() => handlePayPress(fee)}
                  >
                    <Text style={styles.quickPayButtonText}>Pay ₹{fee.due_amount.toLocaleString()} Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      <FullScreenLoader loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  summaryCard: {
    margin: 15,
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  termTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  amountItem: {
    alignItems: 'center',
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressSection: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
  feesList: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  receiptsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  receiptsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  feeCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  feeLeft: {
    flex: 1,
    marginRight: 10,
  },
  feeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  dueDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  frequencyText: {
    fontSize: 11,
    marginBottom: 2,
  },
  receiptText: {
    fontSize: 11,
    marginTop: 2,
  },
  feeRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  lateFeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  lateFeeText: {
    fontSize: 12,
    marginLeft: 5,
  },
  paidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexWrap: 'wrap',
  },
  paidText: {
    fontSize: 12,
    marginLeft: 5,
    marginRight: 10,
  },
  paymentMethod: {
    fontSize: 11,
  },
  installmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  installmentText: {
    fontSize: 11,
    marginLeft: 5,
  },
  quickPayButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickPayButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  overdueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overdueText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '600',
  },
});

export default FeeStructure;
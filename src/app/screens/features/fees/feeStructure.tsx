import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';
import { getStudentFeeData, intiateTransaction, varifyTransaction } from '@/hooks/apiCalls/student';
import { FullScreenLoader } from '@/hooks/use-screensLoder';
import { useDispatch, useSelector } from 'react-redux';
import { setFeesData } from '@/redux/studentSlice';
import { RazzorPayTransaction } from '@/hooks/payment/RazzorPay';
import PaymentConfirmationModal from '@/components/modal/fees/PaymentConfirmationModal';
import CustomAlertModal from '@/components/modal/CustomAlertModal';
import PaymentSuccessModal from '@/components/modal/fees/PaymentSuccessModal';
import { EasebuzzTransaction } from '@/hooks/payment/easeBuzz';


// Interfaces
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

const FeeStructure = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [processingFeeId, setProcessingFeeId] = useState<string | null>(null);
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Payment | null>(null);
  const [successPaymentData, setSuccessPaymentData] = useState<any>(null);
  
  // Alert state
  const [alertType, setAlertType] = useState<any>('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');

  const dispatch = useDispatch();
  const feeData = useSelector((state: any) => state.student.feesData) as any;

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

  // Show alert helper
  const showAlert = (type: any, message: string, title?: string) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertTitle(title || '');
    setShowAlertModal(true);
  };

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const res = await getStudentFeeData();
      if (res?.success === true) {
        dispatch(setFeesData(res));
      } else {
        showAlert('failed', res?.message || 'Failed to load fee data', 'Error');
      }
    } catch (error) {
      showAlert('failed', 'An error occurred while fetching fee data', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentBtn = (fee: Payment) => {
    setSelectedFee(fee);
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedFee) return;
    
    try {
      setPaymentLoading(true);
      setShowConfirmModal(false);
      setProcessingFeeId(selectedFee.id);
      
      // Step 1: Initiate transaction
      const res = await intiateTransaction(selectedFee?.id);    
      if(res?.success === true){
        const payload = {
          amount: res?.checkout?.amount_rupees,
          currency: feeData?.payment_gateway?.currency,
          key: feeData?.payment_gateway?.key,
          fee_name: selectedFee?.fee_name,
          order_id: res?.checkout?.client?.order_id ||  res?.checkout?.order_id,
          school_name: res?.checkout?.name
        };

        // Step 2: Process Razorpay payment
          let PaymentData:any
             if(res?.checkout?.gateway === "razorpay"){
              PaymentData = await RazzorPayTransaction(payload);
             }else if(res?.checkout?.gateway === "easebuzz"){
              PaymentData = await EasebuzzTransaction(payload);
             }
 

        if(PaymentData?.success === true){
          // Step 3: Verify payment
          setVerifyingPayment(true);
          const verifyResult = await handlePaymentVerify(selectedFee?.id, PaymentData.data);   
          setVerifyingPayment(false);
          if (verifyResult?.success === true) {
            // Show success modal with payment data
            setSuccessPaymentData({
              receipt_no: verifyResult?.payment?.receipt_no || verifyResult?.transaction?.receipt_no || 'N/A',
              transaction_id: verifyResult?.transaction?.transaction_id || verifyResult?.payment?.transaction_id || 'N/A',
              message: verifyResult?.message || "Payment successful",
              amount: verifyResult?.payment?.amount || selectedFee?.amount || 0,
              fee_name: verifyResult?.payment?.fee_name || selectedFee?.fee_name || 'N/A',
              payment_method: verifyResult?.payment?.payment_method || "razorpay",
              paid_at_label: verifyResult?.payment?.paid_at_label || verifyResult?.transaction?.paid_at_label || new Date().toLocaleDateString(),
            });
            setShowSuccessModal(true);
            // Refresh fee data
            await fetchFeeData();
          }else{
              setSuccessPaymentData({
              receipt_no: verifyResult?.payment?.receipt_no || verifyResult?.transaction?.receipt_no || 'N/A',
              transaction_id: verifyResult?.transaction?.transaction_id || verifyResult?.payment?.transaction_id || 'N/A',
              message: verifyResult?.message || "Payment successful",
              amount: verifyResult?.payment?.amount || selectedFee?.amount || 0,
              fee_name: verifyResult?.payment?.fee_name || selectedFee?.fee_name || 'N/A',
              payment_method: verifyResult?.payment?.payment_method || "razorpay",
              paid_at_label: verifyResult?.payment?.paid_at_label || verifyResult?.transaction?.paid_at_label || new Date().toLocaleDateString(),
            });
          }
        } else {
          showAlert('Failed', PaymentData?.error?.message || PaymentData?.data?.message , 'Failed' );
        }
      } else {
        showAlert('warning', res?.message || 'Unable to initiate payment', 'Warning');
      }
    } catch (error) {
      console.log('Payment Error:', error);
      showAlert('failed', 'An error occurred during payment', 'Error');
    } finally {
      setPaymentLoading(false);
      setVerifyingPayment(false);
      setProcessingFeeId(null);
      setSelectedFee(null);
    }
  };

  const handlePaymentVerify = async (id: any, PaymentData: any) => {
    try {
      const res = await varifyTransaction(id, PaymentData);
      if (res?.success === true) {
        return res;
      } else {
        showAlert('failed', res?.message || 'Payment verification failed', 'Verification Failed');
        return null;
      }
    } catch (error) {
      console.log('Verification Error:', error);
      showAlert('failed', 'Payment verification failed. Please check your payment status.', 'Error');
      return null;
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessPaymentData(null);
  };

  const handleReceiptsPress = () => {
    router.push("/screens/features/fees/feeReceipts");
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.centerContent]}>
        <HeaderSection title="Fee Structure" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading fee data...</Text>
        </View>
      </View>
    );
  }

  if (!feeData || feeData.payments?.length === 0) {
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
            
            {feeData.payments.map((fee: Payment) => {
              const isProcessing = processingFeeId === fee.id;
              const isDisabled = paymentLoading || verifyingPayment;
              
              return (
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
                        Late Fee: ₹{fee.late_fee_amount} ({fee.late_fee_days} days × ₹{fee.late_fee_per_day}) + ₹{fee.amount}
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
                      style={[
                        styles.quickPayButton, 
                        { 
                          backgroundColor: isDisabled ? colors.textSecondary : colors.primary,
                          opacity: isDisabled ? 0.7 : 1
                        }
                      ]}
                      onPress={() => handlePaymentBtn(fee)}
                      disabled={isDisabled}
                    >
                      {isProcessing ? (
                        <View style={styles.buttonLoadingContainer}>
                          <ActivityIndicator size="small" color="#FFF" />
                          <Text style={styles.quickPayButtonText}>
                            {verifyingPayment ? 'Verifying...' : 'Processing...'}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.quickPayButtonText}>
                          Pay ₹{fee.due_amount.toLocaleString()} Now
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        visible={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedFee(null);
        }}
        onConfirm={handleConfirmPayment}
        feeData={selectedFee ? {
          fee_name: selectedFee.fee_name,
          amount: selectedFee.amount,
          due_amount: selectedFee.due_amount,
          status: selectedFee.status,
          status_label: selectedFee.status_label,
        } : null}
        loading={paymentLoading}
      />

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        visible={showSuccessModal}
        onClose={handleCloseSuccessModal}
        paymentData={successPaymentData}
      />

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={showAlertModal}
        type={alertType}
        message={alertMessage}
        title={alertTitle}
        onClose={() => setShowAlertModal(false)}
        autoDismiss={true}
        autoDismissTime={30000} // 30 seconds
      />

      {/* Full Screen Loader for all payment steps */}
      <FullScreenLoader 
        loading={paymentLoading || verifyingPayment} 
        message={
          paymentLoading ? 'Processing payment...' : 
          verifyingPayment ? 'Verifying payment...' : 
          ''
        }
      />
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
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
    justifyContent: 'center',
    minHeight: 44,
  },
  quickPayButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Modal } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';

interface Fee {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
}

interface FeeStructure {
  id: string;
  term: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  fees: Fee[];
}

const FeeStructure = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [selectedTerm, setSelectedTerm] = useState('Term 1 2024');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  const feeStructure: FeeStructure = {
    id: '1',
    term: 'Term 1 2024',
    totalAmount: 25000,
    paidAmount: 15000,
    dueAmount: 10000,
    fees: [
      { id: '1', title: 'Tuition Fee', amount: 15000, dueDate: '2024-01-15', status: 'paid', paidDate: '2024-01-10' },
      { id: '2', title: 'Library Fee', amount: 2000, dueDate: '2024-01-20', status: 'paid', paidDate: '2024-01-18' },
      { id: '3', title: 'Sports Fee', amount: 3000, dueDate: '2024-02-15', status: 'pending' },
      { id: '4', title: 'Lab Fee', amount: 2500, dueDate: '2024-02-20', status: 'pending' },
      { id: '5', title: 'Examination Fee', amount: 2500, dueDate: '2024-01-25', status: 'overdue' },
    ]
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'overdue': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch(status) {
      case 'paid': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'overdue': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const paymentProgress = (feeStructure.paidAmount / feeStructure.totalAmount) * 100;

  return (
    <View style={styles.mainContainer}>
      {/* Fixed Header */}
    <HeaderSection title="Fee Structure" />
      
      {/* Scrollable Content */}
      <ScrollView 
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.termTitle, { color: colors.text }]}>{feeStructure.term}</Text>
            
            <View style={styles.amountContainer}>
              <View style={styles.amountItem}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Total Amount</Text>
                <Text style={[styles.amountValue, { color: colors.text }]}>₹{feeStructure.totalAmount}</Text>
              </View>
              <View style={styles.amountItem}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Paid Amount</Text>
                <Text style={[styles.amountValue, { color: '#4CAF50' }]}>₹{feeStructure.paidAmount}</Text>
              </View>
              <View style={styles.amountItem}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Due Amount</Text>
                <Text style={[styles.amountValue, { color: '#F44336' }]}>₹{feeStructure.dueAmount}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${paymentProgress}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {paymentProgress.toFixed(1)}% Paid
              </Text>
            </View>
          </View>

          <View style={styles.feesList}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Fee Breakdown</Text>
            
            {feeStructure.fees.map((fee) => (
              <TouchableOpacity 
                key={fee.id} 
                style={[styles.feeCard, { backgroundColor: colors.card }]}
                onPress={() => {
                  setSelectedFee(fee);
                  setModalVisible(true);
                }}
              >
                <View style={styles.feeHeader}>
                  <View>
                    <Text style={[styles.feeTitle, { color: colors.text }]}>{fee.title}</Text>
                    <Text style={[styles.dueDate, { color: colors.textSecondary }]}>Due: {fee.dueDate}</Text>
                  </View>
                  <View style={styles.feeRight}>
                    <Text style={[styles.amount, { color: colors.text }]}>₹{fee.amount}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fee.status) + '20' }]}>
                      <Ionicons name={getStatusIcon(fee.status)} size={12} color={getStatusColor(fee.status)} />
                      <Text style={[styles.statusText, { color: getStatusColor(fee.status) }]}>
                        {fee.status}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {fee.status === 'paid' && fee.paidDate && (
                  <View style={styles.paidInfo}>
                    <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                    <Text style={[styles.paidText, { color: '#4CAF50' }]}>Paid on {fee.paidDate}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.payButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedFee?.title}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalInfo}>
                <Text style={[styles.modalLabel, { color: colors.primary }]}>Amount</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>₹{selectedFee?.amount}</Text>
              </View>

              <View style={styles.modalInfo}>
                <Text style={[styles.modalLabel, { color: colors.primary }]}>Due Date</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>{selectedFee?.dueDate}</Text>
              </View>

              <View style={styles.modalInfo}>
                <Text style={[styles.modalLabel, { color: colors.primary }]}>Status</Text>
                <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedFee?.status || 'pending') + '20' }]}>
                  <Text style={[styles.modalStatusText, { color: getStatusColor(selectedFee?.status || 'pending') }]}>
                    {selectedFee?.status}
                  </Text>
                </View>
              </View>

              {selectedFee?.status === 'pending' && (
                <TouchableOpacity style={[styles.payModalButton, { backgroundColor: colors.primary }]}>
                  <Text style={styles.payModalButtonText}>Pay Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
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
  feesList: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
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
  feeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
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
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  paidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  paidText: {
    fontSize: 12,
    marginLeft: 5,
  },
  payButton: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalInfo: {
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  modalValue: {
    fontSize: 16,
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  payModalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  payModalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeeStructure;
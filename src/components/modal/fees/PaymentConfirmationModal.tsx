import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface PaymentConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  feeData: {
    fee_name: string;
    amount: number;
    due_amount: number;
    status: string;
    status_label: string;
  } | null;
  loading?: boolean;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  feeData,
  loading = false,
}) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  if (!feeData) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return '#4CAF50';
      case 'partial': return '#FF9800';
      case 'pending': return '#FFC107';
      case 'due': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.confirmIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="cash-outline" size={40} color={colors.primary} />
            </View>
          </View>

          <Text style={[styles.confirmTitle, { color: colors.text }]}>
            Confirm Payment
          </Text>
          <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>
            Please confirm the payment details before proceeding.
          </Text>

          {/* Fee Details */}
          <View style={[styles.detailsContainer, { backgroundColor: colors.background }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Fee Name
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {feeData.fee_name}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Total Amount
              </Text>
              <Text style={[styles.detailValue, { color: colors.text, fontWeight: 'bold' }]}>
                ₹{feeData.amount.toLocaleString()}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Due Amount
              </Text>
              <Text style={[styles.detailValue, { color: '#F44336', fontWeight: 'bold' }]}>
                ₹{feeData.due_amount.toLocaleString()}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Status
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(feeData.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(feeData.status) }]}>
                  {feeData.status_label}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.confirmButtonText}>Processing...</Text>
              ) : (
                <>
                  <Ionicons name="lock-open-outline" size={18} color="#FFF" />
                  <Text style={styles.confirmButtonText}>Pay Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Dimensions.get('window').width - 40,
    borderRadius: 20,
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  confirmIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    opacity: 0.3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default PaymentConfirmationModal;
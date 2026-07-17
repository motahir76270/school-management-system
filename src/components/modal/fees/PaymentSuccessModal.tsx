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

interface PaymentSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  paymentData: {
    receipt_no: string;
    transaction_id: string;
    message: string;
    amount: number;
    fee_name: string;
    payment_method: string;
    paid_at_label: string;
  } | null;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  visible,
  onClose,
  paymentData,
}) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  if (!paymentData) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.successIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="checkmark" size={40} color="#FFF" />
            </View>
          </View>

          <Text style={[styles.successTitle, { color: colors.text }]}>
            Payment Successful!
          </Text>
          <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
            {paymentData.message || 'Your payment has been completed successfully.'}
          </Text>

          {/* Payment Details */}
          <View style={[styles.detailsContainer, { backgroundColor: colors.background }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Fee Name
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {paymentData.fee_name}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Amount
              </Text>
              <Text style={[styles.detailValue, { color: colors.text, fontWeight: 'bold' }]}>
                ₹{paymentData.amount.toLocaleString()}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Payment Method
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {paymentData.payment_method?.toUpperCase() || 'N/A'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Receipt No.
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {paymentData.receipt_no}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Transaction ID
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {paymentData.transaction_id}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Paid At
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {paymentData.paid_at_label}
              </Text>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
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
    maxHeight: Dimensions.get('window').height - 40,
    borderRadius: 20,
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successMessage: {
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
  closeButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentSuccessModal;
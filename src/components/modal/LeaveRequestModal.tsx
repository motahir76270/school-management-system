import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useColorScheme,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Colors } from '@/constants/theme';

// Zod validation schema
const leaveRequestSchema = z.object({
  from_date: z.string().min(1, 'From date is required'),
  to_date: z.string().min(1, 'To date is required'),
  reason: z
    .string()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason must be less than 500 characters'),
}).refine((data) => {
  const from = new Date(data.from_date);
  const to = new Date(data.to_date);
  return to >= from;
}, {
  message: 'To date must be after or equal to from date',
  path: ['to_date'],
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveRequestFormData) => void;
  loading?: boolean;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const isDark = scheme === 'dark';

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      from_date: '',
      to_date: '',
      reason: '',
    },
  });

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(new Date());
  const [selectedToDate, setSelectedToDate] = useState(new Date());

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDateLabel = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleFromDateChange = (event: any, date?: Date) => {
    setShowFromDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedFromDate(date);
      const formattedDate = formatDate(date);
      setValue('from_date', formattedDate);
      
      // If to_date is before from_date, update to_date
      const currentToDate = watch('to_date');
      if (currentToDate && new Date(currentToDate) < date) {
        setSelectedToDate(date);
        setValue('to_date', formattedDate);
      }
    }
  };

  const handleToDateChange = (event: any, date?: Date) => {
    setShowToDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedToDate(date);
      setValue('to_date', formatDate(date));
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: LeaveRequestFormData) => {
    onSubmit(data);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Request Leave
            </Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* From Date */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                From Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateInput,
                  { 
                    borderColor: errors.from_date ? '#F44336' : colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                onPress={() => setShowFromDatePicker(true)}
                disabled={loading}
              >
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {watch('from_date') 
                    ? formatDateLabel(new Date(watch('from_date'))) 
                    : 'Select from date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              {errors.from_date && (
                <Text style={styles.errorText}>{errors.from_date.message}</Text>
              )}
            </View>

            {/* To Date */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                To Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateInput,
                  { 
                    borderColor: errors.to_date ? '#F44336' : colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                onPress={() => setShowToDatePicker(true)}
                disabled={loading}
              >
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {watch('to_date') 
                    ? formatDateLabel(new Date(watch('to_date'))) 
                    : 'Select to date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              {errors.to_date && (
                <Text style={styles.errorText}>{errors.to_date.message}</Text>
              )}
            </View>

            {/* Reason */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Reason <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="reason"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.textArea,
                      {
                        borderColor: errors.reason ? '#F44336' : colors.border,
                        color: colors.text,
                        backgroundColor: colors.background,
                      },
                    ]}
                    placeholder="Enter reason for leave..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    value={value}
                    onChangeText={onChange}
                    editable={!loading}
                  />
                )}
              />
              {errors.reason && (
                <Text style={styles.errorText}>{errors.reason.message}</Text>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  { borderColor: colors.border },
                ]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleSubmit(handleFormSubmit)}
                disabled={loading}
              >
                {loading ? (
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                    Submitting...
                  </Text>
                ) : (
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Date Pickers */}
          {showFromDatePicker && (
            <DateTimePicker
              value={selectedFromDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleFromDateChange}
              maximumDate={new Date()}
            />
          )}

          {showToDatePicker && (
            <DateTimePicker
              value={selectedToDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleToDateChange}
              minimumDate={new Date(watch('from_date'))}
              maximumDate={new Date()}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  required: {
    color: '#F44336',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    height: 50,
  },
  dateText: {
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LeaveRequestModal;
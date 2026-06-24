import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Modal } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  obtainedMarks?: number;
  status: 'pending' | 'submitted' | 'graded';
  attachment?: string;
}

const AssignmentComponent = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const assignments: Assignment[] = [
    { id: '1', title: 'Algebra Problem Set', subject: 'Mathematics', description: 'Solve all problems from chapter 5', dueDate: '2024-03-28', totalMarks: 50, status: 'pending' },
    { id: '2', title: 'Newton\'s Laws Lab Report', subject: 'Physics', description: 'Submit lab report with observations', dueDate: '2024-03-27', totalMarks: 100, status: 'submitted' },
    { id: '3', title: 'Poetry Analysis', subject: 'English', description: 'Analyze the given poem', dueDate: '2024-03-26', totalMarks: 75, obtainedMarks: 68, status: 'graded' },
    { id: '4', title: 'Chemical Reactions', subject: 'Chemistry', description: 'Write balanced equations', dueDate: '2024-03-29', totalMarks: 40, status: 'pending' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'graded': return '#4CAF50';
      case 'submitted': return '#2196F3';
      case 'pending': return '#FFC107';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch(status) {
      case 'graded': return 'checkmark-circle';
      case 'submitted': return 'cloud-upload';
      case 'pending': return 'time';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Fixed Header */}
      <HeaderSection title="Assignments" />
      
      {/* Scrollable Content */}
      <ScrollView 
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {assignments.filter(a => a.status === 'submitted').length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Submitted</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statNumber, { color: colors.warning || '#FFC107' }]}>
                {assignments.filter(a => a.status === 'pending').length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statNumber, { color: colors.success || '#4CAF50' }]}>
                {assignments.filter(a => a.status === 'graded').length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Graded</Text>
            </View>
          </View>

          {assignments.map((assignment) => (
            <TouchableOpacity 
              key={assignment.id} 
              style={[styles.assignmentCard, { backgroundColor: colors.card }]}
              onPress={() => {
                setSelectedAssignment(assignment);
                setModalVisible(true);
              }}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.subject, { color: colors.primary }]}>{assignment.subject}</Text>
                  <Text style={[styles.assignmentTitle, { color: colors.text }]}>{assignment.title}</Text>
                </View>
                <View style={[styles.statusContainer, { backgroundColor: getStatusColor(assignment.status) + '20' }]}>
                  <Ionicons name={getStatusIcon(assignment.status)} size={16} color={getStatusColor(assignment.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(assignment.status) }]}>
                    {assignment.status}
                  </Text>
                </View>
              </View>

              <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                {assignment.description}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.dueDate, { color: colors.textSecondary }]}>Due: {assignment.dueDate}</Text>
                </View>
                <View style={styles.marksContainer}>
                  <FontAwesome5 name="star" size={14} color={colors.warning || '#FFC107'} />
                  <Text style={[styles.marks, { color: colors.textSecondary }]}>
                    {assignment.obtainedMarks ? `${assignment.obtainedMarks}/${assignment.totalMarks}` : `${assignment.totalMarks} marks`}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
                {selectedAssignment?.title}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalInfo}>
                <Text style={[styles.modalLabel, { color: colors.primary }]}>Subject</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>{selectedAssignment?.subject}</Text>
              </View>

              <View style={styles.modalInfo}>
                <Text style={[styles.modalLabel, { color: colors.primary }]}>Description</Text>
                <Text style={[styles.modalValue, { color: colors.textSecondary }]}>{selectedAssignment?.description}</Text>
              </View>

              <View style={styles.modalInfo}>
                <Text style={[styles.modalLabel, { color: colors.primary }]}>Due Date</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>{selectedAssignment?.dueDate}</Text>
              </View>

              <View style={styles.modalInfo}>
                <Text style={[styles.modalLabel, { color: colors.primary }]}>Total Marks</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>{selectedAssignment?.totalMarks}</Text>
              </View>

              {selectedAssignment?.obtainedMarks && (
                <View style={styles.modalInfo}>
                  <Text style={[styles.modalLabel, { color: colors.primary }]}>Obtained Marks</Text>
                  <Text style={[styles.modalValue, { color: colors.success || '#4CAF50' }]}>{selectedAssignment.obtainedMarks}</Text>
                </View>
              )}

              {selectedAssignment?.status === 'pending' && (
                <TouchableOpacity style={[styles.submitModalButton, { backgroundColor: colors.primary }]}>
                  <Text style={styles.submitModalButtonText}>Upload Assignment</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 20,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 3,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  assignmentCard: {
    margin: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subject: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
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
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    marginLeft: 5,
  },
  marksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marks: {
    fontSize: 12,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
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
    fontSize: 14,
  },
  submitModalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitModalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AssignmentComponent;
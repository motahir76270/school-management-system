import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, TextInput, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';

interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'late';
  priority: 'high' | 'medium' | 'low';
}

const HomeWork = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [selectedFilter, setSelectedFilter] = useState('all');

  const homework: Homework[] = [
    { id: '1', subject: 'Mathematics', title: 'Algebra Assignment', description: 'Solve equations 1-20', dueDate: '2024-03-25', status: 'pending', priority: 'high' },
    { id: '2', subject: 'Physics', title: 'Laws of Motion', description: 'Write about Newton\'s laws', dueDate: '2024-03-26', status: 'pending', priority: 'medium' },
    { id: '3', subject: 'English', title: 'Essay Writing', description: 'Write an essay on environmental issues', dueDate: '2024-03-24', status: 'submitted', priority: 'high' },
    { id: '4', subject: 'Chemistry', title: 'Periodic Table', description: 'Learn elements 1-30', dueDate: '2024-03-23', status: 'late', priority: 'low' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'submitted': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'late': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const filteredHomework = selectedFilter === 'all' 
    ? homework 
    : homework.filter(h => h.status === selectedFilter);

  return (
    <View style={styles.mainContainer}>
      {/* Fixed Header */}
      <HeaderSection title="Homework" />
      
      {/* Scrollable Content */}
      <ScrollView 
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.filterContainer}>
            {['all', 'pending', 'submitted', 'late'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  { color: selectedFilter === filter ? '#FFF' : colors.text }
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredHomework.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.homeworkCard, { backgroundColor: colors.card }]}>
              <View style={styles.cardHeader}>
                <View style={styles.subjectContainer}>
                  <Text style={[styles.subject, { color: colors.primary }]}>{item.subject}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={[styles.homeworkTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
              
              <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.dueDate, { color: colors.textSecondary }]}>Due: {item.dueDate}</Text>
                </View>
                <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]}>
                  <Text style={styles.submitButtonText}>
                    {item.status === 'submitted' ? 'View Submission' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 20,
    marginTop: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 3,
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  homeworkCard: {
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
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subject: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  homeworkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    marginLeft: 5,
  },
  submitButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HomeWork;
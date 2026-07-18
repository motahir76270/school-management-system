import { View, Text, Alert, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import HeaderSection from '@/components/features/header'
import { FullScreenLoader } from '@/hooks/use-screensLoder'
import { getAllStudentsAdminCrads } from '@/hooks/apiCalls/student'
import { setAdmitCardData } from '@/redux/studentSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'

const GetAdmintCards = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { admitCardData } = useSelector((state: any) => state.student)
  console.log(admitCardData);
  

  const [loading, setLoading] = useState(false)

  const fetchAllAdmitCardData = async () => {
    setLoading(true);
    try {
      const res = await getAllStudentsAdminCrads();
  
      if (res?.success === true) {
        dispatch(setAdmitCardData(res?.exams))
      } else {
        Alert.alert("Failed", res?.message || "Failed to fetch reports")
      }
    } catch (error) {
      Alert.alert("Failed", "Server Not Responding! Please Check Internet Connection")
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllAdmitCardData()
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.examName}>{item.name}</Text>
          <Text style={styles.examType}>{item.type_label}</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {item.start_date} - {item.end_date}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.is_published ? '#4CAF50' : '#FF9800' }
            ]}>
              <Text style={styles.statusText}>
                {item.is_published ? 'Published' : 'Draft'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.viewButton]}
            onPress={() => router.push(`/screens/features/admitCards/admitCard/${item.id}` as any)}
          >
            <Ionicons name="eye-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.pdfButton]}
            onPress={() => router.push(`/screens/features/admitCards/card/${item.id}` as any)}
          >
            <Ionicons name="document-text-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <HeaderSection title="Admit Cards" />
      
      {admitCardData?.length > 0 ? (
        <FlatList
          data={admitCardData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No Admit Cards Available</Text>
        </View>
      )}
      
      <FullScreenLoader loading={loading} />
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
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    marginBottom: 16,
  },
  examName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  examType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  viewButton: {
    backgroundColor: '#1976d2',
  },
  pdfButton: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
})

export default GetAdmintCards
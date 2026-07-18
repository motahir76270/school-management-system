import HeaderSection from "@/components/features/header";
import { Colors } from "@/constants/theme";
import { getAllStudentsReports } from "@/hooks/apiCalls/student";
import { FullScreenLoader } from "@/hooks/use-screensLoder";
import { setAllReportsData } from "@/redux/studentSlice";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface ReportCard {
  exam_id: string;
  exam_name: string;
  exam_type: string;
  type_label: string;
  start_date: string;
  end_date: string;
  start_date_label: string;
  end_date_label: string;
  detail_url: string;
  print_url: string;
}

const AllReportCardScreen = () => {
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  const { getAllReports } = useSelector((state: any) => state.student);

  const fetchAllReportsData = async () => {
    setLoading(true);
    try {
      const res = await getAllStudentsReports();
      if (res?.success === true) {
        dispatch(setAllReportsData(res?.report_cards));
      } else {
        Alert.alert("Failed", res?.message || "Failed to fetch reports");
      }
    } catch (error) {
      Alert.alert(
        "Failed",
        "Server Not Responding! Please Check Internet Connection",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePdfBtn = async (item: any) => {
    const encodedPrintUrl = encodeURIComponent(item.print_url);
    const encodedExamName = encodeURIComponent(item.exam_name);
    const encodedTypeLabel = encodeURIComponent(item.type_label);
    const encodedStartDate = encodeURIComponent(item.start_date_label);
    const encodedEndDate = encodeURIComponent(item.end_date_label);

    // Use query string approach
    router.push(
      `screens/features/reportsCard/card/${item.exam_id}?print_url=${encodedPrintUrl}&exam_name=${encodedExamName}&type_label=${encodedTypeLabel}&start_date=${encodedStartDate}&end_date=${encodedEndDate}` as any,
    );
  };

  useEffect(() => {
    fetchAllReportsData();
  }, []);

  const renderItem = ({ item }: { item: ReportCard }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        router.push(
          `screens/features/reportsCard/userReports/${item.exam_id}` as any,
        )
      }
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.examName, { color: colors.textPrimary }]}>
              {item.exam_name}
            </Text>
            <View
              style={[styles.badge, { backgroundColor: colors.primary + "20" }]}
            >
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {item.type_label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {item.start_date_label} - {item.end_date_label}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() =>
              router.push(
                `screens/features/reportsCard/userReports/${item.exam_id}` as any,
              )
            }
          >
            <Ionicons name="eye-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={() => handlePdfBtn(item)}
          >
            <Ionicons name="document-text-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title="Reports Card" />

      {getAllReports?.length > 0 ? (
        <FlatList
          data={getAllReports}
          renderItem={renderItem}
          keyExtractor={(item) => item.exam_id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-text-outline"
            size={60}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No reports available
          </Text>
          <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
            Your report cards will appear here
          </Text>
        </View>
      )}

      <FullScreenLoader loading={Loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  examName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

export default AllReportCardScreen;

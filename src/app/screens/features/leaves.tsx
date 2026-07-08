import HeaderSection from "@/components/features/header";
import { getStudentLeaveData, requestStudentLeave } from "@/hooks/apiCalls/student";
import { getTeacherLeaveData, requestTeacherLeave } from "@/hooks/apiCalls/teacher";
import { FullScreenLoader } from "@/hooks/use-screensLoder";
import { setLeaveData } from "@/redux/leaveSlice";
import { Colors } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import LeaveRequestModal from "@/components/modal/LeaveRequestModal";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Leave {
  id: string;
  from_date: string;
  to_date: string;
  from_date_label: string;
  to_date_label: string;
  days: number;
  status: "pending" | "approved" | "rejected";
  status_label: string;
  reason: string;
  admin_remarks: string | null;
  created_at: string;
  created_at_label: string;
}

interface LeaveSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface LeaveResponse {
  success: boolean;
  message: string;
  filters: {
    status: string | null;
    month: string | null;
  };
  summary: LeaveSummary;
  leaves: Leave[];
}

const Leaves = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const { leaveData } = useSelector((state: any) => state.leave);
  const dispatch = useDispatch();
  const [filterStatus, setFilterStatus] = useState<string | null>('pending');
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchLeaveData = async (status?: string | null, month?: string | null) => {
    setLoading(true);
    try {
      const payload = {
        status: status,
        month: month,
      };
      console.log(payload);

      let res: LeaveResponse | undefined;
      if (user?.role === "teacher") {
        res = await getTeacherLeaveData(payload);
      } else {
        res = await getStudentLeaveData(payload);
      }

      if (res?.success === true) {
        dispatch(setLeaveData(res));
      } else {
        Alert.alert("Failed", res?.message || "Failed to load leave data");
      }
    } catch (error: any) {
      Alert.alert(
        "Warning",
        error?.msg || error?.message || "Server not responding! Please check internet connection"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData(filterStatus, selectedMonth ? formatMonth(selectedMonth) : null);
  }, []);

  const formatMonth = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
  };

  const handleMonthChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedMonth(selectedDate);
      fetchLeaveData(filterStatus, formatMonth(selectedDate));
    }
  };

  const clearMonthFilter = () => {
    setSelectedMonth(null);
    fetchLeaveData(filterStatus, null);
  };

  const handleStatusFilter = (status: string | null) => {
    setFilterStatus(status);
    fetchLeaveData(status, selectedMonth ? formatMonth(selectedMonth) : null);
  };

  const handleLeaveRequest = async (data: {
    from_date: string;
    to_date: string;
    reason: string;
  }) => {
    setSubmitting(true);
    try {
      let res: LeaveResponse | undefined;
      if (user?.role === "teacher") {
        res = await requestTeacherLeave(data);
      } else {
        res = await requestStudentLeave(data);
      }

      if (res?.success === true) {
        dispatch(setLeaveData(res));
        setModalVisible(false);
      } else {
        Alert.alert("Failed", res?.message || "Failed to load leave data");
      }
    } catch (error: any) {
      Alert.alert(
        "Warning",
        error?.msg || error?.message || "Server not responding! Please check internet connection"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFC107";
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "time";
      case "approved":
        return "checkmark-circle";
      case "rejected":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const getFilteredLeaves = () => {
    if (!leaveData?.leaves) return [];
    
    let filtered = leaveData.leaves;
    
    if (filterStatus) {
      filtered = filtered.filter((leave: Leave) => leave.status === filterStatus);
    }
    
    return filtered;
  };

  const filteredLeaves = getFilteredLeaves();

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <HeaderSection title="Leaves" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Summary Cards */}
          {leaveData?.summary && (
            <View style={styles.summaryContainer}>
              <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  {leaveData.summary.total}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Total
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.summaryValue, { color: "#FFC107" }]}>
                  {leaveData.summary.pending}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Pending
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
                  {leaveData.summary.approved}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Approved
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.summaryValue, { color: "#F44336" }]}>
                  {leaveData.summary.rejected}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Rejected
                </Text>
              </View>
            </View>
          )}

          {/* Month Filter */}
          <View style={styles.monthFilterContainer}>
            <TouchableOpacity
              style={[styles.monthPickerButton, { backgroundColor: colors.card }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.monthPickerText, { color: colors.text }]}>
                {selectedMonth ? formatMonth(selectedMonth) : "Select Month"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            {selectedMonth && (
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: colors.card }]}
                onPress={clearMonthFilter}
              >
                <Ionicons name="close-circle" size={20} color={colors.error || "#F44336"} />
                <Text style={[styles.clearButtonText, { color: colors.error || "#F44336" }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedMonth || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleMonthChange}
              maximumDate={new Date()}
            />
          )}

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                !filterStatus && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleStatusFilter(null)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: !filterStatus ? "#FFFFFF" : colors.text },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === "pending" && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleStatusFilter("pending")}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filterStatus === "pending" ? "#FFFFFF" : colors.text },
                ]}
              >
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === "approved" && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleStatusFilter("approved")}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filterStatus === "approved" ? "#FFFFFF" : colors.text },
                ]}
              >
                Approved
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === "rejected" && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleStatusFilter("rejected")}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filterStatus === "rejected" ? "#FFFFFF" : colors.text },
                ]}
              >
                Rejected
              </Text>
            </TouchableOpacity>
          </View>

          {/* Request Leave Button */}
          <TouchableOpacity
            style={[styles.requestButton, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.requestButtonText}>Request Leave</Text>
          </TouchableOpacity>

          {/* Leave List */}
          {filteredLeaves.length > 0 ? (
            filteredLeaves.map((leave: Leave) => (
              <View
                key={leave.id}
                style={[styles.leaveCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.leaveHeader}>
                  <View>
                    <Text style={[styles.leaveDate, { color: colors.text }]}>
                      {leave.from_date_label} - {leave.to_date_label}
                    </Text>
                    <Text style={[styles.leaveDays, { color: colors.textSecondary }]}>
                      {leave.days} {leave.days === 1 ? "day" : "days"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(leave.status) + "20" },
                    ]}
                  >
                    <Ionicons
                      name={getStatusIcon(leave.status)}
                      size={16}
                      color={getStatusColor(leave.status)}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(leave.status) },
                      ]}
                    >
                      {leave.status_label}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.reasonText, { color: colors.text }]}>
                  {leave.reason}
                </Text>

                {leave.admin_remarks && (
                  <Text
                    style={[styles.adminRemarks, { color: colors.textSecondary }]}
                  >
                    Admin Remarks: {leave.admin_remarks}
                  </Text>
                )}

                <Text style={[styles.createdAt, { color: colors.textSecondary }]}>
                  Requested on {leave.created_at_label}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="calendar-outline"
                size={60}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No leave requests found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleLeaveRequest}
        loading={submitting}
      />

      <FullScreenLoader loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  monthFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  monthPickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  monthPickerText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  clearButtonText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "500",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  requestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  leaveCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leaveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  leaveDate: {
    fontSize: 16,
    fontWeight: "600",
  },
  leaveDays: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  reasonText: {
    fontSize: 14,
    marginBottom: 6,
  },
  adminRemarks: {
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 6,
  },
  createdAt: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
});

export default Leaves;
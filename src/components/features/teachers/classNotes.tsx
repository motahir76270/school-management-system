import AddNotesModal from "@/components/modal/classNotes/AddNotesModal";
import ViewClassNotesModal from "@/components/modal/classNotes/ViewClassNotesModal";
import { deteleClassNotes, getTecaherClassNotesList, setClassNotesData } from "@/redux/slices/classNoteSlice";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface NoteItem {
  id: string;
  title: string;
  chapter?: string;
  description?: string;
  subject: string;
  class: string;
  section: string;
  file_type?: string;
  has_file?: boolean;
  has_video?: boolean;
  created_at_label?: string;
  file_url?: string;
  video_url?: string;
  school_class_id?: string;
  section_id?: string;
  subject_id?: string;
  created_at?: string;
  teacher_name?: string;
  class_name?: string;
  section_name?: string;
  subject_name?: string;
}

interface ClassType {
  id: string;
  name: string;
  sections?: Section[];
}

interface Section {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

const TeacherClassNotes = ({ loading, setLoading }: any) => {
  const { list, classTypes } = useSelector((state: any) => state.classNotes);
  
  const dispatch = useDispatch();

  // State for dropdowns
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // State for notes list
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Memoized options
  const classOptions = useMemo(() => classTypes?.classes || [], [classTypes]);
  const subjectOptions = useMemo(
    () => classTypes?.subjects || [],
    [classTypes],
  );

  // Section options based on selected class
  const sectionOptions = useMemo(() => {
    if (!selectedClass || !classTypes?.classes) return [];
    const selectedClassData = classTypes.classes.find(
      (cls: ClassType) => cls.id === selectedClass,
    );
    return selectedClassData?.sections || [];
  }, [selectedClass, classTypes]);

  // Reset section when class changes
  useEffect(() => {
    setSelectedSection("");
  }, [selectedClass]);

  const handleClassNotesList = useCallback(async () => {
    if (!selectedClass) {
      Alert.alert("Please select a class");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        school_class_id: selectedClass,
        section_id: selectedSection || undefined,
        subject_id: selectedSubject || undefined,
      };
      const res = await getTecaherClassNotesList(payload);
      if (res?.success === true && res?.count === 0) {
        Alert.alert("Success", res?.message);
      } else if (res?.success === true) {
        dispatch(setClassNotesData(res));
        setNotes(res.notes || []);
      } else {
        Alert.alert("Failed", res?.message || "Failed to load notes");
      }
    } catch (error) {
      Alert.alert(
        "Warning",
        "Server not responding! Please check internet connection",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedClass, selectedSection, selectedSubject, dispatch, setLoading]);

  const handleDeleteNote = useCallback(
    async (noteId: string, title: string) => {
      Alert.alert(
        "Delete Note",
        `Are you sure you want to delete "${title}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setDeletingId(noteId);
              try {
                const res: any = await deteleClassNotes(noteId);
                console.log(res);

                if (res?.success === true) {
                  Alert.alert("Success", "Note deleted successfully");
                  await handleClassNotesList();
                } else {
                  Alert.alert(
                    "Failed",
                    res?.message || "Failed to delete note",
                  );
                }
              } catch (error) {
                Alert.alert("Error", "Something went wrong. Please try again.");
              } finally {
                setDeletingId(null);
              }
            },
          },
        ],
      );
    },
    [handleClassNotesList],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleClassNotesList();
  }, [handleClassNotesList]);

  // Handle note press to view details
  const handleNotePress = useCallback((note: NoteItem) => {
    setSelectedNote(note);
    setViewModalVisible(true);
  }, []);

  const getFileTypeIcon = useCallback((fileType?: string) => {
    switch (fileType?.toLowerCase()) {
      case "pdf":
        return <Ionicons name="document-text" size={20} color="#EF4444" />;
      case "ppt":
        return <Ionicons name="desktop-outline" size={20} color="#F59E0B" />;
      case "doc":
        return (
          <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
        );
      case "image":
        return <Ionicons name="image-outline" size={20} color="#8B5CF6" />;
      case "video":
        return <Ionicons name="videocam-outline" size={20} color="#EC4899" />;
      default:
        return <Ionicons name="document-outline" size={20} color="#6B7280" />;
    }
  }, []);

  const renderNoteItem = useCallback(
    ({ item }: { item: NoteItem }) => (
      <TouchableOpacity
        style={styles.noteItem}
        activeOpacity={0.7}
        onPress={() => handleNotePress(item)}
      >
        <View style={styles.noteContent}>
          <View style={styles.noteLeftSection}>
            <View style={styles.noteHeader}>
              {getFileTypeIcon(item.file_type)}
              <Text style={styles.noteTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </View>

            {item.chapter && (
              <Text style={styles.noteChapter}>
                <Ionicons name="book-outline" size={14} color="#6B7280" />{" "}
                {item.chapter}
              </Text>
            )}

            {item.description && (
              <Text style={styles.noteDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <View style={styles.tagsContainer}>
              {item.subject && (
                <View style={[styles.tag, styles.tagBlue]}>
                  <Ionicons name="school-outline" size={12} color="#2563EB" />
                  <Text style={[styles.tagText, styles.tagTextBlue]}>
                    {item.subject}
                  </Text>
                </View>
              )}
              {item.class && item.section && (
                <View style={[styles.tag, styles.tagGreen]}>
                  <Ionicons name="people-outline" size={12} color="#16A34A" />
                  <Text style={[styles.tagText, styles.tagTextGreen]}>
                    {item.class} - {item.section}
                  </Text>
                </View>
              )}
              {item.file_type && (
                <View style={[styles.tag, styles.tagPurple]}>
                  <Ionicons name="pricetag-outline" size={12} color="#7C3AED" />
                  <Text style={[styles.tagText, styles.tagTextPurple]}>
                    {item.file_type.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {item.created_at_label && (
              <Text style={styles.noteTime}>
                <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                {item.created_at_label}
              </Text>
            )}
          </View>

          <View style={styles.noteRightSection}>
            <TouchableOpacity
              onPress={() => handleDeleteNote(item.id, item.title)}
              disabled={deletingId === item.id}
              style={styles.deleteButton}
            >
              {deletingId === item.id ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [getFileTypeIcon, handleDeleteNote, deletingId, handleNotePress],
  );

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={60} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No notes found</Text>
        <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
      </View>
    ),
    [],
  );

  const renderFilterSection = useCallback(
    () => (
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>
          <Ionicons name="filter-outline" size={14} color="#6B7280" /> Filters
        </Text>

        <View>
          <View style={styles.filterRow}>
            {/* Class Picker */}
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Class *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedClass}
                  onValueChange={(itemValue) => setSelectedClass(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#6B7280"
                >
                  <Picker.Item label="Select Class" value="" />
                  {classOptions.map((cls: ClassType) => (
                    <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Section Picker */}
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Section</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedSection}
                  onValueChange={(itemValue) => setSelectedSection(itemValue)}
                  style={styles.picker}
                  enabled={!!selectedClass}
                  dropdownIconColor={selectedClass ? "#6B7280" : "#D1D5DB"}
                >
                  <Picker.Item label="All Sections" value="" />
                  {sectionOptions.map((sec: Section) => (
                    <Picker.Item key={sec.id} label={sec.name} value={sec.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Subject Picker */}
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Subject</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedSubject}
                  onValueChange={(itemValue) => setSelectedSubject(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#6B7280"
                >
                  <Picker.Item label="All Subjects" value="" />
                  {subjectOptions.map((sub: Subject) => (
                    <Picker.Item key={sub.id} label={sub.name} value={sub.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.applyButton,
                !selectedClass && styles.applyButtonDisabled,
              ]}
              onPress={handleClassNotesList}
              disabled={loading || !selectedClass}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={styles.applyButtonContent}>
                  <Ionicons name="search-outline" size={18} color="white" />
                  <Text style={styles.applyButtonText}>Apply</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [
      selectedClass,
      selectedSection,
      selectedSubject,
      classOptions,
      sectionOptions,
      subjectOptions,
      loading,
      handleClassNotesList,
    ],
  );

  // Load notes on mount
  useEffect(() => {
    if (selectedClass) {
      handleClassNotesList();
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      {renderFilterSection()}

      {/* Notes List */}
      <FlatList
        data={list?.notes || []}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          (!list?.notes || list.notes.length === 0) && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      {/* Floating Action Button for Add Note */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Add Notes Modal */}
      <AddNotesModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          handleClassNotesList();
        }}
      />

      {/* View Notes Modal - Only render when selectedNote exists */}
      {selectedNote && (
        <ViewClassNotesModal
          visible={viewModalVisible}
          onClose={() => {
            setViewModalVisible(false);
            setSelectedNote(null);
          }}
          note={selectedNote}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Platform.select({
      ios: {
        paddingTop: 44,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterSection: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  filterRow: {
    justifyContent: "center",
    flexWrap: "wrap",
    gridAutoColumns: "2",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  pickerWrapper: {
    width: 150,
    marginRight: 12,
  },
  pickerLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    height: 50,
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  applyButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignSelf: "flex-end",
    marginBottom: 4,
    height: 50,
  },
  applyButtonDisabled: {
    backgroundColor: "#93B5E8",
  },
  applyButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  noteItem: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  noteContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  noteLeftSection: {
    flex: 1,
    marginRight: 8,
  },
  noteRightSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 8,
    flexShrink: 0,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },
  noteChapter: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
  },
  noteDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  tagBlue: {
    backgroundColor: "#DBEAFE",
  },
  tagGreen: {
    backgroundColor: "#D1FAE5",
  },
  tagPurple: {
    backgroundColor: "#EDE9FE",
  },
  tagText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  tagTextBlue: {
    color: "#2563EB",
  },
  tagTextGreen: {
    color: "#16A34A",
  },
  tagTextPurple: {
    color: "#7C3AED",
  },
  noteTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 999,
    marginLeft: 4,
  },
  iconContainerBlue: {
    backgroundColor: "#EFF6FF",
  },
  iconContainerRed: {
    backgroundColor: "#FEF2F2",
  },
  deleteButton: {
    backgroundColor: "#FEF2F2",
    padding: 6,
    borderRadius: 999,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    color: "#6B7280",
    fontSize: 18,
    marginTop: 16,
    fontWeight: "500",
  },
  emptySubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#2563EB",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default TeacherClassNotes;

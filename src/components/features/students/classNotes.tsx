import ViewClassNotesModal from "@/components/modal/classNotes/ViewClassNotesModal";

import { getStudentClassNotesList, setClassNotesData } from "@/redux/slices/classNoteSlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface Subject {
  id: string;
  name: string;
}

interface NoteItem {
  id: string;
  title: string;
  chapter?: string;
  description?: string;
  subject: string;
  class: string;
  section: string;
  file_type?: string;
  file_url?: string;
  video_url?: string;
  has_file: boolean;
  has_video: boolean;
  created_at_label: string;
  created_at: string;
  teacher: string;
  teacher_id: string;
  school_class_id: string;
  section_id: string;
  subject_id: string;
  class_name?: string;
  section_name?: string;
  subject_name?: string;
  teacher_name?: string;
}

const StudentClassNotes = () => {
  const dispatch = useDispatch();
  const { list, classTypes } = useSelector((state: any) => state.classNotes);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);

  // Get subjects from classTypes
  const subjects = useMemo(() => {
    return classTypes?.subjects || [];
  }, [classTypes]);

  // Set first subject as default when subjects load
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0].id);
    }
  }, [subjects]);

  // Handle loading notes
  const handleClassNotesList = useCallback(
    async (subjectId?: string) => {
      const id = subjectId || selectedSubject;
      if (!id) {
        Alert.alert("Please select a subject");
        return;
      }

      setLoading(true);
      try {
        const res = await getStudentClassNotesList(id);
        if (res?.success === true) {
          dispatch(setClassNotesData(res));
        } else {
          Alert.alert("Failed", res?.message || "Failed to load notes");
        }
      } catch (error) {
        console.error("Error loading notes:", error);
        Alert.alert("Error", "Failed to load notes. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedSubject],
  );

  // Load notes on mount and when subject changes
  useEffect(() => {
    if (selectedSubject) {
      handleClassNotesList(selectedSubject);
    }
  }, [selectedSubject]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleClassNotesList();
  }, [handleClassNotesList]);

  // Handle subject tab press
  const handleSubjectPress = useCallback((subjectId: string) => {
    setSelectedSubject(subjectId);
  }, []);

  // Handle note press to view details
  const handleNotePress = useCallback((note: NoteItem) => {
    // Map the note data to match ViewClassNotesModal expectations
    const mappedNote = {
      id: note.id,
      title: note.title,
      chapter: note.chapter,
      description: note.description,
      school_class_id: note.school_class_id,
      section_id: note.section_id,
      subject_id: note.subject_id,
      file_type: note.file_type,
      file_url: note.file_url,
      video_url: note.video_url,
      created_at: note.created_at,
      teacher_name: note.teacher,
      class_name: note.class,
      section_name: note.section,
      subject_name: note.subject,
    };
    setSelectedNote(mappedNote as any);
    setViewModalVisible(true);
  }, []);

  // Render subject tabs
  const renderSubjectTabs = useCallback(() => {
    if (!subjects || subjects.length === 0) {
      return (
        <View style={styles.emptyTabsContainer}>
          <Text style={styles.emptyTabsText}>No subjects available</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={subjects}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => {
            const isActive = selectedSubject === item.id;
            return (
              <TouchableOpacity
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => handleSubjectPress(item.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                  numberOfLines={1}
                >
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </Text>
                {isActive && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  }, [subjects, selectedSubject, handleSubjectPress]);

  // Render note item
  const renderNoteItem = useCallback(
    ({ item }: { item: NoteItem }) => (
      <TouchableOpacity
        style={styles.noteItem}
        onPress={() => handleNotePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.noteContent}>
          <View style={styles.noteHeader}>
            {item.file_type && (
              <View
                style={[
                  styles.fileTypeIcon,
                  { backgroundColor: getFileColor(item.file_type) + "20" },
                ]}
              >
                <Ionicons
                  name={getFileIcon(item.file_type)}
                  size={20}
                  color={getFileColor(item.file_type)}
                />
              </View>
            )}
            <Text style={styles.noteTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </View>

          {item.chapter && (
            <Text style={styles.noteChapter}>
              <Ionicons name="bookmark-outline" size={14} color="#6B7280" />{" "}
              {item.chapter}
            </Text>
          )}

          {item.description && (
            <Text style={styles.noteDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.noteFooter}>
            <View style={styles.tagsContainer}>
              {item.class && (
                <View style={[styles.tag, styles.tagBlue]}>
                  <Ionicons name="school-outline" size={12} color="#2563EB" />
                  <Text style={[styles.tagText, styles.tagTextBlue]}>
                    {item.class}
                  </Text>
                </View>
              )}
              {item.section && (
                <View style={[styles.tag, styles.tagGreen]}>
                  <Ionicons name="people-outline" size={12} color="#16A34A" />
                  <Text style={[styles.tagText, styles.tagTextGreen]}>
                    {item.section}
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
            <Text style={styles.noteTime}>
              {item.created_at_label || "N/A"}
            </Text>
          </View>

          <View style={styles.noteIcons}>
            {item.has_file && (
              <Ionicons
                name="document-attach-outline"
                size={16}
                color="#3B82F6"
              />
            )}
            {item.has_video && (
              <Ionicons name="play-circle-outline" size={16} color="#EF4444" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleNotePress],
  );

  // Helper functions for file icons
  const getFileIcon = useCallback((fileType?: string) => {
    if (!fileType) return "document-outline";
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return "document-text-outline";
    if (type.includes("doc") || type.includes("word"))
      return "document-text-outline";
    if (type.includes("ppt") || type.includes("powerpoint"))
      return "document-text-outline";
    if (type.includes("xls") || type.includes("excel"))
      return "document-text-outline";
    if (type.includes("image")) return "image-outline";
    if (type.includes("video")) return "videocam-outline";
    if (type.includes("audio")) return "musical-notes-outline";
    return "document-outline";
  }, []);

  const getFileColor = useCallback((fileType?: string) => {
    if (!fileType) return "#6B7280";
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return "#EF4444";
    if (type.includes("doc") || type.includes("word")) return "#2563EB";
    if (type.includes("ppt") || type.includes("powerpoint")) return "#F59E0B";
    if (type.includes("xls") || type.includes("excel")) return "#10B981";
    if (type.includes("image")) return "#8B5CF6";
    if (type.includes("video")) return "#EC4899";
    if (type.includes("audio")) return "#3B82F6";
    return "#6B7280";
  }, []);

  // Render empty component
  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={60} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No notes found</Text>
        <Text style={styles.emptySubtitle}>
          {selectedSubject
            ? "No notes available for this subject"
            : "Please select a subject"}
        </Text>
      </View>
    ),
    [selectedSubject],
  );

  // Get notes from list
  const notes = useMemo(() => {
    return list?.notes || [];
  }, [list]);

  return (
    <View style={styles.container}>
      {/* Subject Tabs */}
      {renderSubjectTabs()}

      {/* Notes List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading notes...</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            notes.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2563EB"]}
              tintColor="#2563EB"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* View Notes Modal */}
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
  tabsContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
  },
  tabsList: {
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
    position: "relative",
  },
  tabButtonActive: {
    backgroundColor: "#EFF6FF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#2563EB",
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: "#2563EB",
    borderRadius: 1,
  },
  emptyTabsContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyTabsText: {
    color: "#6B7280",
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
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
    position: "relative",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  fileTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    flexShrink: 0,
  },
  noteTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  noteChapter: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
    paddingLeft: 42,
  },
  noteDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    paddingLeft: 42,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 42,
    flexWrap: "wrap",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    flex: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
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
    fontSize: 11,
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
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  noteIcons: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    gap: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
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
});

export default StudentClassNotes;

import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, useColorScheme } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/theme'
import { useSelector } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'

const PostSections = () => {
  const scheme = useColorScheme()
  const color = Colors[scheme === 'unspecified' ? 'light' : scheme]
  const {postData} = useSelector((state:any) => state.posts)
  const userData = useSelector((state:any)=> state.auth.user);
  const schoolData = userData?.school;

  const renderPost = ({ item, index }: { item: any; index: number }) => (
    <View style={[
      styles.postCard, 
      { 
        backgroundColor: color.background,
        marginTop: index === 0 ? 0 : 8,
      }
    ]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: schoolData?.logo }} style={styles.avatar} />
          <View>
            <Text style={[styles.userName, { color: color.text }]}>{schoolData?.name}</Text>
            <Text style={[styles.userUsername, { color: color.textSecondary }]}>
              @{item?.created_by?.name}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          {/* <Ionicons name="ellipsis-horizontal" size={20} color={color.textSecondary} /> */}
        </TouchableOpacity>
      </View>

      {/* Image */}
      <TouchableOpacity activeOpacity={0.95}>
        <Image source={{ uri: item?.file_url }} style={styles.postImage} />
      </TouchableOpacity>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={[styles.caption, { color: color.text }]}>
          <Text style={[styles.captionUserName, { color: color.text }]}>
            Title:
          </Text>
          <Text style={[styles.captionUserName,{ color: color.textSecondary }]}>{item?.title}</Text>
        </Text>
          <Text style={[styles.caption, { color: color.text }]}>
          <Text style={[styles.captionUserName, { color: color.text }]}>
            Description:
          </Text>
          <Text style={{ color: color.textSecondary }}>{item?.description}</Text>
        </Text>
      </View>

      {/* Timestamp */}
      <Text style={[styles.timestamp, { color: color.textSecondary }]}>
        {item?.published_at_label}
      </Text>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: color.background || '#fafafa' }]}>
      {/* Header */}
      <LinearGradient
        colors={[color.background, color.background || '#f5f5f5']}
        style={[styles.headerContainer, { borderBottomColor: color.border || '#e0e0e0' }]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: color.text }]}>School Posts</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIcon}>
              {/* <Ionicons name="search-outline" size={22} color={color.text} /> */}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              {/* <Ionicons name="notifications-outline" size={22} color={color.text} /> */}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Posts */}
      <FlatList
        data={postData?.posts?.slice().reverse().slice(0, 40)}
        renderItem={renderPost}
        keyExtractor={(item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsList}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={true}
        onEndReachedThreshold={0.5}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {

  },
  headerContainer: {
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 18,
  },
  headerIcon: {
    padding: 4,
  },
  postsList: {
    paddingBottom: 80,
    paddingTop: 4,
  },
  postCard: {
    marginHorizontal: 0,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userUsername: {
    fontSize: 12,
    marginTop: 1,
  },
  moreButton: {
    padding: 6,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionUserName: {
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 11,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    letterSpacing: 0.2,
  },
})

export default PostSections
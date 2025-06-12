import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  Dimensions, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Photo, fetchRecentPhotos, getCachedPhotos, hasNewPhotos } from '../utils/api';

const { width } = Dimensions.get('window');
const numColumns = 2;
const imageWidth = (width - 24) / numColumns;

export default function HomeScreen({ navigation }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);

  // Function to load images
  const loadImages = async (useCache = true) => {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      
      // Always try to load cached photos first for instant display
      if (useCache) {
        const cachedPhotos = await getCachedPhotos();
        if (cachedPhotos.length > 0) {
          setPhotos(cachedPhotos);
          setLoading(false);
        }
      }
      
      // Fetch fresh data from API
      const freshPhotos = await fetchRecentPhotos();
      
      if (freshPhotos.length === 0 && photos.length === 0) {
        setOfflineMode(true);
      } else if (freshPhotos.length > 0) {
        // Only update the UI if there are actual changes in the photos
        const photosDifferent = await hasNewPhotos(freshPhotos);
        if (photosDifferent) {
          setPhotos(freshPhotos);
        }
        setOfflineMode(false);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setOfflineMode(photos.length === 0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Navigate to image detail screen
  const handleImagePress = (photo) => {
    navigation.navigate('ImageDetail', { 
      imageUrl: photo.url || photo.url_s,
      title: photo.title
    });
  };

  // Initial load - use cache first, then fetch from API
  useFocusEffect(
    useCallback(() => {
      loadImages(true);
      
      // Set up auto-refresh interval (every 5 minutes)
      const refreshInterval = setInterval(() => {
        loadImages(false);
      }, 5 * 60 * 1000);
      
      return () => {
        clearInterval(refreshInterval);
      };
    }, [])
  );

  // Pull to refresh functionality
  const onRefresh = () => {
    setRefreshing(true);
    loadImages(false);
  };

  // Open drawer on menu press
  const handleMenuPress = () => {
    navigation.openDrawer();
  };

  // Loading screen
  if (loading && photos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading Gallery...</Text>
      </View>
    );
  }

  // Empty state
  if (!loading && photos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleMenuPress}>
            <Ionicons name="menu" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Photo Gallery</Text>
          <View style={{ width: 28 }} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No images found</Text>
          {offlineMode && (
            <Text style={styles.offlineText}>You're offline. Check your connection and try again.</Text>
          )}
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleMenuPress}>
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Gallery</Text>
        <View style={{ width: 28 }} />
      </View>

      {offlineMode && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color="white" />
          <Text style={styles.offlineBannerText}>Offline Mode - Viewing Cached Images</Text>
        </View>
      )}

      <FlatList
        data={photos}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={() => handleImagePress(item)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: item.url_s }}
              style={styles.image}
              resizeMode="cover"
            />
            <Text numberOfLines={1} style={styles.imageTitle}>
              {item.title || "Untitled"}
            </Text>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.flatListContent}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  flatListContent: {
    padding: 8,
  },
  imageContainer: {
    flex: 1,
    margin: 4,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: imageWidth,
    backgroundColor: '#e1e1e1',
  },
  imageTitle: {
    fontSize: 12,
    padding: 8,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginVertical: 10,
    color: '#666',
  },
  offlineText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: '#ff9800',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '500',
  }
});
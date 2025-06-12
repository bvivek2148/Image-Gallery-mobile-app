import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Constants
const STORAGE_KEY = '@photo_gallery_cache';
const FLICKR_API_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=1&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s';
const JSONPLACEHOLDER_API_URL = 'https://jsonplaceholder.typicode.com/photos';

// Types
export interface Photo {
  id: string;
  title: string;
  url_s: string;  // We'll keep this name for compatibility with existing code
  width_s: number;
  height_s: number;
  thumbnailUrl?: string;  // Used by JSONPlaceholder API
  url?: string;           // Full URL from JSONPlaceholder API
}

// Check network connectivity
export const checkConnection = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected !== null ? netInfo.isConnected : false;
};

// Fetch photos from Flickr API
const fetchFlickrPhotos = async (): Promise<Photo[]> => {
  const response = await fetch(FLICKR_API_URL);
  if (!response.ok) throw new Error('Flickr API error');
  const data = await response.json();
  if (!data.photos || !data.photos.photo) return [];
  return data.photos.photo.map((item: any) => ({
    id: item.id,
    title: item.title,
    url_s: item.url_s,
    width_s: 150, // Flickr API does not provide width/height in this call
    height_s: 150,
  }));
};

// Fetch photos from JSONPlaceholder
const fetchJsonPlaceholderPhotos = async (): Promise<Photo[]> => {
  const response = await fetch(`${JSONPLACEHOLDER_API_URL}?_limit=20`);
  if (!response.ok) throw new Error('JSONPlaceholder API error');
  const data = await response.json();
  return data.map((item: any) => ({
    id: item.id.toString(),
    title: item.title,
    url_s: item.thumbnailUrl,
    width_s: 150,
    height_s: 150,
    url: item.url
  }));
};

// Fetch recent photos: tries Flickr first, then JSONPlaceholder as fallback
export const fetchRecentPhotos = async (): Promise<Photo[]> => {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      // If offline, get cached photos
      return await getCachedPhotos();
    }
    
    let photos: Photo[] = [];
    try {
      // Try to fetch from Flickr
      photos = await fetchFlickrPhotos();
    } catch (e) {
      // If Flickr fails, fallback to JSONPlaceholder
      photos = await fetchJsonPlaceholderPhotos();
    }
    
    // Check if the photos are different from cached photos
    const hasChanges = await hasNewPhotos(photos);
    
    if (hasChanges) {
      // Cache the fetched photos if there are changes
      await cachePhotos(photos);
    }
    
    return photos;
  } catch (error) {
    console.error('Error fetching photos:', error);
    // If fetch fails, try to get cached photos
    return await getCachedPhotos();
  }
};

// Cache photos to AsyncStorage
export const cachePhotos = async (photos: Photo[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch (error) {
    console.error('Error caching photos:', error);
  }
};

// Get cached photos from AsyncStorage
export const getCachedPhotos = async (): Promise<Photo[]> => {
  try {
    const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
    if (cachedData) {
      return JSON.parse(cachedData) as Photo[];
    }
    return [];
  } catch (error) {
    console.error('Error getting cached photos:', error);
    return [];
  }
};

// Check if we have new photos compared to the cached ones
export const hasNewPhotos = async (newPhotos: Photo[]): Promise<boolean> => {
  try {
    const cachedPhotos = await getCachedPhotos();
    
    // If cache is empty, we definitely have new photos
    if (cachedPhotos.length === 0) return true;
    
    // If counts differ, we have new photos
    if (newPhotos.length !== cachedPhotos.length) return true;
    
    // Compare IDs to see if there are any differences
    const cachedIds = new Set(cachedPhotos.map(photo => photo.id));
    return newPhotos.some(photo => !cachedIds.has(photo.id));
  } catch (error) {
    console.error('Error comparing photos:', error);
    return false;
  }
};
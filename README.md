# Image Gallery Mobile App

A React Native (Expo) mobile app that displays a gallery of recent images from Flickr, with offline caching and a navigation drawer. If Flickr is unavailable, it falls back to JSONPlaceholder.

## Repository

GitHub: [https://github.com/bvivek2148/Image-Gallery-mobile-app.git](https://github.com/bvivek2148/Image-Gallery-mobile-app.git)

## Features

- **Recent Images:** Fetches and displays the latest 20 images from Flickr (or JSONPlaceholder as fallback).
- **Offline Caching:** Caches image links using AsyncStorage. If offline, the last viewed images are shown.
- **Auto Refresh:** Only updates the gallery if the API response changes.
- **Navigation Drawer:** Left-side drawer with a "Home" option.
- **Image Detail:** Tap an image to view it in detail.
- **Modern UI:** Clean, responsive, and user-friendly interface.

## APIs Used

- **Flickr Recent Photos API:**
  - `https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=1&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s`
- **JSONPlaceholder (Fallback):**
  - `https://jsonplaceholder.typicode.com/photos`

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/bvivek2148/Image-Gallery-mobile-app.git
   cd Image-Gallery-mobile-app
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the app:**
   ```sh
   npm start
   ```
   - Use Expo Go on your device or an emulator to view the app.

## Project Structure

- `App.tsx` - Main app entry, navigation setup.
- `screens/HomeScreen.tsx` - Gallery homepage, image grid, pull-to-refresh.
- `screens/ImageDetailScreen.tsx` - Fullscreen image view.
- `utils/api.ts` - API calls, caching logic, and network checks.
- `assets/` - App icons and splash images.

## How It Works

- On launch, the app tries to fetch recent images from Flickr.
- If offline or Flickr fails, it loads cached images or falls back to JSONPlaceholder.
- Images are cached in AsyncStorage for offline access.
- The gallery only refreshes if new images are detected.
- Navigation drawer provides access to the Home screen.

## Dependencies

- `@react-native-async-storage/async-storage` - For caching image links.
- `@react-native-community/netinfo` - For network status detection.
- `@react-navigation/*` - For navigation and drawer.
- `expo` - Expo managed workflow.
- `react-native` - Core framework.

## Customization

- To change the number of images, update the `per_page` parameter in the Flickr API URL.
- To add more navigation options, edit `App.tsx` and the drawer setup.

## Troubleshooting

- If you see dependency errors, try installing with `--legacy-peer-deps`:
  ```sh
  npm install --legacy-peer-deps
  ```
- For iOS/Android device issues, ensure you have the latest Expo Go app.

## Screenshots

_Add screenshots of the app here for visual reference._

## License

This project is for demonstration and hiring task purposes only.

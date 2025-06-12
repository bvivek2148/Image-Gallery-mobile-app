import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from 'sonner-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from "./screens/HomeScreen";
import ImageDetailScreen from "./screens/ImageDetailScreen";

// Create stack navigator for screens
const Stack = createStackNavigator();

// Create drawer navigator
const Drawer = createDrawerNavigator();

// Custom drawer content
function CustomDrawerContent() {
  return (
    <View style={styles.drawerHeader}>
      <Text style={styles.drawerTitle}>Photo Gallery App</Text>
      <Text style={styles.drawerSubtitle}>View and cache photos</Text>
    </View>
  );
}

// Stack navigator component to be used inside drawer
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ImageDetail" component={ImageDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <Toaster />
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            drawerActiveBackgroundColor: '#e6e6e6',
            drawerActiveTintColor: '#0066cc',
            drawerInactiveTintColor: '#333',
          }}
          drawerContent={(props) => (
            <View style={{ flex: 1 }}>
              <CustomDrawerContent />
              {props.state.routeNames
                .filter(name => name === "Home")
                .map((name, index) => (
                <View 
                  key={name} 
                  style={[
                    styles.drawerItem,
                    props.state.index === index ? styles.activeDrawerItem : null
                  ]}
                >
                  <Ionicons 
                    name="home" 
                    size={24} 
                    color={props.state.index === index ? '#0066cc' : '#666'} 
                  />
                  <Text 
                    style={[
                      styles.drawerItemText,
                      props.state.index === index ? styles.activeDrawerItemText : null
                    ]}
                    onPress={() => props.navigation.navigate(name)}
                  >
                    {name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        >
          <Drawer.Screen name="Home" component={HomeStack} />
        </Drawer.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none"
  },
  drawerHeader: {
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 4,
    marginHorizontal: 8,
    marginTop: 8,
  },
  activeDrawerItem: {
    backgroundColor: '#e6e6e6',
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#666',
  },
  activeDrawerItemText: {
    fontWeight: 'bold',
    color: '#0066cc',
  }
});
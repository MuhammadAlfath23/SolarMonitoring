import React, { useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';

import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import NotifikasiScreen from '../screens/NotifikasiScreen';
import Colors from '../constants/Colors';
import Icon from '../components/Icon';

const Tab = createBottomTabNavigator();

function TabIcon({ iconName, label, focused }) {
  return (
    <View style={[styles.tabIconWrapper, focused && styles.tabIconActive]}>
      <Icon
        name={iconName}
        size={22}
        color={focused ? Colors.primary : Colors.textMuted}
      />
      <Text style={[styles.tabLabel, { color: focused ? Colors.primary : Colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon iconName="dashboard" label="Dashboard" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon iconName="bar-chart" label="Riwayat" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Notifikasi"
          component={NotifikasiScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon iconName="bell" label="Notifikasi" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon iconName="user" label="Profil" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 8,
    paddingTop: 4,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabIconWrapper: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 2,
  },
  tabIconActive: {
    backgroundColor: Colors.primaryGhost,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
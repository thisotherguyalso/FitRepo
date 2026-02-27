import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        // Dark theme override
        tabBarStyle: {
          backgroundColor: '#0f0f0f',   // darker background
          borderTopColor: '#1c1c1c',
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#6b6b6b',

        tabBarLabelStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
      name="home"
      options={{
        title: 'Home',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" size={size} color={color} />
        ),
      }}
    />

    <Tabs.Screen
      name="session"
      options={{
        title: 'Session',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="play-circle" size={size} color={color} />
        ),
      }}
    />

    <Tabs.Screen
      name="workouts"
      options={{
        title: 'Workouts',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="barbell" size={size} color={color} />
        ),
      }}
    />

    <Tabs.Screen
      name="chat"
      options={{
        title: 'Chat',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="chatbubbles" size={size} color={color} />
        ),
      }}
    />

    <Tabs.Screen
      name="TestScreen"
      options={{
        title: 'TESTS',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="bug" size={size} color={color} />
        ),
      }}
    />
    </Tabs>

  );
}
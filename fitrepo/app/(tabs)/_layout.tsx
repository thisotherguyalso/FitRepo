import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { useAppColors } from '@/constants/styles';

export default function TabLayout() {
  const colors = useAppColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarStyle: {
          //position: 'absolute',
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceAlt,
        },
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,

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

    </Tabs>
    
  );
}
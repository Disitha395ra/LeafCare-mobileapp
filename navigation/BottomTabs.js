import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import History from '../pages/History';
import Camera from '../pages/CameraScreen';
import { MaterialIcons } from "@expo/vector-icons";
const Tab = createBottomTabNavigator();

export default function BottomTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    let iconName;

                    if (route.name === "Dashboard") iconName = "dashboard";
                    if (route.name === "Camera") iconName = "camera-alt";
                    if (route.name === "History") iconName = "history";
                    if (route.name === "Profile") iconName = "person";

                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={Dashboard} />
            <Tab.Screen name="Camera" component={Camera} />
            <Tab.Screen name="History" component={History} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    )
}
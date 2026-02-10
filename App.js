import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./AuthContext";
import AuthGate from "./AuthGate";
import Banner from "./components/Banner";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Banner" component={Banner} />
          <Stack.Screen name="AuthGate" component={AuthGate} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GoogleLogin from "./pages/GoogleLogin"

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="GoogleLogin" component={GoogleLogin} />
    </Stack.Navigator>
  );
}

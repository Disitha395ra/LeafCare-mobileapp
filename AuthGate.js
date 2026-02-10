import { View, ActivityIndicator } from "react-native";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

import AuthStack from "./AuthStack";
import BottomTabs from "./navigation/BottomTabs";

export default function AuthGate() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return user ? <BottomTabs /> : <AuthStack />;
}

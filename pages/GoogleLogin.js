import React, { useEffect } from "react";
import { View, Button, Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function GoogleLogin({ navigation }) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "1073803406065-do7f6r83r5rth3pffg1k6r4vrnjk2cq3.apps.googleusercontent.com",
    webClientId: "1073803406065-do7f6r83r5rth3pffg1k6r4vrnjk2cq3.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      
      signInWithCredential(auth, credential)
        .then(() => {
          Alert.alert("Success", "Logged in successfully!");
        })
        .catch((err) => {
          console.log("Firebase Google login error:", err);
          Alert.alert("Login failed", err.message);
        });
    }
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button
        disabled={!request}
        title="Sign in with Google"
        onPress={() => {
          promptAsync();
        }}
      />
    </View>
  );
}
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Picker } from "@react-native-picker/picker";

import { auth, db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CameraScreen() {
  const cameraRef = useRef(null);

  // Camera permission
  const [permission, requestPermission] = useCameraPermissions();

  // Photo & results
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Language picker state
  const [language, setLanguage] = useState("en");

  // Permission UI
  if (!permission) return <Text>Requesting camera permission...</Text>;
  if (!permission.granted)
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No camera access</Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );

  // Take photo
  const takePhoto = async () => {
    if (cameraRef.current) {
      const data = await cameraRef.current.takePictureAsync({ base64: true });
      setPhoto(data);
      setResult(null);
    }
  };

  // Identify disease
  const identifyDisease = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=AIzaSyCF-m9uIMw9Sq9qZbg9_fKm7F5CCFyzTgU",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Identify the plant disease and give summary and treatment in ${language}`,
                  },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: photo.base64,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No result";

      setResult({
        disease: "Detected Disease",
        summary: text,
        treatment: "See details above",
      });
    } catch (error) {
      console.log(error);
      alert("Failed to identify disease");
    } finally {
      setLoading(false);
    }
  };

  // Retry
  const retry = () => {
    setPhoto(null);
    setResult(null);
  };

  // Save to Firestore
  const saveToHistory = async () => {
    try {
      await addDoc(collection(db, "history"), {
        userId: auth.currentUser.uid,
        disease: result.disease,
        summary: result.summary,
        treatment: result.treatment,
        language,
        createdAt: serverTimestamp(),
      });

      alert("Saved to history 🌱");
      retry();
    } catch (err) {
      alert("Save failed");
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      {!photo ? (
        <CameraView style={styles.camera} ref={cameraRef}>
          <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
            <Text style={styles.captureText}>📸</Text>
          </TouchableOpacity>
        </CameraView>
      ) : (
        <ScrollView
          style={styles.photoContainer}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Image source={{ uri: photo.uri }} style={styles.photo} />

          <Picker
            selectedValue={language}
            onValueChange={(itemValue) => setLanguage(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="English" value="en" />
            <Picker.Item label="Sinhala" value="si" />
            <Picker.Item label="Tamil" value="ta" />
            <Picker.Item label="Spanish" value="es" />
            <Picker.Item label="French" value="fr" />
          </Picker>

          {!result && !loading && (
            <TouchableOpacity
              onPress={identifyDisease}
              style={styles.identifyButton}
            >
              <Text style={styles.identifyText}>🌱 Identify Disease</Text>
            </TouchableOpacity>
          )}

          {loading && (
            <ActivityIndicator
              size="large"
              color="#2e7d32"
              style={{ marginVertical: 20 }}
            />
          )}

          {result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>🦠 Disease: {result.disease}</Text>
              <Text style={styles.resultText}>📌 Summary: {result.summary}</Text>
              <Text style={styles.resultText}>💊 Treatment: {result.treatment}</Text>

              <TouchableOpacity onPress={retry} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>🔁 Retry</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={saveToHistory} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>💾 Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e8f5e9" },
  camera: { flex: 1 },
  captureButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#2e7d32",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#a5d6a7",
  },
  captureText: { color: "white", fontSize: 28 },
  photoContainer: { flex: 1, padding: 15 },
  photo: { height: 300, borderRadius: 15, marginBottom: 15 },
  picker: {
    backgroundColor: "#a5d6a7",
    borderRadius: 10,
    marginBottom: 20,
  },
  identifyButton: {
    backgroundColor: "#43a047",
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  identifyText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 15,
    backgroundColor: "#c8e6c9",
    padding: 15,
    borderRadius: 15,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#1b5e20",
  },
  actionButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 10,
    borderRadius: 15,
    marginTop: 10,
  },
  actionButtonText: { color: "white", textAlign: "center", fontWeight: "bold" },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
  },
  permissionText: { fontSize: 18, marginBottom: 15, color: "#1b5e20" },
  permissionButton: {
    backgroundColor: "#43a047",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  permissionButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

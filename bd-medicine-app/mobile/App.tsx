import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import SearchScreen from "./src/screens/SearchScreen";
import MedicineDetailScreen from "./src/screens/MedicineDetailScreen";
import AlternativesScreen from "./src/screens/AlternativesScreen";
import PrescriptionUploadScreen from "./src/screens/PrescriptionUploadScreen";
import PrescriptionResultScreen from "./src/screens/PrescriptionResultScreen";

interface EBProps {
  children: React.ReactNode;
}
interface EBState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<EBProps, EBState> {
  state: EBState = { error: null };

  static getDerivedStateFromError(error: Error): EBState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.error.message}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => {
              this.setState({ error: null });
            }}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: "#2F5BA2" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "600" },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "BD Medicine Price" }} />
          <Stack.Screen name="Search" component={SearchScreen} options={{ title: "Search" }} />
          <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} options={{ title: "Medicine" }} />
          <Stack.Screen name="Alternatives" component={AlternativesScreen} options={{ title: "Alternatives" }} />
          <Stack.Screen name="PrescriptionUpload" component={PrescriptionUploadScreen} options={{ title: "Upload Prescription" }} />
          <Stack.Screen name="PrescriptionResult" component={PrescriptionResultScreen} options={{ title: "Prescription Results" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  errorTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8, color: "#1a1a1a" },
  errorMessage: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 16 },
  errorButton: {
    backgroundColor: "#2F5BA2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: { color: "#fff", fontWeight: "600" },
});

import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GameOver() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Sicheres Parsen der Parameter
  const scoreParam = params.score;
  const score = typeof scoreParam === 'string' ? Number(scoreParam) : 0;
  const volume = Number(params.volume) || 0.5;
  const vibration = params.vibration === "true";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Over</Text>
      <Text style={styles.score}>Score: {Math.floor(score)}</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace({
          pathname: "/game",
          params: {
            volume: volume.toString(),
            vibration: vibration.toString()
          }
        })}
      >
        <Text style={styles.buttonText}>Nochmal spielen</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.buttonText}>Zurück zum Menü</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#000"
  },
  title: { 
    fontSize: 40, 
    fontWeight: "bold",
    color: "white"
  },
  score: { 
    fontSize: 28, 
    marginVertical: 20,
    color: "white"
  },
  button: {
    backgroundColor: "#333",
    padding: 16,
    margin: 10,
    borderRadius: 10,
    minWidth: 200,
    alignItems: "center"
  },
  buttonText: { 
    color: "white", 
    fontSize: 20 
  },
});
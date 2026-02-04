import Slider from '@react-native-community/slider';
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const router = useRouter();

  const [volume, setVolume] = useState(0.5);
  const [vibration, setVibration] = useState(true);

  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Einstellungen</Text>

      <Text style={styles.label}>Lautstärke</Text>
      <Slider
        style={{ width: "80%" }}
        minimumValue={0}
        maximumValue={1}
        value={volume}
        onValueChange={setVolume}
      />

      <View style={styles.row}>
        <Text style={styles.label}>Vibration</Text>
        <Switch value={vibration} onValueChange={setVibration} />
      </View>



      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.replace({
            pathname: "/game",
            params: { volume, vibration: vibration as unknown as string}, 
          })
        }
      >
        <Text style={styles.btnText}>Spiel starten</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.replace("/")}>
        <Text style={styles.btnText}>Zurück</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 80 },
  title: { fontSize: 32, marginBottom: 40 },
  label: { fontSize: 20 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  button: {
    backgroundColor: "#333",
    padding: 16,
    margin: 20,
    borderRadius: 12,
  },
  btnText: { fontSize: 20, color: "white" },
});

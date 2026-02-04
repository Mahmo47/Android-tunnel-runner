import { Canvas, useFrame } from "@react-three/fiber/native";
import { Gyroscope } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import * as THREE from "three";

// ------- Tunnel-Component -------
function Tunnel({ gyro }: { gyro: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Tunnel dreht sich abhängig vom Gyroskop
      meshRef.current.rotation.y = gyro * 0.5;

      // Tunnel scrollt nach vorne (Fake-Endless)
      meshRef.current.position.z += 0.1;
      if (meshRef.current.position.z > 25) meshRef.current.position.z = 0;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[5, 5, 100, 32, 32, true]} />
      <meshBasicMaterial color="#888" wireframe />
    </mesh>
  );
}

// ------- Main App -------
export default function App() {
  const [gyro, setGyro] = useState(0);

  useEffect(() => {
    Gyroscope.setUpdateInterval(16);

    const sub = Gyroscope.addListener((data) => {
      // Wir nutzen nur "y", da es links/rechts Bewegung ist
      setGyro(data.y);
    });

    return () => sub.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Canvas
        gl={{ antialias: true }}
        camera={{ fov: 75, position: [0, 0, 2] }}
      >
        <ambientLight intensity={1} />
        <Tunnel gyro={gyro} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" }
});

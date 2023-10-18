import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import Player from "../../entities/Player.js";
import GameRenderer from "./systems/GameRenderer.js";

const screenWidth = Dimensions.get("screen").width - 50;
const screenHeight = Dimensions.get("screen").height - 50;

export default function App() {
  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);
  const [position, setPosition] = useState([screenWidth / 2, screenHeight / 2]);
  const [mounted, setMounted] = useState(false);

  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener((accelerometerData) => {
        setData(accelerometerData);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    Accelerometer.setUpdateInterval(20);
    _subscribe();
    return () => _unsubscribe();
  }, []);

  useEffect(() => {
    let temp = [position[0] + data.x * 10, position[1] - data.y * 10];
    if (
      temp[0] < 0 ||
      temp[0] > screenWidth ||
      temp[1] < 0 ||
      temp[1] > screenHeight
    ) {
      temp = checkBoundaries(temp);
    }

    setPosition(temp);
  }, [data]);

  function checkBoundaries(temp) {
    let horz = temp[0];
    let vert = temp[1];

    if (temp[0] < 0) {
      horz = 0;
    }
    if (temp[0] > screenWidth) {
      horz = screenWidth;
    }
    if (temp[1] < 0) {
      vert = 0;
    }
    if (temp[1] > screenHeight) {
      vert = screenHeight;
    }

    return [horz, vert];
  }

  return (
    <View style={styles.container}>
      <GameRenderer mounted={mounted} />

      <View style={[styles.container, { position: "absolute" }]}>
        <Player position={position} />

        <Text>
          x: {data.x.toFixed(2)} y: {data.y.toFixed(2)} z: {data.z.toFixed(2)}
        </Text>
        <Text>
          x: {position[0].toFixed(2)} y: {position[1].toFixed(2)}
        </Text>

        <TouchableOpacity
          onPress={() => setMounted(!mounted)}
          style={styles.testButton}
        >
          <Text>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  testButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "skyblue",
  },
});

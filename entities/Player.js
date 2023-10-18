import React from "react"
import { View } from 'react-native';

export default function Player({ position }) {
  return (
    <View
      style={{
        width: 30,
        height: 30,
        backgroundColor: "red",
        position: "absolute",
        left: position[0],
        top: position[1],
        borderRadius: 15,
      }}
    ></View>
  );
}
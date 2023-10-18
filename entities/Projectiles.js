import React, { useState, useEffect } from "react";
import { View, Dimensions } from "react-native";

const screenWidth = Dimensions.get("screen").width - 50;
const screenHeight = Dimensions.get("screen").height - 50;

export default function Projectiles({ position }) {

  return (
    <View
      style={{
        width: 50,
        height: 50,
        backgroundColor: "yellow",
        position: "absolute",
        left: position[0],
        top: position[1],
        borderRadius: 25,
      }}
    ></View>
  );
}

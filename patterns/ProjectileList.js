import React from "react";
import { View } from "react-native";
import Projectiles from "../entities/Projectiles";

export default function ProjectileList({ elements }) {
  const projectileList = elements.map((el, idx) => (
    <Projectiles
      key={idx}
      position={el}
    />
  ));

  return (
    <View>
      {projectileList}
    </View>
  );
}

import React, { useState, useEffect } from "react";
import { View, Dimensions } from "react-native";
import Projectiles from "../../entities/Projectiles";

export default function StraightProjectiles(props) {
  const [projectileList, setProjectileList] = useState([]);
  const [startPos, setStartPos] = useState(props.startPos);
  const [key, setKey] = useState(0);
  

  useEffect(() => {
    if (props.mounted) {
      let temp = projectileList;
      let tempPos = startPos

      if (props.type == "vertical") {
        tempPos = [startPos[0], 0];
      } else {
        tempPos = [0, startPos[1]]
      }

      temp.push(
        <Projectiles start={tempPos} key={key} isOffScreen={isOffScreen} type={props.type} />
      );

      setTimeout(() => {
        setKey(key + 1);
        setProjectileList(temp); //change in projectileList does not trigger useEffect
      }, 1000);
    }
    
  }, [props.mounted, key]);

  function isOffScreen(check) {
    if (check) { 
      let temp = projectileList;
      temp.splice(0, 1);
      setProjectileList(temp);
    }
  }

  return (
    <View style={{ height: "100%", width: "100%", position: "absolute" }}>
      {projectileList}
    </View>
  );
}

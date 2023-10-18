import React, { useState, useEffect } from "react";
import { View, Dimensions } from "react-native";
import StraightProjectiles from "./StraightProjectiles";

const screenHeight = Dimensions.get("screen").height - 50;
const screenWidth = Dimensions.get("screen").width - 50;

export default function GameRenderer(props) {
  const [straightProjectileList, setStraightProjectileList] = useState([]); 
  const [key, setKey] = useState(0)
  const [startPositions, setStartPositions] = useState([])

  useEffect(() => {
    if (props.mounted && straightProjectileList.length < 4) { //seems like I'm building up RAM which causes lag, up to 700 MB lol, memory leaking? starting RAM is 70MB
       let temp = straightProjectileList
       let height = Math.floor(Math.random() * screenHeight);
       let width = Math.floor(Math.random() * screenWidth);

       height = checkSpacing(height, "height")
       width = checkSpacing(width, "width")
       
      setStartPositions((prev) => [
        ...prev,
        { height: height, width: width },
      ]); 

       temp.push(
       <StraightProjectiles 
         key={key}
         startPos={[width, height]}
         mounted={props.mounted}
         type={"vertical"}
       />
       )
        temp.push(
          <StraightProjectiles
            key={key + 1}
            startPos={[width, height]}
            mounted={props.mounted}
            type={"horizontal"}
          />
        );

           setKey((1 + key) * 2);
           setStraightProjectileList(temp)

    } else if (!props.mounted) { //make them disappear one at a time plz instead of wiping all out
        setStraightProjectileList([])
    }

  }, [props.mounted, key])

  function checkSpacing(position, name) {
    let check = null

    if (name == "height") {
        check = screenHeight
    } else {
        check = screenWidth
    }

    while (position < 50 || position > check - 50 || !compareSpacing(position, name)) {
        position = Math.floor(Math.random() * check);
    }

    return position
  }

  function compareSpacing(position, name) {
    for (let i = 0; i < startPositions.length; i++) {
        if (Math.abs(startPositions[i][name] - position) < 100) {
            return false
        }
    }
    return true
  }

  return (
    <View style={{height: '100%', width: '100%', position: 'absolute'}}>
      {straightProjectileList}
    </View>
  );
}


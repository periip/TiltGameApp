/*
  Welcome to my honestly unfinished bullet hell game.
  I chose to use the accelerometer because I wanted the user to continuously move on the orientation it was holding so this was perfect for it. If it was a gyroscope, it would
  not be able to do that as it only detects orientation. 
  My scoring system is based on time alive in the game but has no high score implemented.
  Game ends when you reach 0 lives.

  Personal errors I came across:
  I wanted to refactor my game into separate "phases" to include the aspect of randomness but I came across pretty much a game-breaking bug. The movement became jittery when I did this and not smooth and I couldn't find out for the love of code.
  So pretty much the game is linearly structured and restarts once you reach the last phase.
  Also didn't have enough time to include projectile/character sprites.
  
  Bugs:
  -If you exit out of the app and come back, the points/timer might freeze
  -The points in the beginning might jump a little to 2 or 3, something to do with gameengine itself
*/

import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal
} from "react-native";
import { GameEngine } from "react-native-game-engine";
import Player from "../entities/Player";
import { Accelerometer } from "expo-sensors";
import GameLoop from "../systems/GameLoop";
import ProjectileList from "../patterns/ProjectileList";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("screen").width - 30;
const screenHeight = Dimensions.get("screen").height - 30;

/*
  TODOS:
  -UI (NEED TO ADD START SCREEN AND BETTER POINTS DISPLAY)
  -COLLISION (DONE)
  -REMOVE DRIFT 
  -MORE PHASES 
  -RANDOMIZATION OF PHASES (MOSTLY WORKS)
  
  RESOURCES:
  -https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
*/

export default function GameScreen({ route, navigation }) {
  const [subscription, setSubscription] = useState(null);
  const [modalVisible, setModalVisible] = useState(false)
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [points, setPoints] = useState(0);
  const engine = useRef(null);
  const [lives, setLives] = useState(3);
  const [scoreList, setScoreList] = useState([])
  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const startPos = [screenWidth / 2, screenHeight / 2];
  const scores = "@scores"

   const saveScores = async () => {
     try {
        AsyncStorage.getItem(scores, (err, result) => {
          let score = [{score: points, id: 0}];
          if (result !== null) {
            score = [{ score: points, id: result.length }];
            console.log("Data Found", result);
            var newScore
             = JSON.parse(result).concat(score);
            AsyncStorage.setItem(scores, JSON.stringify(newScore));
          } else {
            console.log("Data Not Found");
            AsyncStorage.setItem(scores, JSON.stringify(score));
          }
        });
     } catch (error) {
         console.log(error)
     }
   };

   useEffect(() => {
     if (lives == 0) {
        setModalVisible(true)
     }
   }, [isGameRunning]);

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
    setIsGameRunning(true);
    _subscribe();
    return () => _unsubscribe();
  }, []);

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

  function noBoundaries(temp) {
    let horz = temp[0];
    let vert = temp[1];

    if (temp[0] < 0) {
      horz = screenWidth;
    }
    if (temp[0] > screenWidth) {
      horz = 0;
    }
    if (temp[1] < 0) {
      vert = screenHeight;
    }
    if (temp[1] > screenHeight) {
      vert = 0;
    }

    return [horz, vert];
  }

  function UserMovement(entities, { events, dispatch }) {
    const player = entities.player;
    let temp = [
      player.position[0] + data.x * 10,
      player.position[1] - data.y * 10,
    ];
    if (
      temp[0] < 0 ||
      temp[0] > screenWidth ||
      temp[1] < 0 ||
      temp[1] > screenHeight
    ) {
      switch (player.bordersEnabled) {
        case true:
          temp = checkBoundaries(temp);
        case false:
          temp = noBoundaries(temp);
      }
    }

    entities.player.position = temp;
    return entities;
  }

  function DetectCollision(entities, { events, dispatch, time }) {
    const player = entities.player;
    const projectiles = [
      entities.projectiles1,
      entities.projectiles2,
      entities.projectiles3,
      entities.projectiles4,
      entities.projectiles5,
      entities.projectiles6,
    ];
    const gameInfo = entities.gameInfo;

    for (let i = 0; i < projectiles.length; i++) {
      let projectile = projectiles[i];
      for (let j = 0; j < projectile.elements.length; j++) {
        let dx = projectile.elements[j][0] + 25 - (player.position[0] + 15);
        let dy = projectile.elements[j][1] + 25 - (player.position[1] + 15);
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 40) {
          setLives(lives - 1);
          projectile.elements.splice(j, 1);

          if (lives - 1 == 0) {
            let random = Math.floor(Math.random() * 3);
            while (gameInfo.currentPhase == random) {
              random = Math.floor(Math.random() * 3);
            }

            gameInfo.currentPhase = random;
            saveScores();
            dispatch("game-over");
          }
        }
      }
    }

    return entities;
  }

  function restart() {
    engine.current.dispatch("restart");
    setLives(3);
    setIsGameRunning(true);
    setModalVisible(false)
  }

  function toStart() {
      restart()
      navigation.navigate("Start");
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <ImageBackground
        style={styles.container}
        source={require("../sprites/stageBG.png")}
        resizeMode="stretch"
      >
        <GameEngine
          ref={engine}
          style={{
            width: "100%",
            height: "100%",
          }}
          entities={{
            projectiles1: {
              initialPosition: screenHeight / 8,
              currentPosition: screenHeight / 8,
              elements: [],
              orientation: "horizontal",
              xspeed: 2,
              yspeed: 2,
              renderer: <ProjectileList />,
            },
            projectiles2: {
              initialPosition: (3 * screenHeight) / 8,
              currentPosition: (3 * screenHeight) / 8,
              elements: [],
              orientation: "horizontal",
              xspeed: 2,
              yspeed: 2,
              renderer: <ProjectileList />,
            },
            projectiles3: {
              initialPosition: (5 * screenHeight) / 8,
              currentPosition: (5 * screenHeight) / 8,
              elements: [],
              orientation: "horizontal",
              xspeed: 2,
              yspeed: 2,
              renderer: <ProjectileList />,
            },
            projectiles4: {
              initialPosition: (7 * screenHeight) / 8,
              currentPosition: (7 * screenHeight) / 8,
              elements: [],
              orientation: "horizontal",
              xspeed: 2,
              yspeed: 2,
              renderer: <ProjectileList />,
            },
            projectiles5: {
              initialPosition: screenWidth / 3,
              currentPosition: screenWidth / 3,
              elements: [],
              orientation: "vertical",
              xspeed: 1,
              yspeed: 2,
              renderer: <ProjectileList />,
            },
            projectiles6: {
              initialPosition: (2 * screenWidth) / 3,
              currentPosition: (2 * screenWidth) / 3,
              elements: [],
              orientation: "vertical",
              xspeed: 1,
              yspeed: 2,
              renderer: <ProjectileList />,
            },
            player: {
              position: startPos,
              xspeed: 0,
              yspeed: 0,
              bordersEnabled: true,
              renderer: <Player />,
            },
            gameInfo: {
              spaceBetween: 65,
              points: 0,
              time: 0,
              roundTimer: 0,
              currentPhase: Math.floor(Math.random() * 3),
            },
            random: {
              randomVertTime: Math.floor(Math.random() * 10) + 1,
              randomHorzTime: Math.floor(Math.random() * 10) + 1,
            },
          }}
          systems={[GameLoop, UserMovement, DetectCollision]}
          running={isGameRunning}
          onEvent={(e) => {
            switch (e) {
              case "game-over":
                setIsGameRunning(false);
                return;
              default:
                typeof e === "object" || typeof e === "string"
                  ? null
                  : setPoints(e);
                return;
            }
          }}
        >
          <View
            style={{
              height: "100%",
              width: "100%",
            }}
          >
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(false);
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View style={styles.restartButtonContainer}>
                  <ImageBackground
                    source={require("../sprites/parchment.jpg")}
                    resizeMode="cover"
                    style={styles.backgroundStyle}
                  >
                    <View style={styles.restartButtonContainer}>
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={styles.restartButton}
                          onPress={restart}
                        >
                          <Text style={[styles.scoreText, { color: "white" }]}>
                            RESTART
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={styles.restartButton}
                          onPress={toStart}
                        >
                          <Text style={[styles.scoreText, { color: "white" }]}>
                            Main Menu
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </ImageBackground>
                </View>
              </View>
            </Modal>

            <View style={styles.infoDisplayRow}>
              <View
                style={[
                  styles.infoDisplayContainer,
                  { alignItems: "flex-start" },
                ]}
              >
                {lives >= 1 ? (
                  <Image
                    style={styles.heartImage}
                    source={require("../sprites/heart.png")}
                  />
                ) : (
                  <Image
                    style={styles.heartImage}
                    source={require("../sprites/emptyHeart.png")}
                  />
                )}
                {lives >= 2 ? (
                  <Image
                    style={styles.heartImage}
                    source={require("../sprites/heart.png")}
                  />
                ) : (
                  <Image
                    style={styles.heartImage}
                    source={require("../sprites/emptyHeart.png")}
                  />
                )}
                {lives >= 3 ? (
                  <Image
                    style={styles.heartImage}
                    source={require("../sprites/heart.png")}
                  />
                ) : (
                  <Image
                    style={styles.heartImage}
                    source={require("../sprites/emptyHeart.png")}
                  />
                )}
              </View>
              <View
                style={[
                  styles.infoDisplayContainer,
                  { alignItems: "flex-end" },
                ]}
              >
                <View style={styles.scoreDisplay}>
                  <Text
                    style={{
                      color: "skyblue",
                      fontSize: 20,
                      fontWeight: "bold",
                    }}
                  >
                    Points: {points}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </GameEngine>
      </ImageBackground>
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
  infoDisplayRow: {
    height: "18%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  infoDisplayContainer: {
    height: "100%",
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  heartDisplay: {
    height: "100%",
    width: "80%",
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreDisplay: {
    height: "50%",
    width: "50%",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  scoreText: {
    color: "skyblue",
    fontSize: 20,
    fontWeight: "bold",
  },
  heartImage: {
    height: "30%",
    width: "33%",
  },
  restartButton: {
    height: "30%",
    width: "100%",
    borderWidth: 5,
    borderColor: 'white',
    backgroundColor: "skyblue",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    height: "100%",
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  restartButtonContainer: {
    height: "50%",
    width: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  backgroundStyle: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

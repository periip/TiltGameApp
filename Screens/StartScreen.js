import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Modal,
  FlatList,
  StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const scores = "@scores";
const background = require("../sprites/dungeon.jpg");

export default function StartScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false)
  const [items, setItems] = useState([])
  
  const readScore = async () => {
    let userScores = await AsyncStorage.getItem(scores);
    // console.log(userScores)
    userScores = JSON.parse(userScores);
    userScores.sort(compareNumbers)

    setItems(userScores);
  };

  useEffect(() => {
    readScore();
  }, [modalVisible]);

  function compareNumbers(a, b) {
      return b.score - a.score;
    };
  const renderScores = ({ item, index }) => {
    return (
        <View style={styles.item}>
            <View style={{alignItems: 'center', justifyContent: 'center', height: '100%', width: '50%'}}>
                <Text style={{fontSize: 25, color: 'red'}}>{index + 1}.</Text>
            </View>

            <View style={{alignItems: 'center', justifyContent: 'center', height: '100%', width: '50%'}}>
                <Text style={{fontSize: 25}}>{item.score} pts</Text>
            </View>
           
        </View>
    )
  }
  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <ImageBackground
        source={background}
        resizeMode="cover"
        style={styles.backgroundStyle}
      >
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <View style={styles.container}>
            <View
              style={{
                height: "70%",
                width: "75%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ImageBackground
                source={require("../sprites/parchment.jpg")}
                resizeMode="cover"
                style={[styles.backgroundStyle, { justifyContent: "flex-end" }]}
              >
                <View
                  style={{
                    height: "5%",
                    width: "100%",
                    alignItems: "flex-end",
                    justifyContent: "flex-end",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      height: "100%",
                      width: "10%",
                      backgroundColor: "red",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={{ color: "white", fontSize: 30 }}>X</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.scoreTitleContainer}>
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      width: "50%",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 30,
                        color: "gold",
                        fontWeight: "bold",
                      }}
                    >
                      No
                    </Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      width: "50%",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 30,
                        color: "gold",
                        fontWeight: "bold",
                      }}
                    >
                      Score
                    </Text>
                  </View>
                </View>
                <View style={{ height: "80%", width: "100%" }}>
                  <FlatList
                    data={items}
                    renderItem={renderScores}
                    keyExtractor={({ id }, index) => id}
                    scrollEnabled={true}
                  />
                </View>
              </ImageBackground>
            </View>
          </View>
        </Modal>

        <View style={styles.titleContainer}>
          <Text style={styles.title}> The Dungeon </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Game")}
            style={styles.button}
          >
            <Text style={styles.buttonText}> Start </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.button}
          >
            <Text style={styles.buttonText}> High Scores </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundStyle: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    height: "50%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    height: "25%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 55,
    color: "red",
  },
  scoreTitleContainer: {
    height: "15%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    height: "50%",
    width: "50%",
    borderWidth: 7,
    borderColor: 'white',
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
  },
  buttonText: {
    fontSize: 27,
    color: 'white',
    fontWeight: 'bold'
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
});

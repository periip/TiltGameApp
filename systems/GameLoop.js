import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";

const screenWidth = Dimensions.get("screen").width - 50;
const screenHeight = Dimensions.get("screen").height - 50;
/*
Bugs:
-Rows constantly shift down
-Can't use math.random or it lags (fixed: it was == instead of =)
*/

const startPos = [screenWidth / 2, screenHeight / 2];

export default function (entities, { events, dispatch, time }) { 
  const gameInfo = entities.gameInfo
  const random = entities.random
  const player = entities.player
  const projectiles = [entities.projectiles1, entities.projectiles2, entities.projectiles3, entities.projectiles4]
  const phases = [phase1, phase2, phase3]

  events.forEach((e) => {
    switch (e) {
      case "restart":
        for (let i = 0; i < projectiles.length; i++) {
          projectiles[i].elements = [];
          projectiles[i].currentPosition = projectiles[i].initialPosition
        }
        player.position = startPos;
        entities.projectiles5.elements = []
        entities.projectiles6.elements = []
        entities.projectiles5.elements.currentPosition =
          entities.projectiles5.elements.initialPosition;
        entities.projectiles6.elements.currentPosition =
          entities.projectiles5.elements.initialPosition;
        gameInfo.points = 0
        gameInfo.roundTimer = 0
        gameInfo.time = 0
        dispatch(gameInfo.points)
      }
   });

  if (gameInfo.time == 0 || Math.floor(time.current / 1000) - gameInfo.time == 1) {
    gameInfo.time = Math.floor(time.current / 1000);
    gameInfo.points++
    gameInfo.roundTimer++;
    dispatch(gameInfo.points);
  }

  if (gameInfo.roundTimer >= 5 && gameInfo.currentPhase == 2) {
    projectiles[4] = entities.projectiles5;
    projectiles[5] = entities.projectiles6;
  } else {
    entities.projectiles5.elements = [];
    entities.projectiles6.elements = [];
  }

  if (gameInfo.roundTimer >= 20) {
    gameInfo.roundTimer = 0
    let random = Math.floor(Math.random() * 3)
    while (gameInfo.currentPhase == random) {
      random = Math.floor(Math.random() * 3)
    } 
    
    gameInfo.currentPhase = random
  }

  for (let i = 0; i < projectiles.length; i++) {
    move(projectiles[i]);
    phases[gameInfo.currentPhase](projectiles[i])
  }

  function phase1(projectiles) {
    for (let i = 0; i < projectiles.elements.length; i++) {
      switch (projectiles.orientation) {
        case "horizontal":
          projectiles.elements[i][0] += projectiles.xspeed;
          break;
        case "vertical":
          projectiles.elements[i][1] += projectiles.yspeed;
          break;
      }

      projectiles.elements[i][1] += projectiles.yspeed;
      projectiles.currentPosition = projectiles.elements[i][1];
      if (projectiles.elements[i][1] > screenHeight + 25) {
        projectiles.elements[i][1] = -25;
      }
    }
  }
  

  function phase2(projectiles) {
    for (let i = 0; i < projectiles.elements.length; i++) {
      switch (projectiles.orientation) {
        case "horizontal":
          projectiles.elements[i][0] += projectiles.xspeed;
          break;
        case "vertical":
          projectiles.elements[i][1] += projectiles.yspeed;
          break;
      }

      projectiles.elements[i][1] += projectiles.yspeed;
      projectiles.currentPosition = projectiles.initialPosition;
      if (projectiles.elements[i][1] > screenHeight + 25) {
        projectiles.elements[i][1] = -25;
      }
    }
  }

  function phase3(projectiles) {
    entities.projectiles5.elements.currentPosition =
      entities.projectiles5.elements.initialPosition;
    entities.projectiles6.elements.currentPosition =
      entities.projectiles6.elements.initialPosition;

    if (gameInfo.roundTimer < 10 + Math.max(random.randomHorzTime, random.randomVertTime) && gameInfo.roundTimer > 10) { 
      player.bordersEnabled = false
    } else {
      player.bordersEnabled = true
    } 
    
    for (let i = 0; i < projectiles.elements.length; i++) {
      switch (projectiles.orientation) {
        case "horizontal":
          projectiles.elements[i][0] += projectiles.xspeed;
          if (gameInfo.roundTimer >= 10 && gameInfo.roundTimer < 10 + random.randomHorzTime) {
            projectiles.elements[i][1] += projectiles.yspeed
            projectiles.currentPosition = projectiles.elements[i][1];

            if (projectiles.elements[i][1] > screenHeight) {
              projectiles.elements[i][1] = -25
            }
          }

          break
        case "vertical":
          projectiles.elements[i][1] += projectiles.yspeed;
          if (gameInfo.roundTimer >= 10 && gameInfo.roundTimer < 10 + random.randomVertTime) {
            projectiles.elements[i][0] += projectiles.xspeed
            projectiles.currentPosition = projectiles.elements[i][0];

            if (projectiles.elements[i][0] > screenWidth) {
              projectiles.elements[i][0] = -25
            }
          }

          break
        }
    }
  }

  function phase4(projectiles) {

  }
  function move(projectiles) {

    switch (projectiles.orientation) {
      case "horizontal":
        if (
          projectiles.elements.length == 0 ||
          projectiles.elements[projectiles.elements.length - 1][0] >
            gameInfo.spaceBetween
        ) {
          projectiles.elements.push([-50, projectiles.currentPosition]);
        }
        if (projectiles.elements[0][0] > screenWidth + 50) {
          projectiles.elements.splice(0, 1);
        }

        break;
      case "vertical":
        if (
          projectiles.elements.length == 0 ||
          projectiles.elements[projectiles.elements.length - 1][1] >
            gameInfo.spaceBetween
        ) {
          projectiles.elements.push([projectiles.currentPosition, -50]);
        }
        if (projectiles.elements[0][1] > screenHeight + 50) {
          projectiles.elements.splice(0, 1);
        }
        break;
    }
  } 

  return entities
}

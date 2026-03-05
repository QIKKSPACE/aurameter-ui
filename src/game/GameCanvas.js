import { Canvas } from "@shopify/react-native-skia";
import { StyleSheet } from "react-native";
import { City } from "./City";
import { Trees } from "./Trees";
import { Road } from "./Road";
import { Car } from "./Car";

export function GameCanvas() {
  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <City /> 
      <Trees />   
      <Road />    
      <Car />     
    </Canvas>
  );
}

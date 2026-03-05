import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";

import Grid from "../components/puzzle/Grid";
import AppText from "../components/AppText"; // replace with Text if you don’t have this
import { useDispatch } from "react-redux";
import { nextLevel } from "../store/puzzleSlice";

const Maths = () => {
  const navigation = useNavigation();
  const dispatch=useDispatch()
  const [validate, setValidate] = useState(false);


  return (
    <View style={styles.container}>
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
          <Icon name="arrow-back" size={24} color="#fff" />
           <AppText style={styles.title}>Number Game</AppText>
        </TouchableOpacity>

        {/* Title */}
       

        {/* Right Actions */}
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.iconButton} onPress={()=>{dispatch(nextLevel())}}>
            <MaterialIcon name="refresh" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcon name="trophy" size={22} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- GAME AREA ---------- */}
      <ScrollView
        horizontal
        contentContainerStyle={{ flexGrow: 1 }}
        showsHorizontalScrollIndicator={false}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
      <Grid validate={validate} />

          <TouchableOpacity
  style={styles.validateBtn}
  onPress={() => setValidate(true)}
>
  <AppText style={styles.validateText}>Validate</AppText>
</TouchableOpacity>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default Maths;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },

  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  title: {
     marginLeft:10,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },

  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    marginLeft: 14,
  },
  validateBtn: {
  margin: 16,
  paddingVertical: 14,
  borderRadius: 12,
  backgroundColor: "#10b981",
  alignItems: "center",
},
validateText: {
  color: "#020617",
  fontWeight: "700",
  fontSize: 16,
},
});

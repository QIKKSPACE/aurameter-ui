import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { themes } from "../themes/themes";
import { useJobTheme } from "../context/JobThemeContext";

const JobCard = ({ job }) => {
  const { currentTheme } = useJobTheme();
  const theme = themes[currentTheme];

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Instead of resetting to 0, fade smoothly from current to 1
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentTheme]);

  if (!job) return null;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: "#FFF9F1",
          opacity: fadeAnim, // now crossfades
        },
      ]}
    >
      {/* Logo Box */}
      <View style={[styles.logoBox]}>
        <Text style={styles.logoText}>{job.company}</Text>
      </View>

      {/* Job Title & Company */}
      <Text style={[styles.title, { color: theme.text }]}>{job.title}</Text>
      <Text style={styles.subtitle}>{job.company}</Text>

      {/* Location & Salary */}
      <View style={styles.row}>
        <Icon name="location-on" size={20} color={theme.primary} />
        <Text style={styles.info}>{job.location}</Text>
        <Icon
          name="payments"
          size={20}
          color={theme.accent}
          style={{ marginLeft: 16 }}
        />
        <Text style={styles.info}>{job.salary}</Text>
      </View>

      {/* Job Type & Remote */}
      <View style={styles.row}>
        <Icon name="work" size={20} color={theme.accent} />
        <Text style={styles.info}>{job.type}</Text>
        <Icon
          name="home"
          size={20}
          color={theme.accent}
          style={{ marginLeft: 16 }}
        />
        <Text style={styles.info}>{job.remote}</Text>
      </View>

      {/* Skills */}
      <Text style={[styles.keySkillsLabel, { color: theme.primary }]}>
        Key Skills:
      </Text>
      <Text style={styles.keySkills}>{job.skills}</Text>

      {/* Footer */}
      <Text style={styles.bottomText}>
        👉 Swipe Right to Apply | 👈 Swipe Left to Skip
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 24,
    marginVertical: 30,
    width: 340,
    minHeight: 480,
    alignSelf: "center",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8, // nice floating look
  },
  logoBox: {
    width: 120,
    height: 100,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "blue",
  },
  logoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 17,
    color: "#444",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  info: {
    marginLeft: 6,
    fontSize: 16,
    color: "#0D1B2A",
  },
  keySkillsLabel: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: "bold",
  },
  keySkills: {
    fontSize: 15,
    marginTop: 6,
    color: "#0D1B2A",
  },
  bottomText: {
    marginTop: 28,
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
  },
});

export default JobCard;

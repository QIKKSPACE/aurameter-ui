import React, { useRef } from "react";
import { SafeAreaView, Text, TouchableOpacity, StyleSheet, View } from "react-native";
import Swiper from "react-native-deck-swiper";
import { useJobTheme } from "../context/JobThemeContext";
import { themes } from "../themes/themes";
import BlobBackground from "../components/BlobBackground";
import JobCard from "../components/JobCard";

const dummyJobs = [
  {
    id: 1,
    company: "Infosys",
    title: "Software Engineer",
    location: "Bangalore, India",
    salary: "₹8–12 LPA",
    type: "Full-time",
    remote: "Remote",
    skills: "Python, Django, REST APIs",
  },
  {
    id: 2,
    company: "TCS",
    title: "Frontend Developer",
    location: "Hyderabad, India",
    salary: "₹6–10 LPA",
    type: "Full-time",
    remote: "Hybrid",
    skills: "React, Redux, TypeScript",
  },
  {
    id: 3,
    company: "Amazon",
    title: "Data Engineer",
    location: "Chennai, India",
    salary: "₹12–18 LPA",
    type: "Full-time",
    remote: "Remote",
    skills: "Python, SQL, AWS, Spark",
  },
  {
    id: 4,
    company: "Microsoft",
    title: "Cloud Engineer",
    location: "Pune, India",
    salary: "₹15–20 LPA",
    type: "Full-time",
    remote: "On-site",
    skills: "Azure, Kubernetes, DevOps",
  },
];

const JobSwiper = () => {
  const { currentTheme, nextTheme } = useJobTheme();
  const theme = themes[currentTheme];
  const swiperRef = useRef(null);
const handleSwipeRight = (cardIndex) => {
  console.log("Applied to:", dummyJobs[cardIndex % dummyJobs.length].title);
  nextTheme(); // always cycle
};

const handleSwipeLeft = (cardIndex) => {
  console.log("Skipped:", dummyJobs[cardIndex % dummyJobs.length].title);
  nextTheme(); // always cycle
};

  const handleSwipedAll = () => {
    console.log("Reached end, restarting...");
    // No need for jumpToCardIndex if infinite={true}
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Blob Background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <BlobBackground theme={currentTheme} />
      </View>

      <View style={styles.swiperWrapper}>
       <Swiper
  ref={swiperRef}
  cards={dummyJobs}
  renderCard={(job) => <JobCard job={job} />}
  onSwipedRight={handleSwipeRight}
  onSwipedLeft={handleSwipeLeft}
  onSwipedAll={handleSwipedAll}
  cardIndex={0}
  backgroundColor="transparent"
  stackSize={1}          // only 1 card visible
  stackSeparation={0}    // no spacing
  infinite
  animateCardOpacity
  disableTopSwipe
  disableBottomSwipe
/>

        {/* Floating Theme Switch Button */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // centers vertically
   
  },
  swiperWrapper: {
    flex: 1,
    justifyContent: "center", // also keeps Swiper centered
    alignItems: "center",
  },
  button: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default JobSwiper;

import React from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/Ionicons";
import Swiper from "react-native-swiper";
import ScreenBackground from "../components/ScreenBackground";
import { useTheme } from "../constants/context/ThemeContext";
import AppText from "../components/AppText";

// Import custom image for Tetris
import TetrisImage from "../assets/tetris.png";
import QuizImage from "../assets/quiz.png";
import Maths from "../assets/math.png";
import Words from "../assets/word.png";
import Mood from "../assets/mood.png";
import Balls from "../assets/ballsort.png";





const challenges = [
  { id: "1", title: "Tetris", image: TetrisImage, color: "white", screen: "TetrisScreen" },
  { id: "2", title: "Sudoku", icon: "grid", color: "white", screen: "SudokuScreen" },
  { id: "3", title: "Daily Quiz", image: QuizImage, color: "white", screen: "QuizScreen" },
  { id: "4", title: "Number Game", image: Maths, color: "white", screen: "Maths" },
  { id: "5", title: "Word Completion",image: Words, color: "white", screen: "WordComp" },
  { id: "6", title: "KenKen", icon: "puzzle-outline", color: "white", screen: "KenKenGame" },
  { id: "7", title: "Breathing", icon: "meditation", color: "white", screen: "BreathingScreen" },
  { id: "8", title: "Mood Journal", image: Mood, color: "white", screen: "MoodJournalScreen" },
  { id: "9", title: "Ball Sort",image: Balls, color: "white", screen: "BallSortGame" },
  { id: "10", title: "Take A Walk", icon: "walk", color: "white", screen: "Walking" },
  { id: "11", title: "Snake Master", icon: "snake", color: "white", screen: "SnakeGame" },
  { id: "12", title: "Zip Challenge", icon: "lightning-bolt", color: "white", screen: "ZipGame" },
  { id: "13", title: "Minesweeper", icon: "landmine", color: "white", screen: "MinesweeperGame" },
  { id: "14", title: "2048", icon: "numeric", color: "white", screen: "Game2048" },
  { id: "15", title: "Math Maze", icon: "maze", color: "white", screen: "MathMaze" },
  { id: "16", title: "Tic Tac Toe", icon: "noughts-and-crosses", color: "white", screen: "TicTacToe" },
];

const auraTasks = [
   { id: "0", title: "Add A Story", icon: "plus", points: "+10" },
  { id: "1", title: "Just Breathe", icon: "meditation", points: "+10" },
  { id: "2", title: "Add Journal", icon: "book", points: "+2" },
  { id: "3", title: "Solve Suduko", icon: "grid", points: "+10" },
];

const MindbloomDaily = ({ navigation }) => {
  const { theme } = useTheme();

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.taskCard,
        {
          backgroundColor: theme.background.color,
          opacity: theme.opacity.light,
          shadowColor: theme.text.primary,
          borderColor: theme.components.border,
          borderWidth: 1,
        },
      ]}
      activeOpacity={0.9}
    >
      {/* Floating + Aura Badge */}
      <View style={[styles.badge, { backgroundColor: theme.components.box }]}>
        <AppText style={styles.badgeText}>{item.points}</AppText>
      </View>

      <View style={styles.taskIconContainer}>
        <MaterialIcon name={item.icon} size={28} color={theme.text.accent} />
      </View>

      <AppText
        variant="h3"
        style={[
          {
            color: theme.text.primary,
            fontSize: 8,
            textAlign: "center",
            marginBottom: 20,
          },
        ]}
        numberOfLines={1}
      >
        {item.title}
      </AppText>
    </TouchableOpacity>
  );

  const renderChallenge = ({ item }) => (
    <TouchableOpacity
      style={[styles.challengeCard, { backgroundColor: item.color, opacity: theme.opacity.light }]}
      onPress={() => navigation.navigate(item.screen)}
      activeOpacity={0.85}
    >
      {/* Render image if provided, otherwise icon */}
      {item.image ? (
        <Image source={item.image} style={{ width: 32, height: 32, resizeMode: "contain" }} />
      ) : (item.id == "10" || item.id == "7" || item.id == "11" )? (
        <MaterialIcon name={item.icon} size={32} color="black" />
      ) : (
        <Icon name={item.icon} size={32} color="black" />
      )}

      <AppText variant="h4" style={styles.challengeLabel}>
        {item.title}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <ScreenBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcon name="arrow-left" size={26} color={theme.text.primary} />
          </TouchableOpacity>
          <AppText variant="h3" style={{ color: theme.text.primary, fontSize: 24, fontWeight: 600 }}>
            Aura Castle
          </AppText>
          <View style={{ width: 26 }} />
        </View>

        {/* Carousel */}
        <View style={styles.carouselWrapper}>
          <Swiper autoplay autoplayTimeout={3} showsPagination loop>
            {[1, 2, 3].map((i) => (
              <Image
                key={i}
                source={{ uri: `https://picsum.photos/700/400?random=${i}` }}
                style={styles.image}
              />
            ))}
          </Swiper>
        </View>

        {/* Subtitle */}
        <View
          style={{
            backgroundColor: theme.background.color,
            opacity: theme.opacity.light,
            width: "90%",
            alignSelf: "center",
            marginVertical: 10,
            borderRadius: 10,
            padding: 10,
          }}
        >
          <AppText style={[styles.subtitle, { color: theme.text.primary }]}>
            Complete tasks and challenges to boost aura.
          </AppText>
        </View>

        {/* Aura Tasks */}
        <FlatList
          data={auraTasks}
          horizontal
          renderItem={renderTask}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          style={{ marginTop: 10 }}
        />

        {/* Section label */}
        <AppText
          style={{ color: theme.text.primary, fontSize: 18, marginTop: 20, marginBottom: 10, marginHorizontal: 20 }}
          variant="h2"
        >
          Challenges
        </AppText>

        {/* Challenges Grid */}
        <FlatList
          data={challenges}
          renderItem={renderChallenge}
          numColumns={3}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        />
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  carouselWrapper: { height: 170, marginHorizontal: 16, borderRadius: 18, overflow: "hidden", marginTop: 6 },
  image: { width: "100%", height: "100%" },
  subtitle: { textAlign: "center", fontSize: 14 },
  taskCard: {
    width: 100,
    height: 100,
    paddingVertical: 10,
    borderRadius: 18,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
  },
  taskIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    marginTop: 10,
    marginBottom: 10,
  },
  challengeCard: {
    flex: 1,
    alignItems: "center",
    margin: 6,
    borderRadius: 14,
    paddingVertical: 14,
  },
  challengeLabel: { fontSize: 10, marginTop: 6, fontWeight: "600", color: "black", textAlign: "center" },
});

export default MindbloomDaily;

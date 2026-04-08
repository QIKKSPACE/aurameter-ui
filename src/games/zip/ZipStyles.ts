/**
 * Zip Challenge Styles
 */

import { StyleSheet } from "react-native";

export const createZipStyles = (theme: any, boardSize: number) => {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background.color,
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: theme.background.color,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text.primary,
      flex: 1,
      textAlign: "center",
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    statItem: {
      alignItems: "center",
    },
    statLabel: {
      fontSize: 12,
      color: theme.text.secondary,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text.primary,
    },
    boardContainer: {
      alignItems: "center",
      marginVertical: 16,
    },
    board: {
      width: boardSize,
      height: boardSize,
      backgroundColor: theme.background.secondary,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: theme.text.secondary,
    },
    boardOverlay: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 12,
    },
    gridCell: {
      position: "absolute",
      borderWidth: 1,
      borderColor: theme.text.secondary + "20",
    },
    node: {
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 50,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 5,
    },
    nodeNumber: {
      fontSize: 14,
      fontWeight: "700",
      color: "#000",
    },
    nodePulse: {
      position: "absolute",
      borderRadius: 50,
      borderWidth: 2,
    },
    obstacleCell: {
      position: "absolute",
      backgroundColor: theme.text.secondary + "40",
      borderRadius: 2,
    },
    pathSvg: {
      position: "absolute",
      top: 0,
      left: 0,
    },
    controlsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    controlButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: theme.text.secondary,
    },
    controlButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text.primary,
    },
    controlButtonDisabled: {
      opacity: 0.5,
    },
    hintSection: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      marginBottom: 16,
      borderRadius: 8,
      backgroundColor: theme.background.secondary,
    },
    howToPlayHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    howToPlayTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text.primary,
    },
    howToPlayContent: {
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    howToPlayText: {
      fontSize: 12,
      color: theme.text.secondary,
      marginBottom: 8,
      lineHeight: 18,
    },
    howToPlayStep: {
      flexDirection: "row",
      marginBottom: 12,
      alignItems: "flex-start",
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    stepNumberText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#fff",
    },
    stepText: {
      fontSize: 12,
      color: theme.text.secondary,
      flex: 1,
      flexWrap: "wrap",
    },
    completionModal: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.7)",
    },
    completionContent: {
      backgroundColor: theme.background.color,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      maxWidth: "85%",
    },
    completionTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text.primary,
      marginBottom: 12,
      textAlign: "center",
    },
    completionText: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 20,
      textAlign: "center",
    },
    completionButtons: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    completionButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    dummyBox: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginBottom: 16,
    },
  });
};

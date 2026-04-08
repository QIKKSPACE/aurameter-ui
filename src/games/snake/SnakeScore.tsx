import React, { memo } from "react";
import { View } from "react-native";
import AppText from "../../components/AppText";
import { GAME_CONFIG } from "./GameConfig";

type SnakeScoreProps = {
  score: number;
  highScore: number;
  multiplier: number;
  streak: number;
  progress: number;
  shieldCharges: number;
  isPaused: boolean;
  styles: ReturnType<typeof import("./SnakeStyles").createSnakeStyles>;
  theme: any;
};

const ProgressBar = memo(
  ({ progress, theme }: { progress: number; theme: any }) => (
    <View
      style={{
        height: GAME_CONFIG.PROGRESS_BAR_HEIGHT,
        borderRadius: GAME_CONFIG.PROGRESS_BAR_BORDER_RADIUS,
        overflow: "hidden",
        backgroundColor: theme.components.box,
        marginTop: GAME_CONFIG.PROGRESS_BAR_MARGIN_TOP,
      }}
    >
      <View
        style={{
          width: `${Math.max(0, Math.min(100, progress * 100))}%`,
          height: "100%",
          backgroundColor: theme.text.accent,
        }}
      />
    </View>
  ),
);

function SnakeScoreComponent({
  score,
  highScore,
  multiplier,
  streak,
  progress,
  shieldCharges,
  isPaused,
  styles,
  theme,
}: SnakeScoreProps) {
  return (
    <View style={styles.scoreCard}>
      <View style={styles.titleRow}>
        <View>
          <AppText variant="h3">{GAME_CONFIG.STRINGS.TITLE}</AppText>
          <AppText variant="caption" style={{ color: theme.text.secondary }}>
            {isPaused ? GAME_CONFIG.STRINGS.PAUSED_TEXT : GAME_CONFIG.STRINGS.COMBO_HINT}
          </AppText>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <AppText variant="caption" style={{ color: theme.text.secondary }}>
            {GAME_CONFIG.STRINGS.HIGH_SCORE_LABEL}
          </AppText>
          <AppText variant="h3">{highScore}</AppText>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <AppText variant="caption" style={{ color: theme.text.secondary }}>
            {GAME_CONFIG.STRINGS.SCORE_LABEL}
          </AppText>
          <AppText variant="h1" style={{ lineHeight: GAME_CONFIG.SCORE_DISPLAY_LINE_HEIGHT }}>
            {score}
          </AppText>
        </View>

        <View style={{ alignItems: "center" }}>
          <AppText variant="caption" style={{ color: theme.text.secondary }}>
            {GAME_CONFIG.STRINGS.MULTIPLIER_LABEL}
          </AppText>
          <AppText variant="h2" style={{ color: theme.text.accent }}>
            x{multiplier}
          </AppText>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <AppText variant="caption" style={{ color: theme.text.secondary }}>
            {GAME_CONFIG.STRINGS.SHIELD_LABEL}
          </AppText>
          <AppText variant="h2">{shieldCharges}</AppText>
        </View>
      </View>

      <ProgressBar progress={progress} theme={theme} />

      <View style={styles.footerRow}>
        <View style={styles.chip}>
          <AppText variant="caption" style={{ color: theme.text.secondary }}>
            {GAME_CONFIG.STRINGS.COMBO_LABEL}
          </AppText>
          <AppText variant="button">{streak}</AppText>
        </View>

        <View style={styles.chip}>
          <AppText variant="caption" style={{ color: theme.text.secondary }}>
            {GAME_CONFIG.STRINGS.PACE_LABEL}
          </AppText>
          <AppText variant="button">
            {progress >= GAME_CONFIG.PACE_THRESHOLDS.FAST ? GAME_CONFIG.STRINGS.PACE_FAST : progress >= GAME_CONFIG.PACE_THRESHOLDS.RISING ? GAME_CONFIG.STRINGS.PACE_RISING : GAME_CONFIG.STRINGS.PACE_STEADY}
          </AppText>
        </View>
      </View>
    </View>
  );
}

export default memo(SnakeScoreComponent);

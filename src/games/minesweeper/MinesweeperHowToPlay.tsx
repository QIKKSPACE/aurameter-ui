import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';

type Props = {
  onContinue: () => void;
};

const MinesweeperHowToPlayComponent = ({ onContinue }: Props) => {
  const styles = useMemo(() => {
    return StyleSheet.create({
      overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#111111',
        zIndex: 100,
      },
      container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
        paddingBottom: 60,
      },
      titleText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
      },
      subtitleText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 36,
      },
      rulesContainer: {
        flex: 1,
      },
      ruleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
      },
      ruleBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4FC3F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        marginTop: 2,
      },
      ruleBadgeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
      },
      ruleContent: {
        flex: 1,
      },
      ruleTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
      },
      ruleDescription: {
        fontSize: 13,
        fontWeight: '400',
        color: 'rgba(255,255,255,0.55)',
        lineHeight: 19,
      },
      bottomSection: {
        marginTop: 32,
        paddingHorizontal: 24,
      },
      continueButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: '#4FC3F7',
        alignItems: 'center',
        justifyContent: 'center',
      },
      continueButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
      },
      skipText: {
        marginTop: 12,
        textAlign: 'center',
        fontSize: 12,
        color: 'rgba(255,255,255,0.25)',
      },
    });
  }, []);

  const rules = [
    {
      number: '1',
      title: 'Tap to Reveal',
      description:
        'Tap any cell to reveal it. Your first tap is always safe — no mine will be there.',
    },
    {
      number: '2',
      title: 'Read the Numbers',
      description:
        'A revealed number shows how many mines are in the 8 surrounding cells. Use this to figure out where mines are hiding.',
    },
    {
      number: '3',
      title: 'Flag a Mine',
      description:
        'Long-press any unrevealed cell to place a flag where you think a mine is. Long-press again to remove the flag.',
    },
    {
      number: '4',
      title: 'Win the Game',
      description:
        'Reveal every safe cell to win. You do not need to flag all mines — just uncover everything that is not a mine.',
    },
  ];

  return (
    <View style={styles.overlay}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <AppText style={styles.titleText}>Minesweeper</AppText>
        <AppText style={styles.subtitleText}>Clear the field. Avoid the mines.</AppText>

        <View style={styles.rulesContainer}>
          {rules.map((rule) => (
            <View key={rule.number} style={styles.ruleRow}>
              <View style={styles.ruleBadge}>
                <AppText style={styles.ruleBadgeText}>{rule.number}</AppText>
              </View>
              <View style={styles.ruleContent}>
                <AppText style={styles.ruleTitle}>{rule.title}</AppText>
                <AppText style={styles.ruleDescription}>{rule.description}</AppText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity activeOpacity={0.7} onPress={onContinue} style={styles.continueButton}>
            <AppText style={styles.continueButtonText}>Start Playing</AppText>
          </TouchableOpacity>
          <AppText style={styles.skipText}>Tap anywhere outside to dismiss</AppText>
        </View>
      </ScrollView>
    </View>
  );
};

export const MinesweeperHowToPlay = React.memo(MinesweeperHowToPlayComponent);

import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';

type Props = {
  onContinue: () => void;
};

const KenKenHowToPlayComponent = ({ onContinue }: Props) => {
  const styles = useMemo(() => {
    return StyleSheet.create({
      overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0D0D0D',
        zIndex: 100,
      },
      container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
        paddingBottom: 60,
      },
      titleText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
      },
      subtitleText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.45)',
        marginBottom: 32,
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
        backgroundColor: '#8B8FE8',
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
        backgroundColor: '#8B8FE8',
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
      title: 'Fill the Grid',
      description:
        'Place numbers 1 to N in every row and column. No number can repeat in the same row or column.',
    },
    {
      number: '2',
      title: 'Cage Clues',
      description:
        'Each outlined cage shows a target number and operation. The numbers inside must equal the target using that operation.',
    },
    {
      number: '3',
      title: 'Operations',
      description:
        "'+' means add, '-' means subtract (2 cells), 'x' means multiply, '/' means divide (2 cells). A lone number means that cell equals that value.",
    },
    {
      number: '4',
      title: 'Tap to Select',
      description:
        'Tap any cell to select it, then tap a number below. Long-tap a cell or use the pencil mode to add notes.',
    },
  ];

  return (
    <View style={styles.overlay}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <AppText style={styles.titleText}>KenKen</AppText>
        <AppText style={styles.subtitleText}>Math Logic Puzzle</AppText>

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

export const KenKenHowToPlay = React.memo(KenKenHowToPlayComponent);

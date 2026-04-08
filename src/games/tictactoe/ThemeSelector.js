/**
 * ThemeSelector.js
 * Bottom-sheet drawer for selecting game themes.
 * Uses @gorhom/bottom-sheet (already in aurameter-ui).
 */

import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { THEME_LIST } from './themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ThemeSelector = forwardRef(({ currentThemeId, onSelectTheme, theme }, ref) => {
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['45%'], []);

    useImperativeHandle(ref, () => ({
        open: () => bottomSheetRef.current?.snapToIndex(0),
        close: () => bottomSheetRef.current?.close(),
    }));

    const handleSelectTheme = useCallback(
        (themeId) => {
            onSelectTheme(themeId);
        },
        [onSelectTheme],
    );

    const renderThemeCard = useCallback(
        (t) => {
            const isActive = t.id === currentThemeId;
            return (
                <TouchableOpacity
                    key={t.id}
                    style={[
                        styles.themeCard,
                        {
                            borderColor: isActive ? theme.accentColor : 'transparent',
                            backgroundColor: isActive
                                ? `${theme.accentColor}20`
                                : 'rgba(255,255,255,0.08)',
                        },
                    ]}
                    onPress={() => handleSelectTheme(t.id)}
                    activeOpacity={0.7}
                >
                    <View
                        style={[
                            styles.colorPreview,
                            { backgroundColor: t.bgGradient[0] },
                        ]}
                    >
                        <View style={styles.previewBoard}>
                            <View style={[styles.previewCell, { backgroundColor: t.cellBg }]}>
                                <Text style={[styles.previewPiece, { color: t.xColor }]}>X</Text>
                            </View>
                            <View style={[styles.previewCell, { backgroundColor: t.cellBg }]}>
                                <Text style={[styles.previewPiece, { color: t.oColor }]}>O</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.themeIcon}>{t.icon}</Text>
                    <Text
                        style={[
                            styles.themeName,
                            { color: isActive ? theme.accentColor : '#FFFFFF' },
                        ]}
                    >
                        {t.name}
                    </Text>
                    {isActive && (
                        <View
                            style={[
                                styles.activeBadge,
                                { backgroundColor: theme.accentColor },
                            ]}
                        >
                            <Text style={styles.activeBadgeText}>✓</Text>
                        </View>
                    )}
                </TouchableOpacity>
            );
        },
        [currentThemeId, handleSelectTheme, theme],
    );

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            backgroundStyle={[
                styles.sheetBackground,
                { backgroundColor: theme.boardColor },
            ]}
            handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
        >
            <BottomSheetView style={styles.sheetContent}>
                <Text style={[styles.sheetTitle, { color: theme.textColor }]}>
                    🎨 Select Theme
                </Text>
                <View style={styles.themeGrid}>
                    {THEME_LIST.map(renderThemeCard)}
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
});

ThemeSelector.displayName = 'ThemeSelector';

const styles = StyleSheet.create({
    sheetBackground: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    sheetContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 20,
    },
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    themeCard: {
        width: (SCREEN_WIDTH - 64) / 2.5,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderWidth: 2,
    },
    colorPreview: {
        width: 56,
        height: 40,
        borderRadius: 10,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewBoard: {
        flexDirection: 'row',
        gap: 4,
    },
    previewCell: {
        width: 20,
        height: 20,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewPiece: {
        fontSize: 10,
        fontWeight: '900',
    },
    themeIcon: {
        fontSize: 18,
        marginBottom: 4,
    },
    themeName: {
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },
    activeBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '800',
    },
});

export default memo(ThemeSelector);

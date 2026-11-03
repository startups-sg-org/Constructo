import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  ConstructoColors,
  ConstructoRadius,
  ConstructoShadows,
} from '../../constants/theme';
import { Icon, IconName } from './icon';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  iconName?: IconName;
  badgeCount?: number;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  return (
    <View style={[styles.segmentedTrack, style]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <SegmentItem
            key={opt.value}
            option={opt}
            active={active}
            onPress={() => {
              if (!active) {
                Haptics.selectionAsync();
                onChange(opt.value);
              }
            }}
          />
        );
      })}
    </View>
  );
}

function SegmentItem<T extends string>({
  option,
  active,
  onPress,
}: {
  option: SegmentOption<T>;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.segmentButton,
        active ? styles.segmentButtonActive : null,
        pressed && !active ? styles.segmentButtonPressed : null,
      ]}
    >
      {option.iconName ? (
        <Icon
          name={option.iconName}
          size={14}
          color={active ? ConstructoColors.primaria : ConstructoColors.textoSuave}
        />
      ) : null}
      <Text
        style={[
          styles.segmentLabel,
          active ? styles.segmentLabelActive : styles.segmentLabelInactive,
        ]}
        numberOfLines={1}
      >
        {option.label}
      </Text>
      {option.badgeCount !== undefined && option.badgeCount > 0 ? (
        <View style={[styles.badgePill, active ? styles.badgePillActive : null]}>
          <Text
            style={[
              styles.badgeText,
              active ? styles.badgeTextActive : null,
            ]}
          >
            {option.badgeCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * Barra de Navegação Inferior Corporativa (Bottom Tab Bar).
 * Estável, estática, sem saltos/pulos, com feedback tátil de alta fidelidade.
 */
export function BottomTabBar<T extends string>({
  tabs,
  activeTab,
  onSelectTab,
}: {
  tabs: SegmentOption<T>[];
  activeTab: T;
  onSelectTab: (tab: T) => void;
}) {
  return (
    <View style={styles.bottomBarContainer}>
      {tabs.map((tab) => {
        const active = tab.value === activeTab;
        return (
          <BottomTabButton
            key={tab.value}
            tab={tab}
            active={active}
            onPress={() => {
              if (!active) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelectTab(tab.value);
              }
            }}
          />
        );
      })}
    </View>
  );
}

function BottomTabButton<T extends string>({
  tab,
  active,
  onPress,
}: {
  tab: SegmentOption<T>;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        pressed ? styles.tabButtonPressed : null,
      ]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <View style={[styles.tabIconPill, active ? styles.tabIconPillActive : null]}>
        {tab.iconName ? (
          <Icon
            name={tab.iconName}
            size={18}
            color={active ? ConstructoColors.primaria : ConstructoColors.textoSuave}
          />
        ) : null}
        {tab.badgeCount !== undefined && tab.badgeCount > 0 ? (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{tab.badgeCount}</Text>
          </View>
        ) : null}
      </View>
      <Text
        style={[
          styles.tabLabel,
          active ? styles.tabLabelActive : styles.tabLabelInactive,
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  segmentedTrack: {
    flexDirection: 'row',
    backgroundColor: ConstructoColors.superficieSutil,
    borderRadius: ConstructoRadius.field,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    padding: 3,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  segmentButtonPressed: {
    opacity: 0.7,
  },
  segmentButtonActive: {
    backgroundColor: ConstructoColors.superficie,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    ...ConstructoShadows.card,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  segmentLabelActive: {
    color: ConstructoColors.primaria,
  },
  segmentLabelInactive: {
    color: ConstructoColors.textoSuave,
  },
  badgePill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 99,
    backgroundColor: ConstructoColors.borda,
  },
  badgePillActive: {
    backgroundColor: ConstructoColors.primariaSuave,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: ConstructoColors.textoSuave,
    fontVariant: ['tabular-nums'],
  },
  badgeTextActive: {
    color: ConstructoColors.primaria,
  },
  bottomBarContainer: {
    flexDirection: 'row',
    backgroundColor: ConstructoColors.superficie,
    borderTopWidth: 1,
    borderTopColor: ConstructoColors.borda,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabButtonPressed: {
    opacity: 0.75,
  },
  tabIconPill: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: ConstructoRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIconPillActive: {
    backgroundColor: ConstructoColors.primariaSuave,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: ConstructoColors.primaria,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: ConstructoColors.textoSuave,
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ConstructoColors.destaque,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
});

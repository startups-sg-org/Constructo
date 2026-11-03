import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ConstructoColors } from '../../constants/theme';

export type IconName =
  | 'camera'
  | 'photo-library'
  | 'building'
  | 'layers'
  | 'check-circle'
  | 'clock'
  | 'alert-circle'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'close'
  | 'plus'
  | 'minus'
  | 'search'
  | 'filter'
  | 'sync'
  | 'wifi-off'
  | 'user'
  | 'users'
  | 'logout'
  | 'document'
  | 'contract'
  | 'location'
  | 'arrow-up-right'
  | 'calendar'
  | 'shield-check'
  | 'eye'
  | 'eye-off'
  | 'trash'
  | 'edit'
  | 'switch-role'
  | 'grid'
  | 'feed'
  | 'chart'
  | 'home'
  | 'check'
  | 'info'
  | 'bolt'
  | 'sun'
  | 'archive';

interface SymbolMapping {
  ios: string;
  android: string;
  glyph: string;
}

const ICON_MAP: Record<IconName, SymbolMapping> = {
  camera: { ios: 'camera.fill', android: 'photo_camera', glyph: '◉' },
  'photo-library': { ios: 'photo.on.rectangle', android: 'photo_library', glyph: '▣' },
  building: { ios: 'building.2.fill', android: 'domain', glyph: '⌂' },
  layers: { ios: 'square.stack.3d.up.fill', android: 'layers', glyph: '≡' },
  'check-circle': { ios: 'checkmark.circle.fill', android: 'check_circle', glyph: '✓' },
  clock: { ios: 'clock.fill', android: 'schedule', glyph: '◷' },
  'alert-circle': { ios: 'exclamationmark.triangle.fill', android: 'warning', glyph: '!' },
  'chevron-right': { ios: 'chevron.right', android: 'chevron_right', glyph: '›' },
  'chevron-down': { ios: 'chevron.down', android: 'expand_more', glyph: '▾' },
  'chevron-up': { ios: 'chevron.up', android: 'expand_less', glyph: '▴' },
  'chevron-left': { ios: 'chevron.left', android: 'chevron_left', glyph: '‹' },
  close: { ios: 'xmark', android: 'close', glyph: '×' },
  plus: { ios: 'plus', android: 'add', glyph: '+' },
  minus: { ios: 'minus', android: 'remove', glyph: '−' },
  search: { ios: 'magnifyingglass', android: 'search', glyph: '⌕' },
  filter: { ios: 'line.3.horizontal.decrease', android: 'tune', glyph: '⊶' },
  sync: { ios: 'arrow.triangle.2.circlepath', android: 'sync', glyph: '↻' },
  'wifi-off': { ios: 'wifi.slash', android: 'cloud_off', glyph: '⊘' },
  user: { ios: 'person.fill', android: 'person', glyph: '●' },
  users: { ios: 'person.2.fill', android: 'group', glyph: '●●' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', glyph: '→]' },
  document: { ios: 'doc.text.fill', android: 'description', glyph: '▤' },
  contract: { ios: 'signature', android: 'assignment', glyph: '§' },
  location: { ios: 'mappin.and.ellipse', android: 'location_on', glyph: '⌖' },
  'arrow-up-right': { ios: 'arrow.up.right', android: 'north_east', glyph: '↗' },
  calendar: { ios: 'calendar', android: 'calendar_today', glyph: '▦' },
  'shield-check': { ios: 'checkmark.shield.fill', android: 'verified_user', glyph: '◈' },
  eye: { ios: 'eye.fill', android: 'visibility', glyph: '◉' },
  'eye-off': { ios: 'eye.slash.fill', android: 'visibility_off', glyph: '◎' },
  trash: { ios: 'trash.fill', android: 'delete', glyph: '×' },
  edit: { ios: 'pencil', android: 'edit', glyph: '✎' },
  'switch-role': { ios: 'arrow.left.arrow.right', android: 'swap_horiz', glyph: '⇄' },
  grid: { ios: 'square.grid.2x2.fill', android: 'grid_view', glyph: '⊞' },
  feed: { ios: 'rectangle.stack.fill', android: 'view_agenda', glyph: '▤' },
  chart: { ios: 'chart.bar.fill', android: 'bar_chart', glyph: 'lll' },
  home: { ios: 'house.fill', android: 'home', glyph: '⌂' },
  check: { ios: 'checkmark', android: 'check', glyph: '✓' },
  info: { ios: 'info.circle.fill', android: 'info', glyph: 'i' },
  bolt: { ios: 'bolt.fill', android: 'bolt', glyph: '◆' },
  sun: { ios: 'sun.max.fill', android: 'wb_sunny', glyph: '☼' },
  archive: { ios: 'archivebox.fill', android: 'inventory_2', glyph: '▤' },
};

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Componente de ícone vetorial corporativo do Constructo.
 * Renderiza SF Symbols no iOS, Material Symbols no Android/Web e fallback geométrico limpo.
 * Zero emojis genéricos de IA.
 */
export function Icon({
  name,
  size = 18,
  color = ConstructoColors.textoForte,
  style,
}: IconProps) {
  const mapping = ICON_MAP[name] || ICON_MAP.info;

  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      <SymbolView
        name={{
          ios: mapping.ios as any,
          android: mapping.android as any,
          web: mapping.android as any,
        }}
        size={size}
        tintColor={color}
        fallback={
          <Text
            style={[
              styles.fallbackText,
              {
                fontSize: Math.max(11, Math.round(size * 0.82)),
                lineHeight: size,
                color,
              },
            ]}
          >
            {mapping.glyph}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});


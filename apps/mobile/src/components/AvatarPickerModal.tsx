import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';

export interface AvatarOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  url: string;
}

export const AVATAR_LIST: AvatarOption[] = [
  // Male Avatars
  { id: 'm1', name: 'Zayn (Gamer)', gender: 'male', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Zayn' },
  { id: 'm2', name: 'Tariq (Warrior)', gender: 'male', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Tariq' },
  { id: 'm3', name: 'Bilal (Champion)', gender: 'male', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Bilal' },
  { id: 'm4', name: 'Hamza (Knight)', gender: 'male', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Hamza' },
  { id: 'm5', name: 'Ali (Ace)', gender: 'male', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Ali' },
  { id: 'm6', name: 'Omar (Legend)', gender: 'male', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Omar' },
  { id: 'm7', name: 'Hassan (Scholar)', gender: 'male', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Hassan' },
  { id: 'm8', name: 'Farhan (Captain)', gender: 'male', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Farhan' },

  // Female Avatars
  { id: 'f1', name: 'Ayesha (Star)', gender: 'female', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Ayesha' },
  { id: 'f2', name: 'Fatima (Princess)', gender: 'female', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Fatima' },
  { id: 'f3', name: 'Zainab (Queen)', gender: 'female', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Zainab' },
  { id: 'f4', name: 'Maryam (Heroine)', gender: 'female', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Maryam' },
  { id: 'f5', name: 'Sara (Champion)', gender: 'female', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Sara' },
  { id: 'f6', name: 'Noor (Radiant)', gender: 'female', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Noor' },
  { id: 'f7', name: 'Hiba (Explorer)', gender: 'female', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Hiba' },
  { id: 'f8', name: 'Anum (Ace)', gender: 'female', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Anum' },
];

interface AvatarPickerModalProps {
  visible: boolean;
  currentAvatarUrl?: string | null;
  onSelect: (url: string) => void;
  onClose: () => void;
  saving?: boolean;
}

export default function AvatarPickerModal({
  visible,
  currentAvatarUrl,
  onSelect,
  onClose,
  saving = false,
}: AvatarPickerModalProps) {
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [tempSelectedUrl, setTempSelectedUrl] = useState<string | null>(currentAvatarUrl || null);

  const filteredAvatars = AVATAR_LIST.filter(
    (a) => selectedGender === 'all' || a.gender === selectedGender
  );

  const handleApply = () => {
    if (tempSelectedUrl) {
      onSelect(tempSelectedUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Choose Your Avatar</Text>
              <Text style={styles.subtitle}>Select a character that represents you</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Gender Filter Tabs */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterTab, selectedGender === 'all' && styles.filterTabActive]}
              onPress={() => setSelectedGender('all')}
            >
              <Text style={[styles.filterTabText, selectedGender === 'all' && styles.filterTabTextActive]}>
                All Avatars
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, selectedGender === 'male' && styles.filterTabActive]}
              onPress={() => setSelectedGender('male')}
            >
              <Text style={[styles.filterTabText, selectedGender === 'male' && styles.filterTabTextActive]}>
                👨 Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, selectedGender === 'female' && styles.filterTabActive]}
              onPress={() => setSelectedGender('female')}
            >
              <Text style={[styles.filterTabText, selectedGender === 'female' && styles.filterTabTextActive]}>
                👩 Female
              </Text>
            </TouchableOpacity>
          </View>

          {/* Grid of Avatars */}
          <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {filteredAvatars.map((item) => {
                const isSelected = tempSelectedUrl === item.url;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.avatarBox, isSelected && styles.avatarBoxSelected]}
                    onPress={() => setTempSelectedUrl(item.url)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: item.url }}
                      style={styles.avatarImg}
                      resizeMode="contain"
                    />
                    <Text style={[styles.avatarName, isSelected && styles.avatarNameSelected]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={12} color={colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyBtn, (!tempSelectedUrl || saving) && { opacity: 0.6 }]}
              onPress={handleApply}
              disabled={!tempSelectedUrl || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <Text style={styles.applyBtnText}>Set Avatar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '85%',
    paddingTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.headlineSm,
    color: colors.white,
    fontSize: 18,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceMuted,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceMuted,
  },
  filterTabTextActive: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
  gridContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  avatarBox: {
    width: '23%',
    aspectRatio: 0.82,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    position: 'relative',
  },
  avatarBoxSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}20`,
  },
  avatarImg: {
    width: '100%',
    height: '70%',
    borderRadius: borderRadius.md,
  },
  avatarName: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.onSurfaceMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  avatarNameSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
  checkBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    backgroundColor: colors.surface,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    ...typography.labelMd,
    color: colors.onSurfaceMuted,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '700',
  },
});

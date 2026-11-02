import { Asset } from '@/types/types'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

interface PortfolioDetailsProps {
  visible: boolean
  asset: Asset | null
  onClose: () => void
}

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ── Action row types ─────────────────────────────────────────────────────────
type ActionRow = {
  key: string
  label: string
  icon: keyof typeof Ionicons.glyphMap
  iconColor: string
  labelColor?: string
  onPress: () => void
}

const PortfolioDetails = ({ visible, asset, onClose }: PortfolioDetailsProps) => {

  const actions: ActionRow[] = [
    {
      key: 'edit',
      label: 'Edit asset',
      icon: 'create-outline',
      iconColor: '#7c8395',
      onPress: () => {},
    },
    {
      key: 'update',
      label: 'Update valuation',
      icon: 'trending-up-outline',
      iconColor: '#7c8395',
      onPress: () => {},
    },
    {
      key: 'sold',
      label: 'Mark as sold',
      icon: 'swap-horizontal-outline',
      iconColor: '#7c8395',
      onPress: () => {},
    },
    {
      key: 'delete',
      label: 'Delete asset',
      icon: 'trash-outline',
      iconColor: '#eb5b3c',
      labelColor: '#eb5b3c',
      onPress: () => {},
    },
  ]

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>

          {/* ── Header ───────────────────────────────────────────────────── */}
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.sheetTitle}>Asset Details</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color="#6c757d" />
            </TouchableOpacity>
          </View>

          {/* ── Info Card ────────────────────────────────────────────────── */}
          <View style={styles.card}>
            {/* Row 1: Name & Type */}
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>Asset name</Text>
                <Text style={styles.value}>{asset?.name ?? '—'}</Text>
              </View>
              <View style={[styles.cell, styles.cellRight]}>
                <Text style={[styles.label, styles.textRight]}>Type</Text>
                <Text style={[styles.value, styles.textRight]}>{asset?.asset_type ?? '—'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Row 2: Invested & Current Value */}
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>Invested amount</Text>
                <Text style={styles.value}>
                  {asset ? formatCurrency(asset.invested_amount) : '—'}
                </Text>
              </View>
              <View style={[styles.cell, styles.cellRight]}>
                <Text style={[styles.label, styles.textRight]}>Current value</Text>
                <Text style={[styles.value, styles.textRight]}>
                  {asset ? formatCurrency(asset.current_value) : '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Action List ──────────────────────────────────────────────── */}
          <View style={[styles.card, styles.actionList]}>
            {actions.map((action, index) => (
              <React.Fragment key={action.key}>
                <TouchableOpacity style={styles.actionRow} onPress={action.onPress} activeOpacity={0.7}>
                  <View style={styles.actionLeft}>
                    <Ionicons name={action.icon} size={20} color={action.iconColor} />
                    <Text style={[styles.actionLabel, action.labelColor ? { color: action.labelColor } : null]}>
                      {action.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#c4c7d0" />
                </TouchableOpacity>
                {index < actions.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>

          {/* ── Sticky Bottom Action Bar ─────────────────────────────────── */}
          <View style={styles.bottomBar}>
            {/* Edit — outlined */}
            <TouchableOpacity style={styles.btnOutline} activeOpacity={0.8}>
              <Text style={styles.btnOutlineText}>Edit</Text>
            </TouchableOpacity>

            {/* Sold — orange filled */}
            <TouchableOpacity style={[styles.btnFilled, styles.btnSold]} activeOpacity={0.8}>
              <Text style={styles.btnFilledText}>Sold</Text>
            </TouchableOpacity>

            {/* Update Valuation — green filled */}
            <TouchableOpacity style={[styles.btnFilled, styles.btnUpdate]} activeOpacity={0.8}>
              <Text style={styles.btnFilledText}>Update</Text>
            </TouchableOpacity>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e6e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },

  // ── Info Card ──────────────────────────────────────────────────────────────
  card: {
    borderWidth: 1,
    borderColor: '#e6e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cell: {
    flex: 1,
    gap: 6,
  },
  cellRight: {
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f2f5',
    marginHorizontal: 16,
  },
  label: {
    fontSize: 12,
    color: '#7c8395',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#44475b',
  },
  textRight: {
    textAlign: 'right',
  },

  // ── Action List ────────────────────────────────────────────────────────────
  actionList: {
    marginTop: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44475b',
  },

  // ── Bottom Bar ─────────────────────────────────────────────────────────────
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  btnOutline: {
    flex: 1,
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00d09c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00d09c',
  },
  btnFilled: {
    flex: 2,
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFilledText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  btnSold: {
    backgroundColor: '#eb5b3c',
  },
  btnUpdate: {
    backgroundColor: '#00d09c',
  },
})

export default PortfolioDetails

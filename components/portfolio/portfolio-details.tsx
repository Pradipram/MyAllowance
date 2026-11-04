import { deleteAsset } from '@/services/portfolio'
import { Asset } from '@/types/types'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
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
  onSuccess?: () => void
}

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ── Action definitions ───────────────────────────────────────────────────────
interface ActionDef {
  key: string
  label: string
  tooltip: string
  icon: keyof typeof Ionicons.glyphMap
  iconColor: string
  labelColor?: string
}

const ACTIONS: ActionDef[] = [
  {
    key: 'edit',
    label: 'Edit asset',
    tooltip: 'Correct initial entry mistakes (e.g. wrong name, incorrect buy price). Only available if no valuation updates have been recorded.',
    icon: 'create-outline',
    iconColor: '#7c8395',
  },
  {
    key: 'update',
    label: 'Update valuation',
    tooltip: 'Update the current market value. You can also add to your invested amount if you bought more of this asset.',
    icon: 'trending-up-outline',
    iconColor: '#7c8395',
  },
  {
    key: 'sold',
    label: 'Mark as sold',
    tooltip: 'Record that this asset has been sold. It will be locked from further valuation updates.',
    icon: 'swap-horizontal-outline',
    iconColor: '#7c8395',
  },
  {
    key: 'delete',
    label: 'Delete asset',
    tooltip: 'Permanently remove this asset and all its valuation history, as if it was never added.',
    icon: 'trash-outline',
    iconColor: '#eb5b3c',
    labelColor: '#eb5b3c',
  },
]

// ── Tooltip component ────────────────────────────────────────────────────────
interface TooltipProps {
  text: string
  visible: boolean
  onClose: () => void
  anchorY: number
}

const Tooltip = ({ text, visible, onClose, anchorY }: TooltipProps) => {
  if (!visible) return null

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={tooltipStyles.backdrop} onPress={onClose}>
        <View style={[tooltipStyles.bubble, { bottom: anchorY }]}>
          <Text style={tooltipStyles.text}>{text}</Text>
          {/* Arrow pointing down */}
          <View style={tooltipStyles.arrow} />
        </View>
      </Pressable>
    </Modal>
  )
}

const tooltipStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  bubble: {
    position: 'absolute',
    right: 24,
    maxWidth: 260,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    fontSize: 12,
    lineHeight: 18,
    color: '#f0f0f0',
  },
  arrow: {
    position: 'absolute',
    bottom: -6,
    right: 14,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1a1a1a',
  },
})

// ── Main component ───────────────────────────────────────────────────────────
const PortfolioDetails = ({
  visible,
  asset,
  onClose,
  onSuccess,
}: PortfolioDetailsProps) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [tooltipY, setTooltipY] = useState(0)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const infoRefs = useRef<Record<string, View | null>>({})

  const showTooltip = (key: string) => {
    const ref = infoRefs.current[key]
    if (ref) {
      ref.measureInWindow((_x, y, _w, h) => {
        // Position tooltip so its bottom + arrow sits just above the icon
        const screenBottomOffset = Math.round(
          // distance from bottom of screen to the top of the icon
          (global as any).screen?.height
            ? (global as any).screen.height - y
            : 800 - y  // fallback
        )
        setTooltipY(screenBottomOffset + 4)
        setActiveTooltip(key)
      })
    } else {
      setActiveTooltip(key)
    }
  }

  const handleClose = () => {
    setActiveTooltip(null)
    setLoadingAction(null)
    onClose()
  }

  const handleDelete = () => {
    if (!asset || loadingAction) return

    Alert.alert(
      'Delete Asset',
      `Are you sure you want to delete "${asset.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoadingAction('delete')
              const res = await deleteAsset(asset.asset_id)
              if (res.success) {
                handleClose()
                onSuccess?.()
              } else {
                Alert.alert('Error', res.error || 'Failed to delete asset.')
              }
            } catch (err: any) {
              console.error('Error deleting asset:', err)
              Alert.alert('Error', err?.message || 'Failed to delete asset.')
            } finally {
              setLoadingAction(null)
            }
          },
        },
      ]
    )
  }

  const handleEdit = () => {
    if (!asset || loadingAction) return

    handleClose()
    router.push({
      pathname: '/add-asset',
      params: {
        isEditing: 'true',
        assetId: asset.asset_id,
        name: asset.name,
        assetType: asset.asset_type,
        investedAmount: asset.invested_amount.toString(),
        currentValue: asset.current_value.toString(),
      },
    })
  }

  const handleActionPress = (key: string) => {
    if (key === 'edit') {
      handleEdit()
    } else if (key === 'delete') {
      handleDelete()
    }
  }

  const activeAction = ACTIONS.find((a) => a.key === activeTooltip)

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.sheetTitle}>Asset Details</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color="#6c757d" />
            </TouchableOpacity>
          </View>

          {/* ── Info Card ──────────────────────────────────────────────── */}
          <View style={styles.card}>
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

          {/* ── Action List ────────────────────────────────────────────── */}
          <View style={[styles.card, styles.actionList]}>
            {ACTIONS.map((action, index) => (
              <React.Fragment key={action.key}>
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => handleActionPress(action.key)}
                  disabled={loadingAction !== null}
                  activeOpacity={0.7}
                >
                  {/* Left: icon + label + info */}
                  <View style={styles.actionLeft}>
                    <Ionicons name={action.icon} size={20} color={action.iconColor} />
                    <Text style={[styles.actionLabel, action.labelColor ? { color: action.labelColor } : null]}>
                      {action.label}
                    </Text>
                    <TouchableOpacity
                      ref={(ref) => { infoRefs.current[action.key] = ref }}
                      onPress={(e) => {
                        e.stopPropagation()
                        showTooltip(action.key)
                      }}
                      hitSlop={8}
                      style={styles.infoButton}
                    >
                      <Ionicons name="information-circle-outline" size={16} color="#c4c7d0" />
                    </TouchableOpacity>
                  </View>

                  {/* Right: chevron or loading indicator */}
                  {loadingAction === action.key ? (
                    <ActivityIndicator size="small" color="#7c8395" />
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color="#c4c7d0" />
                  )}
                </TouchableOpacity>
                {index < ACTIONS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>

        </Pressable>
      </Pressable>

      {/* ── Tooltip overlay ────────────────────────────────────────────── */}
      {activeAction && (
        <Tooltip
          text={activeAction.tooltip}
          visible={true}
          onClose={() => setActiveTooltip(null)}
          anchorY={tooltipY}
        />
      )}
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

  // ── Info Card ────────────────────────────────────────────────────────────
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

  // ── Action List ──────────────────────────────────────────────────────────
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
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44475b',
  },
  infoButton: {
    padding: 4,
  },
})

export default PortfolioDetails

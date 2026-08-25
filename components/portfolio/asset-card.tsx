import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Asset } from "@/types/types";

interface AssetCardProps {
  asset: Asset;
  onPress: () => void;
}

export default function AssetCard({ asset, onPress }: AssetCardProps) {
  const isPositive = (asset.percentage_delta ?? 0) >= 0;
  const formattedValue = (asset.current_value ?? 0).toLocaleString();
  const formattedPctDelta = `${isPositive ? "+" : ""}${(asset.percentage_delta ?? 0).toFixed(2)}%`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left side: name and asset_type */}
      <View style={styles.leftContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {asset.name}
        </Text>
        <Text style={styles.assetType} numberOfLines={1}>
          {asset.asset_type}
        </Text>
      </View>

      {/* Right side: current_value on top, percentage_delta below */}
      <View style={styles.rightContainer}>
        <Text style={styles.currentValue}>₹{formattedValue}</Text>
        <Text
          style={[
            styles.percentageDelta,
            isPositive ? styles.deltaPositive : styles.deltaNegative,
          ]}
        >
          {formattedPctDelta}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leftContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  assetType: {
    fontSize: 13,
    color: "#6c757d",
    textTransform: "capitalize",
  },
  rightContainer: {
    alignItems: "flex-end",
  },
  currentValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  percentageDelta: {
    fontSize: 13,
    fontWeight: "600",
  },
  deltaPositive: {
    color: "#28a745",
  },
  deltaNegative: {
    color: "#dc3545",
  },
});

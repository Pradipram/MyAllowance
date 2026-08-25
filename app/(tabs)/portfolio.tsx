import AssetCard from "@/components/portfolio/asset-card";
import PortfolioHeader from "@/components/portfolio/portfolio-header";
import UpdateValuationSheet from "@/components/portfolio/update-valuation-sheet";
import { fetchPortfolioSummary } from "@/services/portfolio";
import { Asset, PortfolioSummary } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PortfolioScreen() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isValuationSheetVisible, setIsValuationSheetVisible] =
    useState<boolean>(false);

  const loadPortfolioData = useCallback(async () => {
    try {
      const response = await fetchPortfolioSummary();
      if (response.success && response.data) {
        setSummary(response.data);
      } else {
        console.error("Error fetching portfolio summary:", response.error);
      }
    } catch (error) {
      console.error("Unexpected error fetching portfolio summary:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPortfolioData();
    }, [loadPortfolioData]),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPortfolioData();
  }, [loadPortfolioData]);

  const handleAssetPress = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsValuationSheetVisible(true);
  };

  const handleValuationSuccess = () => {
    setIsValuationSheetVisible(false);
    setSelectedAsset(null);
    loadPortfolioData();
  };

  const renderAssetItem = ({ item }: { item: Asset }) => (
    <AssetCard
      asset={item}
      onPress={() => handleAssetPress(item)}
    />
  );

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="pie-chart-outline" size={56} color="#adb5bd" />
        <Text style={styles.emptyTitle}>No Assets Yet</Text>
        <Text style={styles.emptyText}>
          Start building your portfolio by tracking stocks, crypto, real estate,
          or other investments.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {loading && !summary ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading portfolio...</Text>
        </View>
      ) : (
        <FlatList
          data={summary?.assets || []}
          keyExtractor={(item) => item.asset_id}
          renderItem={renderAssetItem}
          ListHeaderComponent={
            summary ? <PortfolioHeader summary={summary} /> : null
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-asset" as any)}
        activeOpacity={0.8}
        accessibilityLabel="Add Asset"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      {/* Update Valuation Sheet */}
      <UpdateValuationSheet
        visible={isValuationSheetVisible}
        assetId={selectedAsset?.asset_id || ""}
        currentValue={selectedAsset?.current_value}
        onClose={() => {
          setIsValuationSheetVisible(false);
          setSelectedAsset(null);
        }}
        onSuccess={handleValuationSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#495057",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});

import { styles } from "@/assets/styles/portfolio.style";
import AssetCard from "@/components/portfolio/asset-card";
import PortfolioDetails from "@/components/portfolio/portfolio-details";
import PortfolioHeader from "@/components/portfolio/portfolio-header";
import { fetchPortfolioSummary } from "@/services/portfolio";
import { Asset, PortfolioSummary } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PortfolioScreen() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const loadPortfolioData = useCallback(async () => {
    try {
      const response = await fetchPortfolioSummary();
      if (response.success && response.data) {
        setSummary(response.data);
        // console.log("Portfolio summary fetched successfully:", response.data);
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
  };

  const handlePortfolioDetailsSuccess = () => {
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
      {/* <UpdateValuationSheet
        visible={isValuationSheetVisible}
        assetId={selectedAsset?.asset_id || ""}
        currentValue={selectedAsset?.current_value}
        onClose={() => {
          setIsValuationSheetVisible(false);
          setSelectedAsset(null);
        }}
        onSuccess={handleValuationSuccess}
      /> */}
      <PortfolioDetails
        visible={selectedAsset !== null}
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onSuccess={handlePortfolioDetailsSuccess}
      />
    </SafeAreaView>
  );
}
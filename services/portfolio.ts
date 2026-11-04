import { PortfolioSummary } from "@/types/types";
import { supabase } from "@/utils/supabase";

export interface PortfolioServiceResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Fetches the portfolio summary (totals and asset breakdown) for the authenticated user.
 *
 * @returns {Promise<PortfolioServiceResponse<PortfolioSummary>>}
 */
export const fetchPortfolioSummary = async (): Promise<
  PortfolioServiceResponse<PortfolioSummary>
> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        data: null,
        error: authError?.message || "User not authenticated.",
      };
    }

    const { data, error } = await supabase.rpc("get_portfolio_summary", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Supabase RPC error fetching portfolio summary:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as PortfolioSummary,
      error: null,
    };
  } catch (err: any) {
    console.error("Unexpected error in fetchPortfolioSummary:", err);
    return {
      success: false,
      data: null,
      error:
        err?.message || "An unexpected error occurred while fetching portfolio summary.",
    };
  }
};

/**
 * Inserts a new asset and records its initial valuation for the authenticated user.
 *
 * @param {string} name - The asset name (e.g., 'Apple Inc.', 'Bitcoin').
 * @param {string} type - The asset type (e.g., 'Stocks', 'Crypto', 'Real Estate').
 * @param {number} invested - The invested amount.
 * @param {number} current - The current valuation amount.
 * @returns {Promise<PortfolioServiceResponse>}
 */
export const addAsset = async (
  name: string,
  type: string,
  invested: number,
  current: number
): Promise<PortfolioServiceResponse> => {
  try {
    if (!name || !name.trim()) {
      return {
        success: false,
        data: null,
        error: "Asset name cannot be empty.",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        data: null,
        error: authError?.message || "User not authenticated.",
      };
    }

    const { data, error } = await supabase.rpc("insert_new_asset_v2", {
      p_name: name.trim(),
      p_asset_type: type,
      p_invested_amount: invested,
      p_current_value: current,
    });

    if (error) {
      console.error("Supabase RPC error adding asset:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }

    console.log("Add Asset data: ",data);
    return {
      success: true,
      data: data,
      error: null,
    };
  } catch (err: any) {
    console.error("Unexpected error in addAsset:", err);
    return {
      success: false,
      data: null,
      error:
        err?.message || "An unexpected error occurred while adding asset.",
    };
  }
};

/**
 * Updates the valuation of an existing asset and logs the entry in valuations ledger.
 *
 * @param {string} assetId - The UUID of the asset to update.
 * @param {number} newValue - The new valuation amount.
 * @returns {Promise<PortfolioServiceResponse>}
 */
export const updateValuation = async (
  assetId: string,
  newValue: number
): Promise<PortfolioServiceResponse> => {
  try {
    if (!assetId) {
      return {
        success: false,
        data: null,
        error: "Asset ID is required.",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        data: null,
        error: authError?.message || "User not authenticated.",
      };
    }

    const { data, error } = await supabase.rpc("update_asset_valuation", {
      p_asset_id: assetId,
      p_new_value: newValue,
    });

    if (error) {
      console.error("Supabase RPC error updating asset valuation:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data,
      error: null,
    };
  } catch (err: any) {
    console.error("Unexpected error in updateValuation:", err);
    return {
      success: false,
      data: null,
      error:
        err?.message || "An unexpected error occurred while updating asset valuation.",
    };
  }
};

/**
 * Checks whether an asset has undergone any changes since it was added
 * by querying asset_monthly_snapshots. If more than two entries exist
 * with the asset_id, then something has been updated; otherwise it has not changed.
 *
 * @param {string} assetId - The UUID of the asset to check.
 * @returns {Promise<PortfolioServiceResponse<boolean>>} - true if changed (> 2 entries), false if unchanged (<= 2 entries).
 */
export const checkAssetHasChanges = async (
  assetId: string
): Promise<PortfolioServiceResponse<boolean>> => {
  try {
    if (!assetId) {
      return {
        success: false,
        data: null,
        error: "Asset ID is required.",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        data: null,
        error: authError?.message || "User not authenticated.",
      };
    }

    // Check count of entries in asset_monthly_snapshots with the asset_id
    const { count, error } = await supabase
      .from("asset_monthly_snapshots")
      .select("*", { count: "exact", head: true })
      .eq("asset_id", assetId);

    if (error) {
      console.error("Supabase error checking asset_monthly_snapshots:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }

    // If more than two entries exist with the asset_id, then something has been updated
    const hasChanges = (count ?? 0) > 2;

    return {
      success: true,
      data: hasChanges,
      error: null,
    };
  } catch (err: any) {
    console.error("Unexpected error in checkAssetHasChanges:", err);
    return {
      success: false,
      data: null,
      error:
        err?.message || "An unexpected error occurred while checking asset changes.",
    };
  }
};

/**
 * Updates an asset's details if no subsequent updates have been recorded
 * (i.e. <= 2 entries exist in asset_monthly_snapshots).
 *
 * @param {string} assetId - The UUID of the asset to edit.
 * @param {string} name - The updated asset name.
 * @param {string} type - The updated asset type.
 * @param {number} invested - The updated invested amount.
 * @param {number} current - The updated current valuation amount.
 * @returns {Promise<PortfolioServiceResponse>}
 */
export const editAsset = async (
  assetId: string,
  name: string,
  type: string,
  invested: number,
  current: number
): Promise<PortfolioServiceResponse> => {
  try {
    if (!assetId) {
      return {
        success: false,
        data: null,
        error: "Asset ID is required.",
      };
    }

    if (!name || !name.trim()) {
      return {
        success: false,
        data: null,
        error: "Asset name cannot be empty.",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        data: null,
        error: authError?.message || "User not authenticated.",
      };
    }

    // Verify whether asset has been changed (more than 2 entries in asset_monthly_snapshots)
    const { count, error: countError } = await supabase
      .from("asset_monthly_snapshots")
      .select("*", { count: "exact", head: true })
      .eq("asset_id", assetId);

    if (countError) {
      console.error("Error verifying asset snapshot count:", countError);
      return {
        success: false,
        data: null,
        error: countError.message,
      };
    }

    if ((count ?? 0) > 2) {
      return {
        success: false,
        data: null,
        error:
          "It can't be edited as it has been changed after adding it. But if there is still error then Delete this asset and add it again.",
      };
    }

    // Update the asset record
    const { data: updatedAsset, error: updateError } = await supabase
      .from("assets")
      .update({
        name: name.trim(),
        asset_type: type,
        invested_amount: invested,
        current_value: current,
      })
      .eq("asset_id", assetId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase error editing asset:", updateError);
      return {
        success: false,
        data: null,
        error: updateError.message,
      };
    }

    return {
      success: true,
      data: updatedAsset,
      error: null,
    };
  } catch (err: any) {
    console.error("Unexpected error in editAsset:", err);
    return {
      success: false,
      data: null,
      error:
        err?.message || "An unexpected error occurred while editing asset.",
    };
  }
};

/**
 * Permanently deletes an asset and associated records.
 *
 * @param {string} assetId - The UUID of the asset to delete.
 * @returns {Promise<PortfolioServiceResponse>}
 */
export const deleteAsset = async (
  assetId: string
): Promise<PortfolioServiceResponse> => {
  try {
    if (!assetId) {
      return {
        success: false,
        data: null,
        error: "Asset ID is required.",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        data: null,
        error: authError?.message || "User not authenticated.",
      };
    }

    const { error } = await supabase
      .from("assets")
      .delete()
      .eq("asset_id", assetId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase error deleting asset:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }

    return {
      success: true,
      data: true,
      error: null,
    };
  } catch (err: any) {
    console.error("Unexpected error in deleteAsset:", err);
    return {
      success: false,
      data: null,
      error:
        err?.message || "An unexpected error occurred while deleting asset.",
    };
  }
};

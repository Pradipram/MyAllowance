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

    const { data, error } = await supabase.rpc("insert_new_asset", {
      p_user_id: user.id,
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

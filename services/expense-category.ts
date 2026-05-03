import { supabase } from "@/utils/supabase";

/**
 * Fetches the global expense categories for the currently authenticated user.
 * @returns {Promise<Array>} An array of category objects or an empty array if none exist/error.
 */
export const fetchExpenseCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("expense_categories")
      .select("id, name") // Fetching only what the UI needs
      .order("created_at", { ascending: true });

    if (error) {
      console.error(
        "Supabase error fetching expense categories:",
        error.message,
      );
      return [];
    }
    return data;
  } catch (err) {
    console.error("Unexpected error fetching expense categories:", err);
    return [];
  }
};

/**
 * Inserts a new expense category into the database for the current user.
 *
 * @param {string} categoryName - The name of the new category to add.
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export const addExpenseCategory = async (categoryName: string) => {
  try {
    // 1. Basic validation
    if (!categoryName || !categoryName.trim()) {
      return { success: false, error: "Category name cannot be empty." };
    }

    // 2. Get the currently authenticated user (required for RLS)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in to add a category.",
      };
    }

    // 3. Execute the database insert
    const { data, error } = await supabase
      .from("expense_categories")
      .insert([
        {
          name: categoryName.trim(),
          user_id: user.id,
        },
      ])
      .select()
      .single(); // Returns the single created row

    // 4. Handle database errors
    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: error.message };
    }

    // 5. Return success and the new data
    return { success: true, data: data };
  } catch (err) {
    console.error("Unexpected error in addExpenseCategory:", err);
    return {
      success: false,
      error: "An unexpected error occurred while saving.",
    };
  }
};

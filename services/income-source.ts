import { supabase } from "@/utils/supabase";

export const fetchIncomeSources = async () => {
  try {
    const { data, error } = await supabase
      .from("income_sources")
      .select("id, name")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase error fetching income sources:", error.message);
      return [];
    }
    return data;
  } catch (err) {
    console.error("Unexpected error fetching income sources:", err);
    return [];
  }
};

export const addIncomeSource = async (sourceName: string) => {
  try {
    if (!sourceName || !sourceName.trim()) {
      return { success: false, error: "Income source name cannot be empty." };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in to add an income source.",
      };
    }

    const { data, error } = await supabase
      .from("income_sources")
      .insert([
        {
          name: sourceName.trim(),
          user_id: user.id,
          income_type: "active",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data };
  } catch (err) {
    console.error("Unexpected error in addIncomeSource:", err);
    return {
      success: false,
      error: "An unexpected error occurred while saving.",
    };
  }
};

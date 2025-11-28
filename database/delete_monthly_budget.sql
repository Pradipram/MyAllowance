-- SQL function to delete monthly budget and its categories atomically
-- This ensures both deletions happen together or none at all

CREATE OR REPLACE FUNCTION delete_monthly_budget(
  p_budget_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_budget_exists BOOLEAN;
  v_categories_deleted INTEGER;
  v_result JSON;
BEGIN
  -- Verify the budget exists and belongs to the user
  SELECT EXISTS(
    SELECT 1 FROM monthly_budgets
    WHERE id = p_budget_id AND user_id = p_user_id
  ) INTO v_budget_exists;
  
  IF NOT v_budget_exists THEN
    RAISE EXCEPTION 'Budget not found or does not belong to user';
  END IF;
  
  -- Delete associated categories first (due to foreign key constraint)
  DELETE FROM budget_categories
  WHERE monthly_budget_id = p_budget_id;
  
  GET DIAGNOSTICS v_categories_deleted = ROW_COUNT;
  
  -- Delete the monthly budget
  DELETE FROM monthly_budgets
  WHERE id = p_budget_id AND user_id = p_user_id;
  
  -- Verify deletion
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to delete monthly budget';
  END IF;
  
  -- Return success result
  v_result := json_build_object(
    'success', true,
    'budget_id', p_budget_id,
    'categories_deleted', v_categories_deleted,
    'message', 'Budget deleted successfully'
  );
  
  RETURN v_result;
  
  -- If any error occurs, the entire transaction will be rolled back automatically
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Delete budget failed: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_monthly_budget TO authenticated;

    CREATE OR REPLACE FUNCTION insert_new_asset(
    p_user_id UUID, 
    p_name TEXT, 
    p_asset_type TEXT, 
    p_invested_amount NUMERIC, 
    p_current_value NUMERIC
)
RETURNS UUID AS $$
DECLARE
    v_new_asset_id UUID;
BEGIN
    -- 1. Insert the asset
    INSERT INTO assets (user_id, name, asset_type, invested_amount, current_value)
    VALUES (p_user_id, p_name, p_asset_type, p_invested_amount, p_current_value)
    RETURNING asset_id INTO v_new_asset_id;

    -- 2. Insert the initial valuation ledger entry
    INSERT INTO asset_valuations (asset_id, recorded_value)
    VALUES (v_new_asset_id, p_current_value);

    RETURN v_new_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
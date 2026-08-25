CREATE OR REPLACE FUNCTION get_portfolio_summary(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'total_invested', COALESCE(SUM(invested_amount), 0),
        'total_current_value', COALESCE(SUM(current_value), 0),
        'absolute_delta', COALESCE(SUM(current_value) - SUM(invested_amount), 0),
        'percentage_delta', 
            CASE 
                WHEN COALESCE(SUM(invested_amount), 0) > 0 
                THEN ((SUM(current_value) - SUM(invested_amount)) / SUM(invested_amount)) * 100 
                ELSE 0 
            END,
        'assets', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'asset_id', asset_id,
                        'name', name,
                        'asset_type', asset_type,
                        'invested_amount', invested_amount,
                        'current_value', current_value,
                        'absolute_delta', current_value - invested_amount,
                        'percentage_delta', 
                            CASE 
                                WHEN invested_amount > 0 
                                THEN ((current_value - invested_amount) / invested_amount) * 100 
                                ELSE 0 
                            END,
                        'updated_at', updated_at
                    ) ORDER BY created_at DESC
                )
                FROM assets 
                WHERE user_id = p_user_id
            ), 
            '[]'::JSON
        )
    ) INTO v_result
    FROM assets
    WHERE user_id = p_user_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
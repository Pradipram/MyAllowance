create or replace function get_monthly_record(
  p_user_id uuid,
  p_month numeric,
  p_year numeric
)
returns jsonb
language plpgsql
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    -- Parent Fields
    'id', mr.id,
    'month', mr.month,
    'year', mr.year,
    'total_budget', mr.total_budget,
    'total_spent', mr.total_spent,
    'total_income', mr.total_income,
    
    -- Child Array: Budget Categories
    'budget_categories', coalesce(
      (
        select jsonb_agg(bc order by bc.created_at asc)
        from budget_categories bc
        where bc.monthly_record_id = mr.id
      ),
      '[]'::jsonb
    ),

    -- Child Array: Income Sources
    'income_sources', coalesce(
      (
        select jsonb_agg(isrc order by isrc.created_at asc)
        from income_sources isrc
        where isrc.monthly_record_id = mr.id
      ),
      '[]'::jsonb
    )
  )
  into result
  from monthly_records mr
  where mr.user_id = p_user_id 
    and mr.month = p_month 
    and mr.year = p_year;

  return result; -- Returns NULL automatically if no row is found
end;
$$;
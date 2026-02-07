create or replace function upsert_monthly_record(
  p_user_id uuid,
  p_month numeric,
  p_year numeric,
  p_total_budget numeric default null, 
  p_total_income numeric default null, 
  p_budget_categories jsonb default null, 
  p_income_sources jsonb default null
)
returns jsonb
language plpgsql
as $$
declare
  v_record_id uuid;
  v_item jsonb;
  v_keep_ids uuid[]; 
begin
  -- 1. PARENT UPSERT
  insert into monthly_records (user_id, month, year, total_budget, total_income)
  values (
    p_user_id, 
    p_month, 
    p_year, 
    coalesce(p_total_budget, 0), 
    coalesce(p_total_income, 0)
  )
  on conflict (user_id, month, year) 
  do update set 
    total_budget = coalesce(p_total_budget, monthly_records.total_budget),
    total_income = coalesce(p_total_income, monthly_records.total_income),
    updated_at = now()
  returning id into v_record_id;

  -- 2. SYNC BUDGET CATEGORIES (Column: 'budget')
  if p_budget_categories is not null then
    v_keep_ids := array[]::uuid[]; 

    for v_item in select * from jsonb_array_elements(p_budget_categories)
    loop
      if (v_item->>'id') is not null then
        -- UPDATE EXISTING
        update budget_categories set
          name = v_item->>'name',
          budget = (v_item->>'budget')::numeric, -- ✅ Direct match
          index = (v_item->>'index')::numeric
        where id = (v_item->>'id')::uuid;
        
        v_keep_ids := array_append(v_keep_ids, (v_item->>'id')::uuid);
      else
        -- INSERT NEW
        insert into budget_categories (
          monthly_record_id, name, budget, index, spent
        ) values (
          v_record_id, 
          v_item->>'name', 
          (v_item->>'budget')::numeric, -- ✅ Direct match
          (v_item->>'index')::numeric, 
          0
        );
      end if;
    end loop;

    -- Prune
    delete from budget_categories 
    where monthly_record_id = v_record_id 
      and id != all(v_keep_ids)
      and id in (select id from budget_categories where monthly_record_id = v_record_id);
  end if;

  -- 3. SYNC INCOME SOURCES (Column: 'earned')
  if p_income_sources is not null then
    v_keep_ids := array[]::uuid[]; 

    for v_item in select * from jsonb_array_elements(p_income_sources)
    loop
      if (v_item->>'id') is not null then
        -- UPDATE EXISTING (Only Name/Type)
        update income_sources set
          name = v_item->>'name',
          income_type = v_item->>'type'
        where id = (v_item->>'id')::uuid;

        v_keep_ids := array_append(v_keep_ids, (v_item->>'id')::uuid);
      else
        -- INSERT NEW
        insert into income_sources (
          monthly_record_id, user_id, name, income_type, earned
        ) values (
          v_record_id, 
          p_user_id,
          v_item->>'name', 
          v_item->>'type', 
          0 -- ✅ Initialize 'earned' to 0
        );
      end if;
    end loop;

    -- Prune
    delete from income_sources 
    where monthly_record_id = v_record_id 
      and id != all(v_keep_ids)
      and id in (select id from income_sources where monthly_record_id = v_record_id);
  end if;

  return jsonb_build_object('id', v_record_id, 'status', 'success');
end;
$$;
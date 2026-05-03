-- 02 May 2026

-- Turn on security for the table (if it isn't already)
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- Allow users to SEE only their own categories
CREATE POLICY "Users can view own categories" 
ON expense_categories FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to CREATE categories only for themselves
CREATE POLICY "Users can insert own categories" 
ON expense_categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE their own categories
CREATE POLICY "Users can delete own categories" 
ON expense_categories FOR DELETE 
USING (auth.uid() = user_id);
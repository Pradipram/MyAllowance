-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_valuations ENABLE ROW LEVEL SECURITY;

-- Policies for assets
CREATE POLICY "Users can manage their own assets"
ON assets FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for asset_valuations
CREATE POLICY "Users can manage valuations of their own assets"
ON asset_valuations FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM assets 
        WHERE assets.asset_id = asset_valuations.asset_id 
        AND assets.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM assets 
        WHERE assets.asset_id = asset_valuations.asset_id 
        AND assets.user_id = auth.uid()
    )
);
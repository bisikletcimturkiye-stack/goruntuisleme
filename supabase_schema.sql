-- Feed Tracking System Database Schema

-- 1. Profiles for different roles
CREATE TYPE user_role AS ENUM ('admin', 'owner', 'veterinarian', 'worker');

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role user_role DEFAULT 'worker',
  farm_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Farms
CREATE TABLE farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  owner_id UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Rations (Preset recipes by Veterinarians)
CREATE TABLE rations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ration Items
CREATE TABLE ration_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ration_id UUID REFERENCES rations ON DELETE CASCADE,
  feed_type TEXT NOT NULL, -- e.g., 'Corn Silage', 'Alfalfa'
  target_weight_kg DECIMAL NOT NULL,
  tolerance_percentage DECIMAL DEFAULT 5.0
);

-- 5. Feed Logs (Automatic data from Edge device)
CREATE TABLE feed_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms ON DELETE CASCADE,
  mixer_id TEXT NOT NULL,
  feed_type TEXT NOT NULL,
  actual_weight_kg DECIMAL NOT NULL,
  image_evidence_url TEXT,
  detected_confidence DECIMAL,
  worker_id UUID REFERENCES auth.users,
  ration_id UUID REFERENCES rations,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE rations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ration_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_logs ENABLE ROW LEVEL SECURITY;

-- Examples of RLS Policies (Simplified)
-- Everyone can read feed logs from their own farm
CREATE POLICY "Users can view their farm logs" ON feed_logs
  FOR SELECT USING (farm_id IN (SELECT farm_id FROM profiles WHERE id = auth.uid()));

-- Veterinarians and Owners can manage rations
CREATE POLICY "Vets and Owners can manage rations" ON rations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('veterinarian', 'owner', 'admin')
    )
  );

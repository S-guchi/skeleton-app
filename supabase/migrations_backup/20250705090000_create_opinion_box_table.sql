-- Create opinion_box table for collecting user feedback
CREATE TABLE opinion_box (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_opinion_box_user_id ON opinion_box(user_id);

-- Create index on created_at for sorting
CREATE INDEX idx_opinion_box_created_at ON opinion_box(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE opinion_box ENABLE ROW LEVEL SECURITY;

-- Create policy for users to insert their own opinions
CREATE POLICY "Users can insert their own opinions" ON opinion_box
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Create policy for users to view their own opinions
CREATE POLICY "Users can view their own opinions" ON opinion_box
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Create policy for anonymous users to insert opinions
CREATE POLICY "Anonymous users can insert opinions" ON opinion_box
    FOR INSERT 
    WITH CHECK (user_id IS NULL);

-- Add trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_opinion_box_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_opinion_box_updated_at_trigger
    BEFORE UPDATE ON opinion_box
    FOR EACH ROW
    EXECUTE FUNCTION update_opinion_box_updated_at();

-- Add comments for documentation
COMMENT ON TABLE opinion_box IS 'User feedback and opinions collection table';
COMMENT ON COLUMN opinion_box.id IS 'Primary key';
COMMENT ON COLUMN opinion_box.user_id IS 'User ID from auth.users, nullable for anonymous feedback';
COMMENT ON COLUMN opinion_box.title IS 'Opinion title/subject';
COMMENT ON COLUMN opinion_box.content IS 'Opinion content/details';
COMMENT ON COLUMN opinion_box.email IS 'Optional email address for response';
COMMENT ON COLUMN opinion_box.created_at IS 'Creation timestamp';
COMMENT ON COLUMN opinion_box.updated_at IS 'Last update timestamp';
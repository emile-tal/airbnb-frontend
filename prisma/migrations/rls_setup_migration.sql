-- Setup Row-Level Security (RLS) policies for the Airbnb clone

-- Enable row level security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reservation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ListingAvailability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_user_id', TRUE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a function to determine if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('app.is_admin', TRUE)::BOOLEAN;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create policies for User table
-- Users can read all user profiles
CREATE POLICY user_read_policy ON "User"
  FOR SELECT
  USING (TRUE);

-- Users can only update their own profile
CREATE POLICY user_update_policy ON "User"
  FOR UPDATE
  USING (id = get_current_user_id());

-- Create policies for Listing table
-- Anyone can read listings
CREATE POLICY listing_read_policy ON "Listing"
  FOR SELECT
  USING (TRUE);

-- Users can only create/update/delete their own listings
CREATE POLICY listing_write_policy ON "Listing"
  FOR ALL
  USING (userId = get_current_user_id() OR is_admin());

-- Create policies for Reservation table
-- Users can see reservations for listings they own or reservations they've made
CREATE POLICY reservation_read_policy ON "Reservation"
  FOR SELECT
  USING (
    userId = get_current_user_id() OR 
    listingId IN (SELECT id FROM "Listing" WHERE userId = get_current_user_id()) OR
    is_admin()
  );

-- Users can only create/update/delete their own reservations
CREATE POLICY reservation_write_policy ON "Reservation"
  FOR ALL
  USING (userId = get_current_user_id() OR is_admin());

-- Create policies for Favorite table
-- Users can only see their own favorites
CREATE POLICY favorite_read_policy ON "Favorite"
  FOR SELECT
  USING (userId = get_current_user_id() OR is_admin());

-- Users can only create/update/delete their own favorites
CREATE POLICY favorite_write_policy ON "Favorite"
  FOR ALL
  USING (userId = get_current_user_id() OR is_admin());

-- Create policies for ListingAvailability table
-- Anyone can read listing availability
CREATE POLICY availability_read_policy ON "ListingAvailability"
  FOR SELECT
  USING (TRUE);

-- Only listing owners can create/update/delete availability
CREATE POLICY availability_write_policy ON "ListingAvailability"
  FOR ALL
  USING (
    listingId IN (SELECT id FROM "Listing" WHERE userId = get_current_user_id()) OR
    is_admin()
  );

-- Create policies for Account table
-- Users can only see and modify their own account data
CREATE POLICY account_policy ON "Account"
  FOR ALL
  USING (userId = get_current_user_id() OR is_admin());

-- Default deny policies
-- For tables where RLS is enabled, a default deny policy is implicit
-- But we can add explicit deny policies here if needed 
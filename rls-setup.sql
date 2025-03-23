-- Setup Row-Level Security (RLS) policies for the Airbnb clone

-- First, enable RLS on all tables (if not already enabled)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reservation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ListingAvailability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

-- Create function to get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_user_id', TRUE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user is admin
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
DROP POLICY IF EXISTS user_read_policy ON "User";
CREATE POLICY user_read_policy ON "User"
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS user_update_policy ON "User";
CREATE POLICY user_update_policy ON "User"
  FOR UPDATE
  USING (id = get_current_user_id());

-- Create policies for Listing table
DROP POLICY IF EXISTS listing_read_policy ON "Listing";
CREATE POLICY listing_read_policy ON "Listing"
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS listing_write_policy ON "Listing";
CREATE POLICY listing_write_policy ON "Listing"
  FOR ALL
  USING ("userId" = get_current_user_id() OR is_admin());

-- Create policies for Reservation table
DROP POLICY IF EXISTS reservation_read_policy ON "Reservation";
CREATE POLICY reservation_read_policy ON "Reservation"
  FOR SELECT
  USING (
    "userId" = get_current_user_id() OR 
    "listingId" IN (SELECT id FROM "Listing" WHERE "userId" = get_current_user_id()) OR
    is_admin()
  );

DROP POLICY IF EXISTS reservation_write_policy ON "Reservation";
CREATE POLICY reservation_write_policy ON "Reservation"
  FOR ALL
  USING ("userId" = get_current_user_id() OR is_admin());

-- Create policies for Favorite table
DROP POLICY IF EXISTS favorite_read_policy ON "Favorite";
CREATE POLICY favorite_read_policy ON "Favorite"
  FOR SELECT
  USING ("userId" = get_current_user_id() OR is_admin());

DROP POLICY IF EXISTS favorite_write_policy ON "Favorite";
CREATE POLICY favorite_write_policy ON "Favorite"
  FOR ALL
  USING ("userId" = get_current_user_id() OR is_admin());

-- Create policies for ListingAvailability table
DROP POLICY IF EXISTS availability_read_policy ON "ListingAvailability";
CREATE POLICY availability_read_policy ON "ListingAvailability"
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS availability_write_policy ON "ListingAvailability";
CREATE POLICY availability_write_policy ON "ListingAvailability"
  FOR ALL
  USING (
    "listingId" IN (SELECT id FROM "Listing" WHERE "userId" = get_current_user_id()) OR
    is_admin()
  );

-- Create policies for Account table
DROP POLICY IF EXISTS account_policy ON "Account";
CREATE POLICY account_policy ON "Account"
  FOR ALL
  USING ("userId" = get_current_user_id() OR is_admin()); 
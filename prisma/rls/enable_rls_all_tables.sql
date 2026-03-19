-- =============================================================================
-- ENABLE ROW LEVEL SECURITY — ALL 16 TABLES
-- =============================================================================
-- Context:
--   App connects to Supabase via Prisma using the DATABASE_URL (direct
--   connection string). This bypasses RLS at the application layer.
--   Enabling RLS here protects against direct PostgREST/REST API access
--   using anon or user JWTs — satisfying the Supabase Security Advisor.
--
-- Auth mapping:
--   Clerk user IDs are stored in User."clerkId"
--   auth.uid() returns the JWT subject — mapped to clerkId in policies
--
-- FK field names (corrected from schema.prisma):
--   familyProfileId (NOT familyId) on all child tables
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public."User"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FamilyProfile"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FamilyMember"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DeclaredInterest"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Trip"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TripCollaborator"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SavedItem"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RecommendedItem"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RecommendationScore" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BehavioralProfile"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CommunityProfile"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Follow"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Question"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PointTransaction"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Message"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Ping"                ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USER
-- =============================================================================
CREATE POLICY "Users can view own record"
  ON public."User" FOR SELECT
  USING (auth.uid()::text = "clerkId");

CREATE POLICY "Users can update own record"
  ON public."User" FOR UPDATE
  USING (auth.uid()::text = "clerkId");

CREATE POLICY "Service role has full access to User"
  ON public."User" FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- FAMILY PROFILE
-- =============================================================================
CREATE POLICY "Users can manage own family profile"
  ON public."FamilyProfile" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public."User" u
      WHERE u.id = public."FamilyProfile"."userId"
      AND u."clerkId" = auth.uid()::text
    )
  );

CREATE POLICY "Service role has full access to FamilyProfile"
  ON public."FamilyProfile" FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- FAMILY MEMBER
-- =============================================================================
CREATE POLICY "Users can manage own family members"
  ON public."FamilyMember" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public."FamilyProfile" fp
      JOIN public."User" u ON u.id = fp."userId"
      WHERE fp.id = public."FamilyMember"."familyProfileId"
      AND u."clerkId" = auth.uid()::text
    )
  );

CREATE POLICY "Service role has full access to FamilyMember"
  ON public."FamilyMember" FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- DECLARED INTEREST
-- =============================================================================
CREATE POLICY "Users can manage own declared interests"
  ON public."DeclaredInterest" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public."FamilyProfile" fp
      JOIN public."User" u ON u.id = fp."userId"
      WHERE fp.id = public."DeclaredInterest"."familyProfileId"
      AND u."clerkId" = auth.uid()::text
    )
  );

CREATE POLICY "Service role has full access to DeclaredInterest"
  ON public."DeclaredInterest" FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- TRIP
-- =============================================================================
CREATE POLICY "Users can manage own trips"
  ON public."Trip" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public."FamilyProfile" fp
      JOIN public."User" u ON u.id = fp."userId"
      WHERE fp.id = public."Trip"."familyProfileId"
      AND u."clerkId" = auth.uid()::text
    )
  );

CREATE POLICY "Collaborators can view shared trips"
  ON public."Trip" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."TripCollaborator" tc
      JOIN public."User" u ON u.id = tc."userId"
      WHERE tc."tripId" = public."Trip".id
      AND u."clerkId" = auth.uid()::text
    )
  );

CREATE POLICY "Service role has full access to Trip"
  ON public."Trip" FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- TRIP COLLABORATOR
-- =============================================================================
CREATE POLICY "Service role manages TripCollaborator"
  ON public."TripCollaborator" FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- SAVED ITEM
-- =============================================================================
CREATE POLICY "Users can manage own saved items"
  ON public."SavedItem" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public."FamilyProfile" fp
      JOIN public."User" u ON u.id = fp."userId"
      WHERE fp.id = public."SavedItem"."familyProfileId"
      AND u."clerkId" = auth.uid()::text
    )
  );

CREATE POLICY "Service role has full access to SavedItem"
  ON public."SavedItem" FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- RECOMMENDED ITEM (semi-public — authenticated users can read)
-- =============================================================================
CREATE POLICY "Authenticated users can read recommendations"
  ON public."RecommendedItem" FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role manages RecommendedItem"
  ON public."RecommendedItem" FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- RECOMMENDATION SCORE
-- =============================================================================
CREATE POLICY "Users can read own recommendation scores"
  ON public."RecommendationScore" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."FamilyProfile" fp
      JOIN public."User" u ON u.id = fp."userId"
      WHERE fp.id = public."RecommendationScore"."familyProfileId"
      AND u."clerkId" = auth.uid()::text
    )
  );

CREATE POLICY "Service role manages RecommendationScore"
  ON public."RecommendationScore" FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- BEHAVIORAL PROFILE
-- =============================================================================
CREATE POLICY "Users can read own behavioral profile"
  ON public."BehavioralProfile" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."FamilyProfile" fp
      JOIN public."User" u ON u.id = fp."userId"
      WHERE fp.id = public."BehavioralProfile"."familyProfileId"
      AND u."clerkId" = auth.uid()::text
    )
  );

CREATE POLICY "Service role manages BehavioralProfile"
  ON public."BehavioralProfile" FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- COMMUNITY PROFILE (read-only for authenticated users)
-- =============================================================================
CREATE POLICY "Authenticated users can read community profiles"
  ON public."CommunityProfile" FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role manages CommunityProfile"
  ON public."CommunityProfile" FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- SOCIAL / MESSAGING — service role only (features not fully live)
-- =============================================================================
CREATE POLICY "Service role manages Follow"
  ON public."Follow" FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages Question"
  ON public."Question" FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages PointTransaction"
  ON public."PointTransaction" FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages Message"
  ON public."Message" FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages Ping"
  ON public."Ping" FOR ALL
  USING (auth.role() = 'service_role');

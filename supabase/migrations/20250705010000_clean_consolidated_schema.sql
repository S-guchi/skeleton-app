


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."get_household_rankings"("p_household_id" "uuid", "p_period" "text" DEFAULT 'month'::"text", "p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date") RETURNS TABLE("user_id" "uuid", "user_name" "text", "chore_count" bigint, "total_points" numeric, "rank" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if user is a household member
  IF NOT EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = p_household_id
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_period = 'all' THEN
    RETURN QUERY
    SELECT
      cl.performed_by,
      u.name,
      COUNT(*)::BIGINT,
      SUM(COALESCE(cl.reward_amount, 0))::NUMERIC,
      RANK() OVER (ORDER BY SUM(COALESCE(cl.reward_amount, 0)) DESC)::INTEGER
    FROM chore_logs cl
    JOIN users u ON cl.performed_by = u.id
    WHERE cl.household_id = p_household_id
    GROUP BY cl.performed_by, u.name;
  ELSIF p_period = 'custom' AND p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
    RETURN QUERY
    SELECT
      cl.performed_by,
      u.name,
      COUNT(*)::BIGINT,
      SUM(COALESCE(cl.reward_amount, 0))::NUMERIC,
      RANK() OVER (ORDER BY SUM(COALESCE(cl.reward_amount, 0)) DESC)::INTEGER
    FROM chore_logs cl
    JOIN users u ON cl.performed_by = u.id
    WHERE cl.household_id = p_household_id
      AND cl.performed_at >= p_start_date
      AND cl.performed_at < p_end_date + INTERVAL '1 day'
    GROUP BY cl.performed_by, u.name;
  ELSE
    -- Default to current month
    RETURN QUERY
    SELECT
      cl.performed_by,
      u.name,
      COUNT(*)::BIGINT,
      SUM(COALESCE(cl.reward_amount, 0))::NUMERIC,
      RANK() OVER (ORDER BY SUM(COALESCE(cl.reward_amount, 0)) DESC)::INTEGER
    FROM chore_logs cl
    JOIN users u ON cl.performed_by = u.id
    WHERE cl.household_id = p_household_id
      AND DATE_TRUNC('month', cl.performed_at) = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY cl.performed_by, u.name;
  END IF;
END;
$$;


ALTER FUNCTION "public"."get_household_rankings"("p_household_id" "uuid", "p_period" "text", "p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (id, name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous User'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_household_admin"("user_uuid" "uuid", "household_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.household_members
    WHERE user_id = user_uuid
    AND household_id = household_uuid
    AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_household_admin"("user_uuid" "uuid", "household_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_opinion_box_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_opinion_box_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_household_ids"("user_uuid" "uuid") RETURNS SETOF "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT household_id
  FROM public.household_members
  WHERE user_id = user_uuid;
END;
$$;


ALTER FUNCTION "public"."user_household_ids"("user_uuid" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."chore_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "household_id" "uuid" NOT NULL,
    "chore_id" "uuid" NOT NULL,
    "performed_by" "uuid" NOT NULL,
    "performed_at" timestamp with time zone DEFAULT "now"(),
    "reward_amount" integer DEFAULT 0 NOT NULL,
    "note" "text",
    "is_verified" boolean DEFAULT false,
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chore_logs_reward_amount_check" CHECK (("reward_amount" >= 0))
);


ALTER TABLE "public"."chore_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "display_name" "text",
    "avatar_url" "text",
    "is_provider" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."all_time_rankings" AS
 SELECT "cl"."household_id",
    "cl"."performed_by" AS "user_id",
    "u"."name" AS "user_name",
    "count"(*) AS "chore_count",
    "sum"(COALESCE("cl"."reward_amount", 0)) AS "total_points"
   FROM ("public"."chore_logs" "cl"
     JOIN "public"."users" "u" ON (("cl"."performed_by" = "u"."id")))
  GROUP BY "cl"."household_id", "cl"."performed_by", "u"."name";


ALTER VIEW "public"."all_time_rankings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "household_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "reward_amount" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "order_index" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "chores_reward_amount_check" CHECK (("reward_amount" >= 0))
);


ALTER TABLE "public"."chores" OWNER TO "postgres";


COMMENT ON COLUMN "public"."chores"."order_index" IS 'Order index for sorting chores within a household';



CREATE TABLE IF NOT EXISTS "public"."household_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "household_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "settlement_group_id" "uuid",
    "joined_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "household_members_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'member'::"text"])))
);


ALTER TABLE "public"."household_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."households" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "settlement_day" integer DEFAULT 25,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "households_settlement_day_check" CHECK ((("settlement_day" >= 1) AND ("settlement_day" <= 31)))
);


ALTER TABLE "public"."households" OWNER TO "postgres";


COMMENT ON TABLE "public"."households" IS 'Household/roommate groups with invite code-based invitation system';



CREATE TABLE IF NOT EXISTS "public"."invite_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "household_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "is_used" boolean DEFAULT false,
    "used_by" "uuid",
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "invite_codes_code_check" CHECK (("code" ~ '^[A-Z0-9]{6}$'::"text"))
);


ALTER TABLE "public"."invite_codes" OWNER TO "postgres";


COMMENT ON TABLE "public"."invite_codes" IS 'Timed passcode invitation system for households';



COMMENT ON COLUMN "public"."invite_codes"."code" IS 'Six-character alphanumeric invite code (A-Z, 0-9)';



COMMENT ON COLUMN "public"."invite_codes"."expires_at" IS 'Expiration time for the invite code';



COMMENT ON COLUMN "public"."invite_codes"."is_used" IS 'Whether the invite code has been used';



COMMENT ON COLUMN "public"."invite_codes"."used_by" IS 'User who used the invite code';



COMMENT ON COLUMN "public"."invite_codes"."used_at" IS 'When the invite code was used';



CREATE OR REPLACE VIEW "public"."monthly_rankings" AS
 SELECT "cl"."household_id",
    "cl"."performed_by" AS "user_id",
    "u"."name" AS "user_name",
    "date_trunc"('month'::"text", "cl"."performed_at") AS "month",
    "count"(*) AS "chore_count",
    "sum"(COALESCE("cl"."reward_amount", 0)) AS "total_points"
   FROM ("public"."chore_logs" "cl"
     JOIN "public"."users" "u" ON (("cl"."performed_by" = "u"."id")))
  GROUP BY "cl"."household_id", "cl"."performed_by", "u"."name", ("date_trunc"('month'::"text", "cl"."performed_at"));


ALTER VIEW "public"."monthly_rankings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."opinion_box" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."opinion_box" OWNER TO "postgres";


COMMENT ON TABLE "public"."opinion_box" IS 'User feedback and opinions collection table';



COMMENT ON COLUMN "public"."opinion_box"."id" IS 'Primary key';



COMMENT ON COLUMN "public"."opinion_box"."user_id" IS 'User ID from auth.users, nullable for anonymous feedback';



COMMENT ON COLUMN "public"."opinion_box"."title" IS 'Opinion title/subject';



COMMENT ON COLUMN "public"."opinion_box"."content" IS 'Opinion content/details';



COMMENT ON COLUMN "public"."opinion_box"."email" IS 'Optional email address for response';



COMMENT ON COLUMN "public"."opinion_box"."created_at" IS 'Creation timestamp';



COMMENT ON COLUMN "public"."opinion_box"."updated_at" IS 'Last update timestamp';



CREATE TABLE IF NOT EXISTS "public"."settlement_group_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "settlement_group_id" "uuid" NOT NULL,
    "household_member_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."settlement_group_members" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."weekly_rankings" AS
 SELECT "cl"."household_id",
    "cl"."performed_by" AS "user_id",
    "u"."name" AS "user_name",
    "date_trunc"('week'::"text", "cl"."performed_at") AS "week",
    "count"(*) AS "chore_count",
    "sum"(COALESCE("cl"."reward_amount", 0)) AS "total_points"
   FROM ("public"."chore_logs" "cl"
     JOIN "public"."users" "u" ON (("cl"."performed_by" = "u"."id")))
  GROUP BY "cl"."household_id", "cl"."performed_by", "u"."name", ("date_trunc"('week'::"text", "cl"."performed_at"));


ALTER VIEW "public"."weekly_rankings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."chore_logs"
    ADD CONSTRAINT "chore_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chores"
    ADD CONSTRAINT "chores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."household_members"
    ADD CONSTRAINT "household_members_household_id_user_id_key" UNIQUE ("household_id", "user_id");



ALTER TABLE ONLY "public"."household_members"
    ADD CONSTRAINT "household_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."households"
    ADD CONSTRAINT "households_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invite_codes"
    ADD CONSTRAINT "invite_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."invite_codes"
    ADD CONSTRAINT "invite_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."opinion_box"
    ADD CONSTRAINT "opinion_box_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settlement_group_members"
    ADD CONSTRAINT "settlement_group_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settlement_group_members"
    ADD CONSTRAINT "settlement_group_members_settlement_group_id_household_memb_key" UNIQUE ("settlement_group_id", "household_member_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_chore_logs_chore_id" ON "public"."chore_logs" USING "btree" ("chore_id");



CREATE INDEX "idx_chore_logs_household_id" ON "public"."chore_logs" USING "btree" ("household_id");



CREATE INDEX "idx_chore_logs_performed_at" ON "public"."chore_logs" USING "btree" ("performed_at");



CREATE INDEX "idx_chore_logs_performed_by" ON "public"."chore_logs" USING "btree" ("performed_by");



CREATE INDEX "idx_chores_created_by" ON "public"."chores" USING "btree" ("created_by");



CREATE INDEX "idx_chores_household_id" ON "public"."chores" USING "btree" ("household_id");



CREATE INDEX "idx_chores_is_active" ON "public"."chores" USING "btree" ("is_active");



CREATE INDEX "idx_chores_order_index" ON "public"."chores" USING "btree" ("order_index");



CREATE INDEX "idx_household_members_household_id" ON "public"."household_members" USING "btree" ("household_id");



CREATE INDEX "idx_household_members_role" ON "public"."household_members" USING "btree" ("role");



CREATE INDEX "idx_household_members_settlement_group" ON "public"."household_members" USING "btree" ("settlement_group_id");



CREATE INDEX "idx_household_members_user_id" ON "public"."household_members" USING "btree" ("user_id");



CREATE INDEX "idx_households_name" ON "public"."households" USING "btree" ("name");



CREATE INDEX "idx_invite_codes_code" ON "public"."invite_codes" USING "btree" ("code");



CREATE INDEX "idx_invite_codes_created_by" ON "public"."invite_codes" USING "btree" ("created_by");



CREATE INDEX "idx_invite_codes_expires_at" ON "public"."invite_codes" USING "btree" ("expires_at");



CREATE INDEX "idx_invite_codes_household_id" ON "public"."invite_codes" USING "btree" ("household_id");



CREATE INDEX "idx_invite_codes_is_used" ON "public"."invite_codes" USING "btree" ("is_used");



CREATE INDEX "idx_opinion_box_created_at" ON "public"."opinion_box" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_opinion_box_user_id" ON "public"."opinion_box" USING "btree" ("user_id");



CREATE INDEX "idx_settlement_group_members_group_id" ON "public"."settlement_group_members" USING "btree" ("settlement_group_id");



CREATE INDEX "idx_settlement_group_members_member_id" ON "public"."settlement_group_members" USING "btree" ("household_member_id");



CREATE OR REPLACE TRIGGER "update_chore_logs_updated_at" BEFORE UPDATE ON "public"."chore_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_chores_updated_at" BEFORE UPDATE ON "public"."chores" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_household_members_updated_at" BEFORE UPDATE ON "public"."household_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_households_updated_at" BEFORE UPDATE ON "public"."households" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_invite_codes_updated_at" BEFORE UPDATE ON "public"."invite_codes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_opinion_box_updated_at_trigger" BEFORE UPDATE ON "public"."opinion_box" FOR EACH ROW EXECUTE FUNCTION "public"."update_opinion_box_updated_at"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."chore_logs"
    ADD CONSTRAINT "chore_logs_chore_id_fkey" FOREIGN KEY ("chore_id") REFERENCES "public"."chores"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chore_logs"
    ADD CONSTRAINT "chore_logs_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chore_logs"
    ADD CONSTRAINT "chore_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chore_logs"
    ADD CONSTRAINT "chore_logs_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."chores"
    ADD CONSTRAINT "chores_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chores"
    ADD CONSTRAINT "chores_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."household_members"
    ADD CONSTRAINT "household_members_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."household_members"
    ADD CONSTRAINT "household_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invite_codes"
    ADD CONSTRAINT "invite_codes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invite_codes"
    ADD CONSTRAINT "invite_codes_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invite_codes"
    ADD CONSTRAINT "invite_codes_used_by_fkey" FOREIGN KEY ("used_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."opinion_box"
    ADD CONSTRAINT "opinion_box_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."settlement_group_members"
    ADD CONSTRAINT "settlement_group_members_household_member_id_fkey" FOREIGN KEY ("household_member_id") REFERENCES "public"."household_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anonymous users can insert opinions" ON "public"."opinion_box" FOR INSERT WITH CHECK (("user_id" IS NULL));



CREATE POLICY "Anyone can read invite codes for validation" ON "public"."invite_codes" FOR SELECT USING (true);



CREATE POLICY "Anyone can use valid invite codes" ON "public"."invite_codes" FOR UPDATE TO "authenticated" USING ((("is_used" = false) AND ("expires_at" > "now"()))) WITH CHECK ((("is_used" = true) AND ("used_by" = "auth"."uid"())));



CREATE POLICY "Authenticated users can create households" ON "public"."households" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can create own profile" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Chore creators can delete their chores" ON "public"."chores" FOR DELETE TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Household admins can delete invite codes" ON "public"."invite_codes" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."household_members"
  WHERE (("household_members"."household_id" = "invite_codes"."household_id") AND ("household_members"."user_id" = "auth"."uid"()) AND ("household_members"."role" = 'admin'::"text")))));



CREATE POLICY "Household admins can update their household" ON "public"."households" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."household_members"
  WHERE (("household_members"."household_id" = "households"."id") AND ("household_members"."user_id" = "auth"."uid"()) AND ("household_members"."role" = 'admin'::"text")))));



CREATE POLICY "Household members can create chore logs" ON "public"."chore_logs" FOR INSERT TO "authenticated" WITH CHECK ((("performed_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."household_members"
  WHERE (("household_members"."household_id" = "chore_logs"."household_id") AND ("household_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Household members can create chores" ON "public"."chores" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "created_by") AND (EXISTS ( SELECT 1
   FROM "public"."household_members"
  WHERE (("household_members"."household_id" = "chores"."household_id") AND ("household_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Household members can create invite codes" ON "public"."invite_codes" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."household_members"
  WHERE (("household_members"."household_id" = "invite_codes"."household_id") AND ("household_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Household members can update chores" ON "public"."chores" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."household_members"
  WHERE (("household_members"."household_id" = "chores"."household_id") AND ("household_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Household members can view household chore logs" ON "public"."chore_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."household_members"
  WHERE (("household_members"."household_id" = "chore_logs"."household_id") AND ("household_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Household members can view household chores" ON "public"."chores" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."household_members"
  WHERE (("household_members"."household_id" = "chores"."household_id") AND ("household_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Household members can view their household" ON "public"."households" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."household_members"
  WHERE (("household_members"."household_id" = "households"."id") AND ("household_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Log creators can delete their logs" ON "public"."chore_logs" FOR DELETE TO "authenticated" USING (("performed_by" = "auth"."uid"()));



CREATE POLICY "Log creators can update their logs" ON "public"."chore_logs" FOR UPDATE TO "authenticated" USING (("performed_by" = "auth"."uid"()));



CREATE POLICY "Users can delete own profile" ON "public"."users" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own opinions" ON "public"."opinion_box" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update invite codes they created" ON "public"."invite_codes" FOR UPDATE TO "authenticated" USING (("created_by" = "auth"."uid"())) WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view household members" ON "public"."users" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR ("id" IN ( SELECT "hm2"."user_id"
   FROM ("public"."household_members" "hm1"
     JOIN "public"."household_members" "hm2" ON (("hm1"."household_id" = "hm2"."household_id")))
  WHERE ("hm1"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own profile" ON "public"."users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own opinions" ON "public"."opinion_box" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."chore_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chores" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete_membership" ON "public"."household_members" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_household_admin"("auth"."uid"(), "household_id")));



ALTER TABLE "public"."household_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_membership" ON "public"."household_members" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."invite_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."opinion_box" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settlement_group_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_membership" ON "public"."household_members" FOR UPDATE TO "authenticated" USING (("household_id" IN ( SELECT "hm"."household_id"
   FROM "public"."household_members" "hm"
  WHERE (("hm"."user_id" = "auth"."uid"()) AND ("hm"."role" = 'admin'::"text")))));



CREATE POLICY "view_household_members" ON "public"."household_members" FOR SELECT TO "authenticated" USING (("household_id" IN ( SELECT "public"."user_household_ids"("auth"."uid"()) AS "user_household_ids")));



CREATE POLICY "view_own_membership" ON "public"."household_members" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_household_rankings"("p_household_id" "uuid", "p_period" "text", "p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_household_rankings"("p_household_id" "uuid", "p_period" "text", "p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_household_rankings"("p_household_id" "uuid", "p_period" "text", "p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_household_admin"("user_uuid" "uuid", "household_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_household_admin"("user_uuid" "uuid", "household_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_household_admin"("user_uuid" "uuid", "household_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_opinion_box_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_opinion_box_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_opinion_box_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_household_ids"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_household_ids"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_household_ids"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."chore_logs" TO "anon";
GRANT ALL ON TABLE "public"."chore_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."chore_logs" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."all_time_rankings" TO "anon";
GRANT ALL ON TABLE "public"."all_time_rankings" TO "authenticated";
GRANT ALL ON TABLE "public"."all_time_rankings" TO "service_role";



GRANT ALL ON TABLE "public"."chores" TO "anon";
GRANT ALL ON TABLE "public"."chores" TO "authenticated";
GRANT ALL ON TABLE "public"."chores" TO "service_role";



GRANT ALL ON TABLE "public"."household_members" TO "anon";
GRANT ALL ON TABLE "public"."household_members" TO "authenticated";
GRANT ALL ON TABLE "public"."household_members" TO "service_role";



GRANT ALL ON TABLE "public"."households" TO "anon";
GRANT ALL ON TABLE "public"."households" TO "authenticated";
GRANT ALL ON TABLE "public"."households" TO "service_role";



GRANT ALL ON TABLE "public"."invite_codes" TO "anon";
GRANT ALL ON TABLE "public"."invite_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."invite_codes" TO "service_role";



GRANT ALL ON TABLE "public"."monthly_rankings" TO "anon";
GRANT ALL ON TABLE "public"."monthly_rankings" TO "authenticated";
GRANT ALL ON TABLE "public"."monthly_rankings" TO "service_role";



GRANT ALL ON TABLE "public"."opinion_box" TO "anon";
GRANT ALL ON TABLE "public"."opinion_box" TO "authenticated";
GRANT ALL ON TABLE "public"."opinion_box" TO "service_role";



GRANT ALL ON TABLE "public"."settlement_group_members" TO "anon";
GRANT ALL ON TABLE "public"."settlement_group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."settlement_group_members" TO "service_role";



GRANT ALL ON TABLE "public"."weekly_rankings" TO "anon";
GRANT ALL ON TABLE "public"."weekly_rankings" TO "authenticated";
GRANT ALL ON TABLE "public"."weekly_rankings" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






RESET ALL;




SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS '구인구직 플랫폼 스키마 (Job Board) - 마이그레이션 완료';



CREATE TYPE "public"."application_status" AS ENUM (
    'pending',
    'reviewed',
    'shortlisted',
    'interviewed',
    'offered',
    'rejected',
    'withdrawn'
);


ALTER TYPE "public"."application_status" OWNER TO "postgres";


CREATE TYPE "public"."education_level" AS ENUM (
    'sma',
    'd3',
    's1',
    's2',
    's3'
);


ALTER TYPE "public"."education_level" OWNER TO "postgres";


CREATE TYPE "public"."employment_type" AS ENUM (
    'full_time',
    'part_time',
    'contract',
    'internship',
    'freelance'
);


ALTER TYPE "public"."employment_type" OWNER TO "postgres";


CREATE TYPE "public"."experience_level" AS ENUM (
    'entry',
    'junior',
    'mid',
    'senior',
    'lead',
    'executive'
);


ALTER TYPE "public"."experience_level" OWNER TO "postgres";


CREATE TYPE "public"."job_status" AS ENUM (
    'draft',
    'active',
    'paused',
    'closed',
    'filled'
);


ALTER TYPE "public"."job_status" OWNER TO "postgres";


CREATE TYPE "public"."report_reason" AS ENUM (
    'fraud',
    'fake',
    'spam',
    'inappropriate',
    'duplicate',
    'other'
);


ALTER TYPE "public"."report_reason" OWNER TO "postgres";


CREATE TYPE "public"."report_status" AS ENUM (
    'pending',
    'reviewing',
    'resolved',
    'rejected'
);


ALTER TYPE "public"."report_status" OWNER TO "postgres";


CREATE TYPE "public"."report_type" AS ENUM (
    'product',
    'user'
);


ALTER TYPE "public"."report_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_old_inactive_products"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE products
  SET status = 'deleted'
  WHERE status = 'inactive'
    AND updated_at < now() - INTERVAL '90 days';
END;
$$;


ALTER FUNCTION "public"."archive_old_inactive_products"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_admin"() RETURNS TABLE("user_id" "uuid", "email" "text", "full_name" "text", "role" "text", "is_admin" boolean)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    u.email::TEXT,
    p.full_name,
    p.role,
    (p.role = 'admin') as is_admin
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.id = auth.uid();
END;
$$;


ALTER FUNCTION "public"."check_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_access_logs"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  DELETE FROM access_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;


ALTER FUNCTION "public"."cleanup_old_access_logs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_view_history"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  DELETE FROM view_history
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY viewed_at DESC) as rn
      FROM view_history
    ) t
    WHERE rn > 100
  );
END;
$$;


ALTER FUNCTION "public"."cleanup_old_view_history"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_nearest_regency"("lat" numeric, "lng" numeric) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  nearest_regency_id INTEGER;
BEGIN
  SELECT regency_id INTO nearest_regency_id
  FROM regencies
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL
  ORDER BY (
    6371 * acos(
      cos(radians(lat)) *
      cos(radians(latitude)) *
      cos(radians(longitude) - radians(lng)) +
      sin(radians(lat)) *
      sin(radians(latitude))
    )
  ) ASC
  LIMIT 1;

  RETURN nearest_regency_id;
END;
$$;


ALTER FUNCTION "public"."find_nearest_regency"("lat" numeric, "lng" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_admins"() RETURNS TABLE("user_id" "uuid", "email" "text", "full_name" "text", "role" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    u.email::TEXT,
    p.full_name,
    p.role,
    p.created_at
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.role = 'admin'
  ORDER BY p.created_at;
END;
$$;


ALTER FUNCTION "public"."get_all_admins"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_users_with_email"() RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text", "username" "text", "avatar_url" "text", "bio" "text", "role" "text", "created_at" timestamp with time zone, "is_suspended" boolean)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  -- Only admins can call this function
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    u.email::TEXT,
    p.full_name::TEXT,
    p.username::TEXT,
    p.avatar_url::TEXT,
    p.bio::TEXT,
    p.role::TEXT,
    p.created_at,
    COALESCE(p.is_suspended, false) as is_suspended
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  ORDER BY p.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_all_users_with_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_comment_replies"("comment_uuid" "uuid") RETURNS TABLE("id" "uuid", "product_id" "uuid", "user_id" "uuid", "parent_id" "uuid", "comment" "text", "rating" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "is_seller_reply" boolean, "user_name" "text", "user_avatar" "text")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.product_id,
    c.user_id,
    c.parent_id,
    c.comment,
    c.rating,
    c.created_at,
    c.updated_at,
    c.is_seller_reply,
    COALESCE(p.full_name, p.username, 'Anonymous') as user_name,
    p.avatar_url as user_avatar
  FROM product_comments c
  LEFT JOIN profiles p ON c.user_id = p.id
  WHERE c.parent_id = comment_uuid
  ORDER BY c.created_at ASC;
END;
$$;


ALTER FUNCTION "public"."get_comment_replies"("comment_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_comment_stats"("product_uuid" "uuid") RETURNS TABLE("comment_count" bigint, "average_rating" numeric, "rating_distribution" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as comment_count,
    ROUND(AVG(rating), 1) as average_rating,
    jsonb_object_agg(
      rating::TEXT,
      rating_count
    ) as rating_distribution
  FROM (
    SELECT
      rating,
      COUNT(*) as rating_count
    FROM product_comments
    WHERE product_id = product_uuid
      AND rating IS NOT NULL
      AND parent_id IS NULL
    GROUP BY rating
  ) rating_counts;
END;
$$;


ALTER FUNCTION "public"."get_product_comment_stats"("product_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_comments_with_replies"("product_uuid" "uuid") RETURNS TABLE("id" "uuid", "product_id" "uuid", "user_id" "uuid", "parent_id" "uuid", "comment" "text", "rating" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "is_seller_reply" boolean, "user_name" "text", "user_avatar" "text", "reply_count" bigint)
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.product_id,
    c.user_id,
    c.parent_id,
    c.comment,
    c.rating,
    c.created_at,
    c.updated_at,
    c.is_seller_reply,
    COALESCE(p.full_name, p.username, 'Anonymous') as user_name,
    p.avatar_url as user_avatar,
    (
      SELECT COUNT(*)
      FROM product_comments replies
      WHERE replies.parent_id = c.id
    )::BIGINT as reply_count
  FROM product_comments c
  LEFT JOIN profiles p ON c.user_id = p.id
  WHERE c.product_id = product_uuid
    AND c.parent_id IS NULL
  ORDER BY c.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_product_comments_with_replies"("product_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_product_stats"("user_uuid" "uuid") RETURNS TABLE("total_products" bigint, "active_products" bigint, "sold_products" bigint, "total_favorites" bigint, "average_rating" numeric)
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status != 'deleted')::BIGINT as total_products,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT as active_products,
    COUNT(*) FILTER (WHERE status = 'sold')::BIGINT as sold_products,
    (SELECT COUNT(*) FROM favorites WHERE favorites.user_id = user_uuid)::BIGINT as total_favorites,
    (
      SELECT ROUND(AVG(rating), 1)
      FROM product_comments c
      JOIN products p ON c.product_id = p.id
      WHERE p.user_id = user_uuid
        AND c.rating IS NOT NULL
        AND c.parent_id IS NULL
    ) as average_rating
  FROM products
  WHERE user_id = user_uuid;
END;
$$;


ALTER FUNCTION "public"."get_user_product_stats"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- 이미 존재하면 업데이트
    UPDATE public.profiles
    SET
      username = COALESCE(NEW.raw_user_meta_data->>'username', username),
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
      avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url)
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN others THEN
    -- 에러 로그 남기고 계속 진행
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."jobs_search_vector_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.search_vector := to_tsvector('indonesian',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(array_to_string(NEW.skills, ' '), '')
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."jobs_search_vector_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."move_user_products_to_trash"("target_user_id" "uuid", "admin_user_id" "uuid", "reason" "text") RETURNS TABLE("moved_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  product_record RECORD;
  total_moved integer := 0;
  user_email_val text;
  user_name_val text;
BEGIN
  -- Verify admin permission
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_user_id
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Admin permission required';
  END IF;

  -- Get user info
  SELECT u.email, p.full_name
  INTO user_email_val, user_name_val
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE u.id = target_user_id;

  -- Loop through all products of the user
  FOR product_record IN
    SELECT
      p.*,
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'image_url', pi.image_url,
            'order', pi.order
          )
        ) FILTER (WHERE pi.id IS NOT NULL),
        '[]'::jsonb
      ) as product_images,
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'id', pc.id,
            'user_id', pc.user_id,
            'comment', pc.comment,
            'rating', pc.rating,
            'created_at', pc.created_at,
            'is_seller_reply', pc.is_seller_reply
          )
        ) FILTER (WHERE pc.id IS NOT NULL),
        '[]'::jsonb
      ) as product_comments
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    LEFT JOIN product_comments pc ON p.id = pc.product_id
    WHERE p.user_id = target_user_id
    GROUP BY p.id
  LOOP
    -- Insert to trash
    INSERT INTO trash_products (
      original_product_id,
      user_id,
      user_email,
      user_full_name,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      province_id,
      regency_id,
      latitude,
      longitude,
      category_id,
      images,
      comments,
      created_at,
      deleted_at,
      deleted_by,
      deletion_reason
    ) VALUES (
      product_record.id,
      product_record.user_id,
      user_email_val,
      user_name_val,
      product_record.title,
      product_record.description,
      product_record.price,
      product_record.condition,
      product_record.is_negotiable,
      product_record.status,
      product_record.province_id,
      product_record.regency_id,
      product_record.latitude,
      product_record.longitude,
      product_record.category_id,
      product_record.product_images,
      product_record.product_comments,
      product_record.created_at,
      now(),
      admin_user_id,
      reason
    );

    total_moved := total_moved + 1;
  END LOOP;

  RETURN QUERY SELECT total_moved;
END;
$$;


ALTER FUNCTION "public"."move_user_products_to_trash"("target_user_id" "uuid", "admin_user_id" "uuid", "reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."nearby_jobs"("user_lat" numeric, "user_lng" numeric, "max_distance_km" integer DEFAULT 50, "limit_count" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "title" character varying, "company_name" character varying, "employment_type" "public"."employment_type", "salary_min" integer, "salary_max" integer, "regency_name" character varying, "distance_km" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.title,
    c.company_name,
    j.employment_type,
    j.salary_min,
    j.salary_max,
    r.regency_name,
    (6371 * acos(
      cos(radians(user_lat)) *
      cos(radians(j.latitude)) *
      cos(radians(j.longitude) - radians(user_lng)) +
      sin(radians(user_lat)) *
      sin(radians(j.latitude))
    ))::DECIMAL AS distance_km
  FROM jobs j
  JOIN companies c ON j.company_id = c.id
  LEFT JOIN regencies r ON j.regency_id = r.regency_id
  WHERE
    j.status = 'active'
    AND j.latitude IS NOT NULL
    AND j.longitude IS NOT NULL
    AND (6371 * acos(
      cos(radians(user_lat)) *
      cos(radians(j.latitude)) *
      cos(radians(j.longitude) - radians(user_lng)) +
      sin(radians(user_lat)) *
      sin(radians(j.latitude))
    )) <= max_distance_km
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."nearby_jobs"("user_lat" numeric, "user_lng" numeric, "max_distance_km" integer, "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."nearby_products"("user_lat" numeric, "user_lng" numeric, "max_distance_km" integer DEFAULT 50, "limit_count" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "title" character varying, "description" "text", "price" integer, "condition" character varying, "is_negotiable" boolean, "status" character varying, "province_id" integer, "regency_id" integer, "latitude" numeric, "longitude" numeric, "category_id" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "phone_number" character varying, "whatsapp_number" character varying, "distance_km" numeric, "image_url" "text", "regency_name" character varying, "province_name" character varying, "category_name" character varying)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.price,
    p.condition,
    p.is_negotiable,
    p.status,
    p.province_id,
    p.regency_id,
    p.latitude,
    p.longitude,
    p.category_id,
    p.created_at,
    p.updated_at,
    p.phone_number,
    p.whatsapp_number,
    (6371 * acos(
      cos(radians(user_lat)) *
      cos(radians(p.latitude)) *
      cos(radians(p.longitude) - radians(user_lng)) +
      sin(radians(user_lat)) *
      sin(radians(p.latitude))
    ))::DECIMAL AS distance_km,
    (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.order ASC LIMIT 1) AS image_url,
    r.regency_name,
    pr.province_name,
    c.name AS category_name
  FROM products p
  LEFT JOIN regencies r ON p.regency_id = r.regency_id
  LEFT JOIN provinces pr ON r.province_id = pr.province_id
  LEFT JOIN categories c ON p.category_id = c.category_id
  WHERE
    p.status = 'active'
    AND p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND (6371 * acos(
      cos(radians(user_lat)) *
      cos(radians(p.latitude)) *
      cos(radians(p.longitude) - radians(user_lng)) +
      sin(radians(user_lat)) *
      sin(radians(p.latitude))
    )) <= max_distance_km
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."nearby_products"("user_lat" numeric, "user_lng" numeric, "max_distance_km" integer, "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."products_by_regency"("user_regency_id" integer, "limit_count" integer DEFAULT 20) RETURNS TABLE("id" "uuid", "title" "text", "price" integer, "description" "text", "condition" "text", "status" "text", "user_id" "uuid", "regency_id" integer, "category_id" integer, "latitude" numeric, "longitude" numeric, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.price,
    p.description,
    p.condition,
    p.status,
    p.user_id,
    p.regency_id,
    p.category_id,
    p.latitude,
    p.longitude,
    p.created_at
  FROM products p
  WHERE p.status = 'active'
    AND (
      p.regency_id = user_regency_id
      OR p.regency_id IN (
        SELECT r2.regency_id
        FROM regencies r1
        JOIN regencies r2 ON r1.province_id = r2.province_id
        WHERE r1.regency_id = user_regency_id
      )
    )
  ORDER BY
    CASE WHEN p.regency_id = user_regency_id THEN 0 ELSE 1 END,
    p.created_at DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."products_by_regency"("user_regency_id" integer, "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."products_search_vector_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.search_vector := to_tsvector('indonesian', coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, ''));
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."products_search_vector_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."renew_product"("product_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE products
  SET expires_at = GREATEST(NOW(), expires_at) + INTERVAL '30 days',
      updated_at = NOW()
  WHERE id = product_id
    AND user_id = auth.uid();  -- Only owner can renew
END;
$$;


ALTER FUNCTION "public"."renew_product"("product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."restore_product_from_trash"("trash_id" "uuid", "admin_user_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  trash_record RECORD;
  new_product_id uuid;
  image_item jsonb;
  comment_item jsonb;
BEGIN
  -- Verify admin permission
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_user_id
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Admin permission required';
  END IF;

  -- Get trash record
  SELECT * INTO trash_record
  FROM trash_products
  WHERE id = trash_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trash record not found';
  END IF;

  -- Check if user still exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = trash_record.user_id) THEN
    RAISE EXCEPTION 'Cannot restore: User no longer exists';
  END IF;

  -- Restore product
  INSERT INTO products (
    user_id,
    title,
    description,
    price,
    condition,
    is_negotiable,
    status,
    province_id,
    regency_id,
    latitude,
    longitude,
    category_id,
    created_at,
    updated_at
  ) VALUES (
    trash_record.user_id,
    trash_record.title,
    trash_record.description,
    trash_record.price,
    trash_record.condition,
    trash_record.is_negotiable,
    'inactive', -- Restore as inactive for review
    trash_record.province_id,
    trash_record.regency_id,
    trash_record.latitude,
    trash_record.longitude,
    trash_record.category_id,
    trash_record.created_at,
    now()
  )
  RETURNING id INTO new_product_id;

  -- Restore images
  FOR image_item IN SELECT * FROM jsonb_array_elements(trash_record.images)
  LOOP
    INSERT INTO product_images (product_id, image_url, "order")
    VALUES (
      new_product_id,
      (image_item->>'image_url')::text,
      (image_item->>'order')::integer
    );
  END LOOP;

  -- Note: Comments are not restored, kept in trash for evidence only

  -- Delete from trash
  DELETE FROM trash_products WHERE id = trash_id;

  RETURN new_product_id;
END;
$$;


ALTER FUNCTION "public"."restore_product_from_trash"("trash_id" "uuid", "admin_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_jobs"("search_query" "text", "limit_count" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "title" "text", "company_name" character varying, "employment_type" "public"."employment_type", "salary_min" integer, "salary_max" integer, "regency_name" character varying, "rank" real)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.title,
    c.company_name,
    j.employment_type,
    j.salary_min,
    j.salary_max,
    r.regency_name,
    ts_rank(j.search_vector, to_tsquery('indonesian', search_query)) as rank
  FROM jobs j
  JOIN companies c ON j.company_id = c.id
  LEFT JOIN regencies r ON j.regency_id = r.regency_id
  WHERE j.search_vector @@ to_tsquery('indonesian', search_query)
    AND j.status = 'active'
  ORDER BY rank DESC, j.created_at DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."search_jobs"("search_query" "text", "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_products"("search_query" "text", "limit_count" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "title" "text", "description" "text", "price" integer, "condition" "text", "status" "text", "latitude" numeric, "longitude" numeric, "regency_id" integer, "category_id" integer, "user_id" "uuid", "created_at" timestamp with time zone, "rank" real)
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.price,
    p.condition,
    p.status,
    p.latitude,
    p.longitude,
    p.regency_id,
    p.category_id,
    p.user_id,
    p.created_at,
    ts_rank(p.search_vector, to_tsquery('indonesian', search_query)) as rank
  FROM products p
  WHERE p.search_vector @@ to_tsquery('indonesian', search_query)
    AND p.status = 'active'
  ORDER BY rank DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."search_products"("search_query" "text", "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_access_log_regency"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL AND NEW.regency_id IS NULL THEN
    NEW.regency_id := find_nearest_regency(NEW.latitude, NEW.longitude);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_access_log_regency"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_job_expiry"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.expires_at := NEW.created_at + INTERVAL '30 days';
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_job_expiry"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_product_expiry"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Set expires_at to 30 days from created_at
  NEW.expires_at := NEW.created_at + INTERVAL '30 days';
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_product_expiry"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_product_location_from_regency"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF (NEW.latitude IS NULL OR NEW.longitude IS NULL) AND NEW.regency_id IS NOT NULL THEN
    SELECT latitude, longitude
    INTO NEW.latitude, NEW.longitude
    FROM regencies
    WHERE regency_id = NEW.regency_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_product_location_from_regency"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_advertisement_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_advertisement_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_comments_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_product_comments_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_reports_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_reports_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_view_history"("p_user_id" "uuid", "p_product_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO view_history (user_id, product_id, viewed_at)
  VALUES (p_user_id, p_product_id, now())
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET viewed_at = now();
END;
$$;


ALTER FUNCTION "public"."upsert_view_history"("p_user_id" "uuid", "p_product_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."_backup_favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "product_slug" "text" NOT NULL
);


ALTER TABLE "public"."_backup_favorites" OWNER TO "postgres";


COMMENT ON TABLE "public"."_backup_favorites" IS '찜한 상품 (위시리스트)';



CREATE TABLE IF NOT EXISTS "public"."_backup_product_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "parent_id" "uuid",
    "comment" "text" NOT NULL,
    "rating" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_seller_reply" boolean DEFAULT false,
    "product_slug" "text" NOT NULL,
    CONSTRAINT "comment_length" CHECK ((("char_length"("comment") >= 1) AND ("char_length"("comment") <= 1000))),
    CONSTRAINT "product_comments_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."_backup_product_comments" OWNER TO "postgres";


COMMENT ON TABLE "public"."_backup_product_comments" IS '상품 댓글/리뷰 (별점, 대댓글 지원)';



COMMENT ON COLUMN "public"."_backup_product_comments"."parent_id" IS '대댓글용 부모 댓글 ID';



COMMENT ON COLUMN "public"."_backup_product_comments"."rating" IS '별점 1-5 (최상위 댓글만)';



COMMENT ON COLUMN "public"."_backup_product_comments"."is_seller_reply" IS '판매자 답글 여부';



CREATE TABLE IF NOT EXISTS "public"."_backup_product_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "image_url" "text" NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "product_slug" "text" NOT NULL
);


ALTER TABLE "public"."_backup_product_images" OWNER TO "postgres";


COMMENT ON TABLE "public"."_backup_product_images" IS '상품 이미지 (최대 5장)';



COMMENT ON COLUMN "public"."_backup_product_images"."order" IS '이미지 순서 (0이 대표 이미지)';



CREATE TABLE IF NOT EXISTS "public"."_backup_products" (
    "user_id" "uuid" NOT NULL,
    "title" character varying(100) NOT NULL,
    "description" "text" NOT NULL,
    "price" integer NOT NULL,
    "condition" character varying(50) NOT NULL,
    "is_negotiable" boolean DEFAULT false,
    "status" character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "province_id" integer,
    "regency_id" integer,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "category_id" integer,
    "search_vector" "tsvector",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "phone_number" character varying(15),
    "whatsapp_number" character varying(15),
    "expires_at" timestamp with time zone,
    "slug" "text" DEFAULT 'pending-slug'::"text" NOT NULL,
    CONSTRAINT "description_length" CHECK ((("char_length"("description") >= 10) AND ("char_length"("description") <= 2000))),
    CONSTRAINT "products_condition_check" CHECK ((("condition")::"text" = ANY (ARRAY[('Baru'::character varying)::"text", ('Seperti Baru'::character varying)::"text", ('Sangat Bagus'::character varying)::"text", ('Bagus'::character varying)::"text", ('Cukup Bagus'::character varying)::"text"]))),
    CONSTRAINT "products_price_check" CHECK (("price" >= 0)),
    CONSTRAINT "products_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('active'::character varying)::"text", ('paused'::character varying)::"text", ('sold'::character varying)::"text", ('inactive'::character varying)::"text", ('deleted'::character varying)::"text", ('suspended'::character varying)::"text"]))),
    CONSTRAINT "slug_format" CHECK (("slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::"text")),
    CONSTRAINT "title_length" CHECK ((("char_length"(("title")::"text") >= 5) AND ("char_length"(("title")::"text") <= 100)))
);


ALTER TABLE "public"."_backup_products" OWNER TO "postgres";


COMMENT ON TABLE "public"."_backup_products" IS 'Products table - contact info stored per product for privacy';



COMMENT ON COLUMN "public"."_backup_products"."condition" IS '상품 상태: Baru, Seperti Baru, Sangat Bagus, Bagus, Cukup Bagus';



COMMENT ON COLUMN "public"."_backup_products"."status" IS '상품 상태: active(판매중), sold(판매완료), inactive(비활성), deleted(삭제됨)';



COMMENT ON COLUMN "public"."_backup_products"."phone_number" IS 'Contact phone number for this product (10-13 digits)';



COMMENT ON COLUMN "public"."_backup_products"."whatsapp_number" IS 'WhatsApp number for this product (10-13 digits)';



COMMENT ON COLUMN "public"."_backup_products"."expires_at" IS 'Product listing expiration date (30 days from creation, can be renewed)';



COMMENT ON COLUMN "public"."_backup_products"."slug" IS 'SEO-friendly URL slug generated from title';



CREATE TABLE IF NOT EXISTS "public"."_backup_trash_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "original_product_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_email" "text",
    "user_full_name" "text",
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "price" integer NOT NULL,
    "condition" "text" NOT NULL,
    "is_negotiable" boolean DEFAULT false,
    "status" "text" NOT NULL,
    "province_id" integer,
    "regency_id" integer,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "category_id" integer,
    "images" "jsonb",
    "comments" "jsonb",
    "created_at" timestamp with time zone,
    "deleted_at" timestamp with time zone DEFAULT "now"(),
    "deleted_by" "uuid",
    "deletion_reason" "text",
    CONSTRAINT "trash_products_price_check" CHECK (("price" >= 0))
);


ALTER TABLE "public"."_backup_trash_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."_backup_view_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "viewed_at" timestamp with time zone DEFAULT "now"(),
    "product_slug" "text" NOT NULL
);


ALTER TABLE "public"."_backup_view_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."_backup_view_history" IS '사용자 상품 조회 기록';



CREATE TABLE IF NOT EXISTS "public"."access_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "regency_id" integer,
    "user_agent" "text",
    "page_url" "text",
    "access_date" "date" DEFAULT CURRENT_DATE,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."access_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."advertisements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "position" character varying(50) NOT NULL,
    "ad_code" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "device_type" "text" DEFAULT 'both'::"text",
    CONSTRAINT "advertisements_device_type_check" CHECK (("device_type" = ANY (ARRAY['pc'::"text", 'mobile'::"text", 'both'::"text"])))
);


ALTER TABLE "public"."advertisements" OWNER TO "postgres";


COMMENT ON TABLE "public"."advertisements" IS 'Stores advertisement codes and scripts for different page positions';



COMMENT ON COLUMN "public"."advertisements"."position" IS 'Position where ad will be displayed: header, sidebar, footer, between_products, product_detail';



COMMENT ON COLUMN "public"."advertisements"."ad_code" IS 'HTML/JavaScript code for the advertisement (Google Ads script or custom code)';



COMMENT ON COLUMN "public"."advertisements"."is_active" IS 'Whether this advertisement is currently active';



COMMENT ON COLUMN "public"."advertisements"."device_type" IS 'Device type for advertisement display: pc, mobile, or both';



CREATE TABLE IF NOT EXISTS "public"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid" NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "resume_url" "text" NOT NULL,
    "cover_letter" "text",
    "status" "public"."application_status" DEFAULT 'pending'::"public"."application_status",
    "expected_salary" integer,
    "available_start_date" "date",
    "employer_notes" "text",
    "applied_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_at" timestamp with time zone
);


ALTER TABLE "public"."applications" OWNER TO "postgres";


COMMENT ON TABLE "public"."applications" IS '채용 지원 내역';



COMMENT ON COLUMN "public"."applications"."employer_notes" IS '기업 측 메모 (구직자에게 비공개)';



CREATE TABLE IF NOT EXISTS "public"."candidate_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "full_name" character varying(100) NOT NULL,
    "date_of_birth" "date",
    "gender" character varying(20),
    "email" character varying(255),
    "phone" character varying(15),
    "province_id" integer,
    "regency_id" integer,
    "current_title" character varying(100),
    "experience_level" "public"."experience_level",
    "expected_salary_min" integer,
    "expected_salary_max" integer,
    "skills" "text"[],
    "education_level" "public"."education_level",
    "resume_url" "text",
    "portfolio_url" "text",
    "linkedin_url" "text",
    "bio" "text",
    "is_profile_public" boolean DEFAULT true,
    "is_open_to_work" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."candidate_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."candidate_profiles" IS '구직자 프로필';



COMMENT ON COLUMN "public"."candidate_profiles"."is_open_to_work" IS '구직 중 여부';



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "category_id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "parent_category" character varying(100),
    "icon" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."categories" IS '업종 카테고리 (기존 데이터 유지)';



COMMENT ON COLUMN "public"."categories"."parent_category" IS '상위 카테고리 (Electronics, Fashion, etc.)';



CREATE SEQUENCE IF NOT EXISTS "public"."categories_category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."categories_category_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."categories_category_id_seq" OWNED BY "public"."categories"."category_id";



CREATE TABLE IF NOT EXISTS "public"."certifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "name" character varying(200) NOT NULL,
    "issuing_organization" character varying(200),
    "issue_date" "date",
    "expiry_date" "date",
    "credential_id" character varying(100),
    "credential_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."certifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."certifications" IS '자격증 및 인증서';



CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_name" character varying(200) NOT NULL,
    "business_registration" character varying(50),
    "industry" character varying(100),
    "company_size" character varying(50),
    "email" character varying(255),
    "phone" character varying(15),
    "website" character varying(255),
    "address" "text",
    "province_id" integer,
    "regency_id" integer,
    "logo_url" "text",
    "cover_image_url" "text",
    "description" "text",
    "benefits" "text"[],
    "is_verified" boolean DEFAULT false,
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "contact_person" character varying(100),
    CONSTRAINT "business_registration_format" CHECK ((("business_registration" IS NULL) OR ("length"(("business_registration")::"text") >= 10)))
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


COMMENT ON TABLE "public"."companies" IS '기업 정보 테이블';



COMMENT ON COLUMN "public"."companies"."business_registration" IS 'NPWP 또는 NIB (사업자등록번호)';



COMMENT ON COLUMN "public"."companies"."benefits" IS '복리후생 목록 (BPJS, 보험, 식대 등)';



COMMENT ON COLUMN "public"."companies"."contact_person" IS '채용 담당자 이름';



CREATE TABLE IF NOT EXISTS "public"."education" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "institution" character varying(200) NOT NULL,
    "degree" "public"."education_level" NOT NULL,
    "field_of_study" character varying(100),
    "start_date" "date",
    "end_date" "date",
    "is_current" boolean DEFAULT false,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."education" OWNER TO "postgres";


COMMENT ON TABLE "public"."education" IS '구직자 학력 정보';



CREATE TABLE IF NOT EXISTS "public"."job_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "viewed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_views" OWNER TO "postgres";


COMMENT ON TABLE "public"."job_views" IS '채용공고 조회 기록';



CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "title" character varying(200) NOT NULL,
    "description" "text" NOT NULL,
    "requirements" "text" NOT NULL,
    "responsibilities" "text",
    "employment_type" "public"."employment_type" NOT NULL,
    "experience_level" "public"."experience_level" NOT NULL,
    "salary_min" integer,
    "salary_max" integer,
    "salary_currency" character varying(3) DEFAULT 'IDR'::character varying,
    "is_salary_negotiable" boolean DEFAULT false,
    "province_id" integer,
    "regency_id" integer,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "is_remote" boolean DEFAULT false,
    "category_id" integer,
    "skills" "text"[],
    "benefits" "text"[],
    "positions_available" integer DEFAULT 1,
    "deadline" timestamp with time zone,
    "status" "public"."job_status" DEFAULT 'draft'::"public"."job_status",
    "view_count" integer DEFAULT 0,
    "search_vector" "tsvector",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    CONSTRAINT "description_length" CHECK (("length"("description") >= 50)),
    CONSTRAINT "salary_range_check" CHECK ((("salary_min" IS NULL) OR ("salary_max" IS NULL) OR ("salary_min" <= "salary_max"))),
    CONSTRAINT "title_length" CHECK ((("length"(("title")::"text") >= 5) AND ("length"(("title")::"text") <= 200)))
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


COMMENT ON TABLE "public"."jobs" IS '채용공고 테이블';



COMMENT ON COLUMN "public"."jobs"."is_remote" IS '원격 근무 가능 여부';



COMMENT ON COLUMN "public"."jobs"."skills" IS '필요 기술 목록 (React, Node.js, etc.)';



CREATE TABLE IF NOT EXISTS "public"."notification_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "url" "text",
    "total_recipients" integer,
    "successful_sends" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notification_logs_type_check" CHECK (("type" = ANY (ARRAY['individual'::"text", 'broadcast'::"text"])))
);


ALTER TABLE "public"."notification_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" character varying(50),
    "full_name" character varying(100),
    "avatar_url" "text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "role" character varying(20) DEFAULT 'user'::character varying,
    "is_suspended" boolean DEFAULT false,
    "suspended_at" timestamp with time zone,
    "suspended_by" "uuid",
    "suspension_reason" "text",
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "deletion_reason" "text",
    CONSTRAINT "profiles_role_check" CHECK ((("role")::"text" = ANY (ARRAY[('user'::character varying)::"text", ('admin'::character varying)::"text", ('moderator'::character varying)::"text", ('job_seeker'::character varying)::"text", ('employer'::character varying)::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS '사용자 프로필 (구직자 및 기업 공통)';



COMMENT ON COLUMN "public"."profiles"."role" IS 'user, admin, moderator, job_seeker, employer';



CREATE TABLE IF NOT EXISTS "public"."provinces" (
    "province_id" integer NOT NULL,
    "province_name" character varying(100) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."provinces" OWNER TO "postgres";


COMMENT ON TABLE "public"."provinces" IS '인도네시아 34개 주 정보';



CREATE SEQUENCE IF NOT EXISTS "public"."provinces_province_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."provinces_province_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."provinces_province_id_seq" OWNED BY "public"."provinces"."province_id";



CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "endpoint" "text" NOT NULL,
    "p256dh" "text" NOT NULL,
    "auth" "text" NOT NULL,
    "subscription_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."push_subscriptions" IS 'Stores push notification subscriptions for users';



CREATE TABLE IF NOT EXISTS "public"."regencies" (
    "regency_id" integer NOT NULL,
    "province_id" integer NOT NULL,
    "regency_name" character varying(100) NOT NULL,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."regencies" OWNER TO "postgres";


COMMENT ON TABLE "public"."regencies" IS '인도네시아 514개 시/군 정보 (위경도 포함)';



COMMENT ON COLUMN "public"."regencies"."latitude" IS '시/군 중심 위도 좌표';



COMMENT ON COLUMN "public"."regencies"."longitude" IS '시/군 중심 경도 좌표';



CREATE SEQUENCE IF NOT EXISTS "public"."regencies_regency_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."regencies_regency_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."regencies_regency_id_seq" OWNED BY "public"."regencies"."regency_id";



CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reporter_id" "uuid",
    "report_type" "public"."report_type" NOT NULL,
    "reported_user_id" "uuid",
    "reason" "public"."report_reason" NOT NULL,
    "description" "text",
    "evidence_urls" "text"[],
    "status" "public"."report_status" DEFAULT 'pending'::"public"."report_status",
    "admin_note" "text",
    "resolved_by" "uuid",
    "resolved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "reported_product_slug" "text"
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."saved_jobs" OWNER TO "postgres";


COMMENT ON TABLE "public"."saved_jobs" IS '관심 채용공고 (찜)';



CREATE TABLE IF NOT EXISTS "public"."work_experience" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "company_name" character varying(200) NOT NULL,
    "job_title" character varying(100) NOT NULL,
    "employment_type" "public"."employment_type",
    "location" character varying(100),
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "is_current" boolean DEFAULT false,
    "description" "text",
    "achievements" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."work_experience" OWNER TO "postgres";


COMMENT ON TABLE "public"."work_experience" IS '구직자 경력 정보';



ALTER TABLE ONLY "public"."categories" ALTER COLUMN "category_id" SET DEFAULT "nextval"('"public"."categories_category_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."provinces" ALTER COLUMN "province_id" SET DEFAULT "nextval"('"public"."provinces_province_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."regencies" ALTER COLUMN "regency_id" SET DEFAULT "nextval"('"public"."regencies_regency_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."access_logs"
    ADD CONSTRAINT "access_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."access_logs"
    ADD CONSTRAINT "access_logs_session_id_access_date_key" UNIQUE ("session_id", "access_date");



ALTER TABLE ONLY "public"."advertisements"
    ADD CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_job_id_candidate_id_key" UNIQUE ("job_id", "candidate_id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_profiles"
    ADD CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_profiles"
    ADD CONSTRAINT "candidate_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id");



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."education"
    ADD CONSTRAINT "education_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."_backup_favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_views"
    ADD CONSTRAINT "job_views_job_id_user_id_key" UNIQUE ("job_id", "user_id");



ALTER TABLE ONLY "public"."job_views"
    ADD CONSTRAINT "job_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."_backup_product_comments"
    ADD CONSTRAINT "product_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."_backup_product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."_backup_products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("slug");



ALTER TABLE ONLY "public"."_backup_products"
    ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."provinces"
    ADD CONSTRAINT "provinces_pkey" PRIMARY KEY ("province_id");



ALTER TABLE ONLY "public"."provinces"
    ADD CONSTRAINT "provinces_province_name_key" UNIQUE ("province_name");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_user_id_endpoint_key" UNIQUE ("user_id", "endpoint");



ALTER TABLE ONLY "public"."regencies"
    ADD CONSTRAINT "regencies_pkey" PRIMARY KEY ("regency_id");



ALTER TABLE ONLY "public"."regencies"
    ADD CONSTRAINT "regencies_province_id_regency_name_key" UNIQUE ("province_id", "regency_name");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_jobs"
    ADD CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_jobs"
    ADD CONSTRAINT "saved_jobs_user_id_job_id_key" UNIQUE ("user_id", "job_id");



ALTER TABLE ONLY "public"."_backup_trash_products"
    ADD CONSTRAINT "trash_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."_backup_view_history"
    ADD CONSTRAINT "view_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_experience"
    ADD CONSTRAINT "work_experience_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "favorites_user_slug_key" ON "public"."_backup_favorites" USING "btree" ("user_id", "product_slug");



CREATE INDEX "idx_access_logs_date" ON "public"."access_logs" USING "btree" ("access_date" DESC);



CREATE INDEX "idx_access_logs_regency" ON "public"."access_logs" USING "btree" ("regency_id");



CREATE INDEX "idx_access_logs_session" ON "public"."access_logs" USING "btree" ("session_id", "access_date");



CREATE INDEX "idx_advertisements_position_active" ON "public"."advertisements" USING "btree" ("position", "is_active");



CREATE INDEX "idx_applications_candidate" ON "public"."applications" USING "btree" ("candidate_id");



CREATE INDEX "idx_applications_date" ON "public"."applications" USING "btree" ("applied_at" DESC);



CREATE INDEX "idx_applications_job" ON "public"."applications" USING "btree" ("job_id");



CREATE INDEX "idx_applications_status" ON "public"."applications" USING "btree" ("status");



CREATE INDEX "idx_candidates_experience" ON "public"."candidate_profiles" USING "btree" ("experience_level");



CREATE INDEX "idx_candidates_open_to_work" ON "public"."candidate_profiles" USING "btree" ("is_open_to_work");



CREATE INDEX "idx_candidates_regency" ON "public"."candidate_profiles" USING "btree" ("regency_id");



CREATE INDEX "idx_candidates_user" ON "public"."candidate_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_categories_parent" ON "public"."categories" USING "btree" ("parent_category") WHERE ("parent_category" IS NOT NULL);



CREATE INDEX "idx_certifications_candidate" ON "public"."certifications" USING "btree" ("candidate_id");



CREATE INDEX "idx_comments_parent" ON "public"."_backup_product_comments" USING "btree" ("parent_id");



CREATE INDEX "idx_comments_slug_created" ON "public"."_backup_product_comments" USING "btree" ("product_slug", "created_at" DESC);



CREATE INDEX "idx_comments_user" ON "public"."_backup_product_comments" USING "btree" ("user_id");



CREATE INDEX "idx_companies_regency" ON "public"."companies" USING "btree" ("regency_id");



CREATE INDEX "idx_companies_user" ON "public"."companies" USING "btree" ("user_id");



CREATE INDEX "idx_companies_verified" ON "public"."companies" USING "btree" ("is_verified");



CREATE INDEX "idx_education_candidate" ON "public"."education" USING "btree" ("candidate_id");



CREATE INDEX "idx_favorites_slug" ON "public"."_backup_favorites" USING "btree" ("product_slug");



CREATE INDEX "idx_favorites_user" ON "public"."_backup_favorites" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_favorites_user_created" ON "public"."_backup_favorites" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_job_views_job" ON "public"."job_views" USING "btree" ("job_id");



CREATE INDEX "idx_job_views_user" ON "public"."job_views" USING "btree" ("user_id", "viewed_at" DESC);



CREATE INDEX "idx_jobs_active" ON "public"."jobs" USING "btree" ("status", "deadline") WHERE ("status" = 'active'::"public"."job_status");



CREATE INDEX "idx_jobs_category" ON "public"."jobs" USING "btree" ("category_id");



CREATE INDEX "idx_jobs_company" ON "public"."jobs" USING "btree" ("company_id");



CREATE INDEX "idx_jobs_created" ON "public"."jobs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_jobs_deadline" ON "public"."jobs" USING "btree" ("deadline");



CREATE INDEX "idx_jobs_location" ON "public"."jobs" USING "btree" ("latitude", "longitude") WHERE (("latitude" IS NOT NULL) AND ("longitude" IS NOT NULL));



CREATE INDEX "idx_jobs_regency" ON "public"."jobs" USING "btree" ("regency_id");



CREATE INDEX "idx_jobs_search" ON "public"."jobs" USING "gin" ("search_vector");



CREATE INDEX "idx_jobs_status" ON "public"."jobs" USING "btree" ("status");



CREATE INDEX "idx_notification_logs_created_at" ON "public"."notification_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_product_comments_created" ON "public"."_backup_product_comments" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_product_comments_parent" ON "public"."_backup_product_comments" USING "btree" ("parent_id");



CREATE INDEX "idx_product_comments_slug" ON "public"."_backup_product_comments" USING "btree" ("product_slug", "created_at" DESC);



CREATE INDEX "idx_product_comments_user" ON "public"."_backup_product_comments" USING "btree" ("user_id");



CREATE INDEX "idx_product_images_slug" ON "public"."_backup_product_images" USING "btree" ("product_slug", "order");



CREATE INDEX "idx_product_images_slug_order" ON "public"."_backup_product_images" USING "btree" ("product_slug", "order");



CREATE INDEX "idx_products_category" ON "public"."_backup_products" USING "btree" ("category_id");



CREATE INDEX "idx_products_composite" ON "public"."_backup_products" USING "btree" ("status", "expires_at", "regency_id", "category_id") WHERE (("status")::"text" = 'active'::"text");



CREATE INDEX "idx_products_created" ON "public"."_backup_products" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_products_created_at" ON "public"."_backup_products" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_products_expires_at" ON "public"."_backup_products" USING "btree" ("expires_at");



CREATE INDEX "idx_products_latitude" ON "public"."_backup_products" USING "btree" ("latitude");



CREATE INDEX "idx_products_location" ON "public"."_backup_products" USING "btree" ("latitude", "longitude") WHERE (("latitude" IS NOT NULL) AND ("longitude" IS NOT NULL));



CREATE INDEX "idx_products_longitude" ON "public"."_backup_products" USING "btree" ("longitude");



CREATE INDEX "idx_products_price" ON "public"."_backup_products" USING "btree" ("price");



CREATE INDEX "idx_products_regency" ON "public"."_backup_products" USING "btree" ("regency_id");



CREATE INDEX "idx_products_search" ON "public"."_backup_products" USING "gin" ("to_tsvector"('"indonesian"'::"regconfig", ((("title")::"text" || ' '::"text") || COALESCE("description", ''::"text"))));



CREATE INDEX "idx_products_slug" ON "public"."_backup_products" USING "btree" ("slug");



CREATE INDEX "idx_products_status" ON "public"."_backup_products" USING "btree" ("status");



CREATE INDEX "idx_products_status_expires" ON "public"."_backup_products" USING "btree" ("status", "expires_at") WHERE (("status")::"text" = 'active'::"text");



CREATE INDEX "idx_products_user" ON "public"."_backup_products" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_deleted" ON "public"."profiles" USING "btree" ("deleted_at");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_profiles_suspended" ON "public"."profiles" USING "btree" ("is_suspended");



CREATE INDEX "idx_profiles_username" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "idx_push_subscriptions_endpoint" ON "public"."push_subscriptions" USING "btree" ("endpoint");



CREATE INDEX "idx_push_subscriptions_user_id" ON "public"."push_subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_regencies_location" ON "public"."regencies" USING "btree" ("latitude", "longitude") WHERE (("latitude" IS NOT NULL) AND ("longitude" IS NOT NULL));



CREATE INDEX "idx_regencies_province" ON "public"."regencies" USING "btree" ("province_id");



CREATE INDEX "idx_reports_created" ON "public"."reports" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_reports_reporter" ON "public"."reports" USING "btree" ("reporter_id");



CREATE INDEX "idx_reports_status" ON "public"."reports" USING "btree" ("status");



CREATE INDEX "idx_reports_user" ON "public"."reports" USING "btree" ("reported_user_id");



CREATE INDEX "idx_saved_jobs_job" ON "public"."saved_jobs" USING "btree" ("job_id");



CREATE INDEX "idx_saved_jobs_user" ON "public"."saved_jobs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_trash_products_deleted_at" ON "public"."_backup_trash_products" USING "btree" ("deleted_at" DESC);



CREATE INDEX "idx_trash_products_deleted_by" ON "public"."_backup_trash_products" USING "btree" ("deleted_by");



CREATE INDEX "idx_trash_products_user" ON "public"."_backup_trash_products" USING "btree" ("user_id");



CREATE INDEX "idx_view_history_slug" ON "public"."_backup_view_history" USING "btree" ("product_slug", "viewed_at" DESC);



CREATE INDEX "idx_view_history_user" ON "public"."_backup_view_history" USING "btree" ("user_id", "viewed_at" DESC);



CREATE INDEX "idx_view_history_user_viewed" ON "public"."_backup_view_history" USING "btree" ("user_id", "viewed_at" DESC);



CREATE INDEX "idx_work_experience_candidate" ON "public"."work_experience" USING "btree" ("candidate_id");



CREATE INDEX "idx_work_experience_current" ON "public"."work_experience" USING "btree" ("is_current");



CREATE INDEX "products_search_idx" ON "public"."_backup_products" USING "gin" ("search_vector");



CREATE OR REPLACE TRIGGER "jobs_search_vector_trigger" BEFORE INSERT OR UPDATE ON "public"."jobs" FOR EACH ROW EXECUTE FUNCTION "public"."jobs_search_vector_update"();



CREATE OR REPLACE TRIGGER "products_search_vector_trigger" BEFORE INSERT OR UPDATE ON "public"."_backup_products" FOR EACH ROW EXECUTE FUNCTION "public"."products_search_vector_update"();



CREATE OR REPLACE TRIGGER "trigger_product_comments_updated_at" BEFORE UPDATE ON "public"."_backup_product_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_product_comments_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_reports_updated_at" BEFORE UPDATE ON "public"."reports" FOR EACH ROW EXECUTE FUNCTION "public"."update_reports_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_set_access_log_regency" BEFORE INSERT ON "public"."access_logs" FOR EACH ROW EXECUTE FUNCTION "public"."set_access_log_regency"();



CREATE OR REPLACE TRIGGER "trigger_set_job_expiry" BEFORE INSERT ON "public"."jobs" FOR EACH ROW EXECUTE FUNCTION "public"."set_job_expiry"();



CREATE OR REPLACE TRIGGER "trigger_set_product_expiry" BEFORE INSERT ON "public"."_backup_products" FOR EACH ROW EXECUTE FUNCTION "public"."set_product_expiry"();



CREATE OR REPLACE TRIGGER "trigger_set_product_location_insert" BEFORE INSERT ON "public"."_backup_products" FOR EACH ROW EXECUTE FUNCTION "public"."set_product_location_from_regency"();



CREATE OR REPLACE TRIGGER "trigger_set_product_location_update" BEFORE UPDATE ON "public"."_backup_products" FOR EACH ROW WHEN (("new"."regency_id" IS DISTINCT FROM "old"."regency_id")) EXECUTE FUNCTION "public"."set_product_location_from_regency"();



CREATE OR REPLACE TRIGGER "trigger_update_advertisement_timestamp" BEFORE UPDATE ON "public"."advertisements" FOR EACH ROW EXECUTE FUNCTION "public"."update_advertisement_updated_at"();



CREATE OR REPLACE TRIGGER "update_applications_updated_at" BEFORE UPDATE ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_candidates_updated_at" BEFORE UPDATE ON "public"."candidate_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_comments_updated_at" BEFORE UPDATE ON "public"."_backup_product_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_companies_updated_at" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_jobs_updated_at" BEFORE UPDATE ON "public"."jobs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."_backup_products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."access_logs"
    ADD CONSTRAINT "access_logs_regency_id_fkey" FOREIGN KEY ("regency_id") REFERENCES "public"."regencies"("regency_id");



ALTER TABLE ONLY "public"."access_logs"
    ADD CONSTRAINT "access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_profiles"
    ADD CONSTRAINT "candidate_profiles_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("province_id");



ALTER TABLE ONLY "public"."candidate_profiles"
    ADD CONSTRAINT "candidate_profiles_regency_id_fkey" FOREIGN KEY ("regency_id") REFERENCES "public"."regencies"("regency_id");



ALTER TABLE ONLY "public"."candidate_profiles"
    ADD CONSTRAINT "candidate_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("province_id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_regency_id_fkey" FOREIGN KEY ("regency_id") REFERENCES "public"."regencies"("regency_id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."education"
    ADD CONSTRAINT "education_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."_backup_favorites"
    ADD CONSTRAINT "favorites_product_slug_fkey" FOREIGN KEY ("product_slug") REFERENCES "public"."_backup_products"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."_backup_favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_views"
    ADD CONSTRAINT "job_views_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_views"
    ADD CONSTRAINT "job_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("province_id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_regency_id_fkey" FOREIGN KEY ("regency_id") REFERENCES "public"."regencies"("regency_id");



ALTER TABLE ONLY "public"."_backup_product_comments"
    ADD CONSTRAINT "product_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."_backup_product_comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."_backup_product_comments"
    ADD CONSTRAINT "product_comments_product_slug_fkey" FOREIGN KEY ("product_slug") REFERENCES "public"."_backup_products"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."_backup_product_comments"
    ADD CONSTRAINT "product_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."_backup_product_images"
    ADD CONSTRAINT "product_images_product_slug_fkey" FOREIGN KEY ("product_slug") REFERENCES "public"."_backup_products"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."_backup_products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id");



ALTER TABLE ONLY "public"."_backup_products"
    ADD CONSTRAINT "products_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("province_id");



ALTER TABLE ONLY "public"."_backup_products"
    ADD CONSTRAINT "products_regency_id_fkey" FOREIGN KEY ("regency_id") REFERENCES "public"."regencies"("regency_id");



ALTER TABLE ONLY "public"."_backup_products"
    ADD CONSTRAINT "products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_suspended_by_fkey" FOREIGN KEY ("suspended_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."regencies"
    ADD CONSTRAINT "regencies_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("province_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_product_slug_fkey" FOREIGN KEY ("reported_product_slug") REFERENCES "public"."_backup_products"("slug") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."saved_jobs"
    ADD CONSTRAINT "saved_jobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_jobs"
    ADD CONSTRAINT "saved_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."_backup_trash_products"
    ADD CONSTRAINT "trash_products_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."_backup_view_history"
    ADD CONSTRAINT "view_history_product_slug_fkey" FOREIGN KEY ("product_slug") REFERENCES "public"."_backup_products"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."_backup_view_history"
    ADD CONSTRAINT "view_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_experience"
    ADD CONSTRAINT "work_experience_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete users" ON "public"."profiles" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND (("profiles_1"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Admins can insert to trash" ON "public"."_backup_trash_products" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Admins can permanently delete trash" ON "public"."_backup_trash_products" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Admins can suspend users" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND (("profiles_1"."role")::"text" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND (("profiles_1"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Admins can view all reports" ON "public"."reports" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Admins can view trash" ON "public"."_backup_trash_products" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Anyone can insert job views" ON "public"."job_views" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view active advertisements" ON "public"."advertisements" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view comments" ON "public"."_backup_product_comments" FOR SELECT USING (true);



CREATE POLICY "Anyone can view images" ON "public"."_backup_product_images" FOR SELECT USING (true);



CREATE POLICY "Applications viewable by candidate or employer" ON "public"."applications" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."candidate_profiles"
  WHERE (("candidate_profiles"."id" = "applications"."candidate_id") AND ("candidate_profiles"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."jobs" "j"
     JOIN "public"."companies" "c" ON (("j"."company_id" = "c"."id")))
  WHERE (("j"."id" = "applications"."job_id") AND ("c"."user_id" = "auth"."uid"())))) OR "public"."is_admin"()));



CREATE POLICY "Authenticated users can insert comments" ON "public"."_backup_product_comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can insert products" ON "public"."_backup_products" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can insert reports" ON "public"."reports" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "reporter_id"));



CREATE POLICY "Authenticated users can view notification logs" ON "public"."notification_logs" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Candidates can insert applications" ON "public"."applications" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."candidate_profiles"
  WHERE (("candidate_profiles"."id" = "applications"."candidate_id") AND ("candidate_profiles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Candidates can update own applications" ON "public"."applications" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."candidate_profiles"
  WHERE (("candidate_profiles"."id" = "applications"."candidate_id") AND ("candidate_profiles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Candidates viewable if public or own" ON "public"."candidate_profiles" FOR SELECT USING ((("is_profile_public" = true) OR ("auth"."uid"() = "user_id") OR "public"."is_admin"()));



CREATE POLICY "Certifications viewable by owner or admins" ON "public"."certifications" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."candidate_profiles"
  WHERE (("candidate_profiles"."id" = "certifications"."candidate_id") AND ("candidate_profiles"."user_id" = "auth"."uid"())))) OR "public"."is_admin"()));



CREATE POLICY "Companies viewable by everyone" ON "public"."companies" FOR SELECT USING (true);



CREATE POLICY "Company owners can delete jobs" ON "public"."jobs" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "jobs"."company_id") AND ("companies"."user_id" = "auth"."uid"())))));



CREATE POLICY "Company owners can insert jobs" ON "public"."jobs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "jobs"."company_id") AND ("companies"."user_id" = "auth"."uid"())))));



CREATE POLICY "Company owners can update jobs" ON "public"."jobs" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "jobs"."company_id") AND ("companies"."user_id" = "auth"."uid"())))));



CREATE POLICY "Education viewable by owner or admins" ON "public"."education" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."candidate_profiles"
  WHERE (("candidate_profiles"."id" = "education"."candidate_id") AND ("candidate_profiles"."user_id" = "auth"."uid"())))) OR "public"."is_admin"()));



CREATE POLICY "Employers can update application status" ON "public"."applications" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."jobs" "j"
     JOIN "public"."companies" "c" ON (("j"."company_id" = "c"."id")))
  WHERE (("j"."id" = "applications"."job_id") AND ("c"."user_id" = "auth"."uid"())))));



CREATE POLICY "Jobs viewable by everyone" ON "public"."jobs" FOR SELECT USING ((("status" = 'active'::"public"."job_status") OR (EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "jobs"."company_id") AND ("companies"."user_id" = "auth"."uid"())))) OR "public"."is_admin"()));



CREATE POLICY "Only admins can delete advertisements" ON "public"."advertisements" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Only admins can insert advertisements" ON "public"."advertisements" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Only admins can update advertisements" ON "public"."advertisements" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Product images are viewable by everyone" ON "public"."_backup_product_images" FOR SELECT USING (true);



CREATE POLICY "Product owner can mark as seller reply" ON "public"."_backup_product_comments" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."_backup_products"
  WHERE (("_backup_products"."slug" = "_backup_product_comments"."product_slug") AND ("_backup_products"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."_backup_products"
  WHERE (("_backup_products"."slug" = "_backup_product_comments"."product_slug") AND ("_backup_products"."user_id" = "auth"."uid"())))));



CREATE POLICY "Product owners and admins can delete images" ON "public"."_backup_product_images" FOR DELETE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."_backup_products"
  WHERE (("_backup_products"."slug" = "_backup_product_images"."product_slug") AND ("_backup_products"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'admin'::"text"))))));



CREATE POLICY "Product owners and admins can insert images" ON "public"."_backup_product_images" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."_backup_products"
  WHERE (("_backup_products"."slug" = "_backup_product_images"."product_slug") AND ("_backup_products"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'admin'::"text"))))));



CREATE POLICY "Product owners and admins can update images" ON "public"."_backup_product_images" FOR UPDATE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."_backup_products"
  WHERE (("_backup_products"."slug" = "_backup_product_images"."product_slug") AND ("_backup_products"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'admin'::"text"))))));



CREATE POLICY "Products viewable by everyone, owners, or admins" ON "public"."_backup_products" FOR SELECT USING (((("status")::"text" = ANY (ARRAY[('active'::character varying)::"text", ('sold'::character varying)::"text"])) OR ("auth"."uid"() = "user_id") OR "public"."is_admin"()));



CREATE POLICY "Public Read Access for categories" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Public Read Access for companies" ON "public"."companies" FOR SELECT USING (true);



CREATE POLICY "Public Read Access for jobs" ON "public"."jobs" FOR SELECT USING (true);



CREATE POLICY "Public Read Access for provinces" ON "public"."provinces" FOR SELECT USING (true);



CREATE POLICY "Public Read Access for regencies" ON "public"."regencies" FOR SELECT USING (true);



CREATE POLICY "Users and admins can delete products" ON "public"."_backup_products" FOR DELETE USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'admin'::"text"))))));



CREATE POLICY "Users and admins can update products" ON "public"."_backup_products" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR "public"."is_admin"())) WITH CHECK ((("auth"."uid"() = "user_id") OR "public"."is_admin"()));



CREATE POLICY "Users can delete own comments" ON "public"."_backup_product_comments" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own favorites" ON "public"."_backup_favorites" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own history" ON "public"."_backup_view_history" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own saved jobs" ON "public"."saved_jobs" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own subscriptions" ON "public"."push_subscriptions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own comments" ON "public"."_backup_product_comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own favorites" ON "public"."_backup_favorites" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own history" ON "public"."_backup_view_history" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own jobs" ON "public"."jobs" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "companies"."user_id"
   FROM "public"."companies"
  WHERE ("companies"."id" = "jobs"."company_id"))));



CREATE POLICY "Users can insert jobs for own company" ON "public"."jobs" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "jobs"."company_id") AND ("companies"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert own candidate profile" ON "public"."candidate_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own company" ON "public"."companies" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own favorites" ON "public"."_backup_favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own history" ON "public"."_backup_view_history" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own subscriptions" ON "public"."push_subscriptions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own company" ON "public"."companies" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own favorites" ON "public"."_backup_favorites" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own history" ON "public"."_backup_view_history" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own jobs" ON "public"."jobs" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "companies"."user_id"
   FROM "public"."companies"
  WHERE ("companies"."id" = "jobs"."company_id"))));



CREATE POLICY "Users can manage own certifications" ON "public"."certifications" USING ((EXISTS ( SELECT 1
   FROM "public"."candidate_profiles"
  WHERE (("candidate_profiles"."id" = "certifications"."candidate_id") AND ("candidate_profiles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own education" ON "public"."education" USING ((EXISTS ( SELECT 1
   FROM "public"."candidate_profiles"
  WHERE (("candidate_profiles"."id" = "education"."candidate_id") AND ("candidate_profiles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own work experience" ON "public"."work_experience" USING ((EXISTS ( SELECT 1
   FROM "public"."candidate_profiles"
  WHERE (("candidate_profiles"."id" = "work_experience"."candidate_id") AND ("candidate_profiles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can save jobs" ON "public"."saved_jobs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update jobs for own company" ON "public"."jobs" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "jobs"."company_id") AND ("companies"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own candidate profile" ON "public"."candidate_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own comments" ON "public"."_backup_product_comments" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own company" ON "public"."companies" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own subscriptions" ON "public"."push_subscriptions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own comments" ON "public"."_backup_product_comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own company" ON "public"."companies" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own jobs" ON "public"."jobs" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "companies"."user_id"
   FROM "public"."companies"
  WHERE ("companies"."id" = "jobs"."company_id")))) WITH CHECK (("auth"."uid"() IN ( SELECT "companies"."user_id"
   FROM "public"."companies"
  WHERE ("companies"."id" = "jobs"."company_id"))));



CREATE POLICY "Users can view own favorites" ON "public"."_backup_favorites" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own history" ON "public"."_backup_view_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own job views" ON "public"."job_views" FOR SELECT USING ((("auth"."uid"() = "user_id") OR "public"."is_admin"()));



CREATE POLICY "Users can view own saved jobs" ON "public"."saved_jobs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own subscriptions" ON "public"."push_subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own favorites" ON "public"."_backup_favorites" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own history" ON "public"."_backup_view_history" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Work experience viewable by owner or admins" ON "public"."work_experience" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."candidate_profiles"
  WHERE (("candidate_profiles"."id" = "work_experience"."candidate_id") AND ("candidate_profiles"."user_id" = "auth"."uid"())))) OR "public"."is_admin"()));



ALTER TABLE "public"."_backup_favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."_backup_product_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."_backup_product_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."_backup_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."_backup_trash_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."_backup_view_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."access_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "access_logs_insert_policy" ON "public"."access_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "access_logs_select_policy" ON "public"."access_logs" FOR SELECT USING (true);



CREATE POLICY "access_logs_update_policy" ON "public"."access_logs" FOR UPDATE USING (true) WITH CHECK (true);



ALTER TABLE "public"."advertisements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."certifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."education" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_comments_delete_own_policy" ON "public"."_backup_product_comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "product_comments_insert_policy" ON "public"."_backup_product_comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "product_comments_select_policy" ON "public"."_backup_product_comments" FOR SELECT USING (true);



CREATE POLICY "product_comments_update_own_policy" ON "public"."_backup_product_comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "profiles_select_policy" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



ALTER TABLE "public"."provinces" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."regencies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reports_admin_all_policy" ON "public"."reports" TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "reports_insert_policy" ON "public"."reports" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "reporter_id"));



CREATE POLICY "reports_select_own_policy" ON "public"."reports" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "reporter_id"));



ALTER TABLE "public"."saved_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_experience" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_old_inactive_products"() TO "anon";
GRANT ALL ON FUNCTION "public"."archive_old_inactive_products"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_old_inactive_products"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_access_logs"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_access_logs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_access_logs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_view_history"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_view_history"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_view_history"() TO "service_role";



GRANT ALL ON FUNCTION "public"."find_nearest_regency"("lat" numeric, "lng" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."find_nearest_regency"("lat" numeric, "lng" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_nearest_regency"("lat" numeric, "lng" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_admins"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_admins"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_admins"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_users_with_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_users_with_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_users_with_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_comment_replies"("comment_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_comment_replies"("comment_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_comment_replies"("comment_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_product_comment_stats"("product_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_comment_stats"("product_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_comment_stats"("product_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_product_comments_with_replies"("product_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_comments_with_replies"("product_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_comments_with_replies"("product_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_product_stats"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_product_stats"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_product_stats"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."jobs_search_vector_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."jobs_search_vector_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."jobs_search_vector_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."move_user_products_to_trash"("target_user_id" "uuid", "admin_user_id" "uuid", "reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."move_user_products_to_trash"("target_user_id" "uuid", "admin_user_id" "uuid", "reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."move_user_products_to_trash"("target_user_id" "uuid", "admin_user_id" "uuid", "reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."nearby_jobs"("user_lat" numeric, "user_lng" numeric, "max_distance_km" integer, "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."nearby_jobs"("user_lat" numeric, "user_lng" numeric, "max_distance_km" integer, "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."nearby_jobs"("user_lat" numeric, "user_lng" numeric, "max_distance_km" integer, "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."nearby_products"("user_lat" numeric, "user_lng" numeric, "max_distance_km" integer, "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."nearby_products"("user_lat" numeric, "user_lng" numeric, "max_distance_km" integer, "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."nearby_products"("user_lat" numeric, "user_lng" numeric, "max_distance_km" integer, "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."products_by_regency"("user_regency_id" integer, "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."products_by_regency"("user_regency_id" integer, "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."products_by_regency"("user_regency_id" integer, "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."products_search_vector_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."products_search_vector_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."products_search_vector_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."renew_product"("product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."renew_product"("product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."renew_product"("product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."restore_product_from_trash"("trash_id" "uuid", "admin_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."restore_product_from_trash"("trash_id" "uuid", "admin_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."restore_product_from_trash"("trash_id" "uuid", "admin_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_jobs"("search_query" "text", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_jobs"("search_query" "text", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_jobs"("search_query" "text", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."search_products"("search_query" "text", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_products"("search_query" "text", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_products"("search_query" "text", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_access_log_regency"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_access_log_regency"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_access_log_regency"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_job_expiry"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_job_expiry"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_job_expiry"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_product_expiry"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_product_expiry"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_product_expiry"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_product_location_from_regency"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_product_location_from_regency"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_product_location_from_regency"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_advertisement_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_advertisement_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_advertisement_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_comments_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_comments_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_comments_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_reports_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_reports_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_reports_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_view_history"("p_user_id" "uuid", "p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_view_history"("p_user_id" "uuid", "p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_view_history"("p_user_id" "uuid", "p_product_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."_backup_favorites" TO "anon";
GRANT ALL ON TABLE "public"."_backup_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."_backup_favorites" TO "service_role";



GRANT ALL ON TABLE "public"."_backup_product_comments" TO "anon";
GRANT ALL ON TABLE "public"."_backup_product_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."_backup_product_comments" TO "service_role";



GRANT ALL ON TABLE "public"."_backup_product_images" TO "anon";
GRANT ALL ON TABLE "public"."_backup_product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."_backup_product_images" TO "service_role";



GRANT ALL ON TABLE "public"."_backup_products" TO "anon";
GRANT ALL ON TABLE "public"."_backup_products" TO "authenticated";
GRANT ALL ON TABLE "public"."_backup_products" TO "service_role";



GRANT ALL ON TABLE "public"."_backup_trash_products" TO "anon";
GRANT ALL ON TABLE "public"."_backup_trash_products" TO "authenticated";
GRANT ALL ON TABLE "public"."_backup_trash_products" TO "service_role";



GRANT ALL ON TABLE "public"."_backup_view_history" TO "anon";
GRANT ALL ON TABLE "public"."_backup_view_history" TO "authenticated";
GRANT ALL ON TABLE "public"."_backup_view_history" TO "service_role";



GRANT ALL ON TABLE "public"."access_logs" TO "anon";
GRANT ALL ON TABLE "public"."access_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."access_logs" TO "service_role";
GRANT INSERT ON TABLE "public"."access_logs" TO PUBLIC;



GRANT ALL ON TABLE "public"."advertisements" TO "anon";
GRANT ALL ON TABLE "public"."advertisements" TO "authenticated";
GRANT ALL ON TABLE "public"."advertisements" TO "service_role";



GRANT ALL ON TABLE "public"."applications" TO "anon";
GRANT ALL ON TABLE "public"."applications" TO "authenticated";
GRANT ALL ON TABLE "public"."applications" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_profiles" TO "anon";
GRANT ALL ON TABLE "public"."candidate_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categories_category_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_category_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_category_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."certifications" TO "anon";
GRANT ALL ON TABLE "public"."certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."certifications" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."education" TO "anon";
GRANT ALL ON TABLE "public"."education" TO "authenticated";
GRANT ALL ON TABLE "public"."education" TO "service_role";



GRANT ALL ON TABLE "public"."job_views" TO "anon";
GRANT ALL ON TABLE "public"."job_views" TO "authenticated";
GRANT ALL ON TABLE "public"."job_views" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."notification_logs" TO "anon";
GRANT ALL ON TABLE "public"."notification_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_logs" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."provinces" TO "anon";
GRANT ALL ON TABLE "public"."provinces" TO "authenticated";
GRANT ALL ON TABLE "public"."provinces" TO "service_role";



GRANT ALL ON SEQUENCE "public"."provinces_province_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."provinces_province_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."provinces_province_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."push_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."regencies" TO "anon";
GRANT ALL ON TABLE "public"."regencies" TO "authenticated";
GRANT ALL ON TABLE "public"."regencies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."regencies_regency_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."regencies_regency_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."regencies_regency_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."saved_jobs" TO "anon";
GRANT ALL ON TABLE "public"."saved_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."work_experience" TO "anon";
GRANT ALL ON TABLE "public"."work_experience" TO "authenticated";
GRANT ALL ON TABLE "public"."work_experience" TO "service_role";



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

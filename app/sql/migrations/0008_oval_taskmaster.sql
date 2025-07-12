CREATE TABLE "locations" (
	"location_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "locations_location_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" "location" NOT NULL,
	"display_name" text NOT NULL,
	"population" integer,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL
);

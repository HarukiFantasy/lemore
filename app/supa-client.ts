import { createClient } from "@supabase/supabase-js";
import { Database as SupabaseDatabase } from "../database.types";
import { MergeDeep, SetNonNullable } from "type-fest";

type Database = MergeDeep<SupabaseDatabase, {
  public: {
    Views: {
      local_tips_list_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["local_tips_list_view"]["Row"]>
      }
    }
  }
}>;

const client = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default client;

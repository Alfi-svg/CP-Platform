import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sbltdmzbqdijyywulndb.supabase.co";
const supabaseKey = "sb_publishable_Ealy7NL1e3zJ-g6zQfB1OA_Wj1UtvT2";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

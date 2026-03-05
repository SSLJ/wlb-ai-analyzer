import { createClient} from "@supabase/supabase-js";

const supabaseUrl = "https://huajlzakvjhqvuampggr.supabase.co"
const supabaseKey = "sb_publishable_2ec1olfI7VlpxwPoQPORVA_lUedGGst"

export const supabase = createClient(supabaseUrl, supabaseKey);
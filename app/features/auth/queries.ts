import { makeSSRClient } from "~/supa-client";

export const checkUsernameExists = async (
  request: Request,
  { username }: { username: string }
) => {
  const { client } = makeSSRClient(request);
  const { data, error } = await client
    .from("user_profiles")
    .select("profile_id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    // Log the error for debugging, but treat it as non-existent for safety
    console.error("Error checking username:", error);
    return false;
  }
  
  // Return true only if data is not null (i.e., username exists)
  return data !== null;
};
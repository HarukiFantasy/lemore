import supaClient from "~/supa-client";

export const getProductsListings = async () => {
  const { data, error } = await supaClient.from("products_listings_view").select("*");
  if (error) throw new Error(error.message);
  return data;
};
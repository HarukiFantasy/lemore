import client from "~/supa-client";

export const getProductsListings = async () => {
  const { data, error } = await client.from("products_listings_view").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const getProductById = async (productId: number) => {
  const { data, error } = await client.from("product_detail_view").select("*").eq("product_id", productId).single();
  if (error) throw new Error(error.message);
  return data;
};
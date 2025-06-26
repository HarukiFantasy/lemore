import { Form, Link, useSearchParams } from "react-router";
import { Input } from "../components/ui/input";
import type { Route } from "../../+types/root";
import { Button } from '../components/ui/button';
import { ProductCard } from "../../features/products/components/product-card";
import { CommunityPostCard } from "../../features/community/components/community-post-card";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Home | Lemore" },
    { name: "description", content: "Welcome to Lemore" },
  ];
};

export const loader = () => {
  return {};
}

export default function HomePage({loaderData}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location") || "ChiangMai";

  return (
    <div className="sm:max-w-[100vw] md:max-w-[100vw]">
      <div className="flex flex-col px-8 py-15 items-center justify-center rounded-md bg-gradient-to-t from-background to-primary/10">
        <h1 className="text-4xl font-bold text-center">Buy Less, Share More, Live Lighter - in {location}</h1>
      </div>
      <Form className="flex items-center justify-center max-w-screen-sm mx-auto mt-1 gap-2">
        <Input name="query" type="text" placeholder="Search for items" />
        <Button type="submit" variant="outline">Search</Button>
      </Form>
      <div className="text-2xl font-bold mt-10 w-full lg:max-w-[70vw] mx-auto sm:max-w-[100vw] md:max-w-[100vw]">Today's Picks</div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 items-center w-full lg:max-w-[70vw] mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductCard
            key={index}
            productId={`productId-${index}`}
            image="/sample.png"
            title="Bicycle for sale"
            price="THB 1000"
          />
        ))}
      </div>
      <div className="text-2xl font-bold mt-10 w-full lg:max-w-[70vw] mx-auto sm:max-w-[100vw] md:max-w-[100vw]">Community</div>
      <div className="bg-white rounded-2xl shadow-sm border mt-2 overflow-hidden w-full lg:max-w-[70vw] mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
        {Array.from({ length: 4 }).map((_, index) => (
          <CommunityPostCard
            key={index}
            title="Where to donate clothes?"
            timeAgo="2 hours ago"
          />
        ))}
      </div>
    </div>
  );
}
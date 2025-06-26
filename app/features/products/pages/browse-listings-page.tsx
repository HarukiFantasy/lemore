import React, { useState } from "react";
import type { Route } from './+types/browse-listings-page';
import { RadioGroup, RadioGroupItem } from "~/common/components/ui/radio-group";
import { ProductCard } from '../components/product-card';
import { Form } from 'react-router';
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';

const categories = [
  { name: "Electronics", icon: "💻" },
  { name: "Furniture", icon: "🛋️" },
  { name: "Baby & Kids", icon: "🧸" },
  { name: "Books", icon: "📚" },
  { name: "Fashion", icon: "👗" },
  { name: "Accessories", icon: "👜" },
  { name: "Cosmetics", icon: "💄" },
  { name: "Hobbies", icon: "🎮" },
];

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Browse Listings | Lemore" },
    { name: "description", content: "Browse listings on Lemore" },
  ];
};

export default function BrowseListingsPage() {
  const [search, setSearch] = useState("bicycle");

  return (
    <div className="flex flex-col md:flex-row">

      {/* 메인 컨텐츠 */}
      <main className="flex-1 p-8">
        {/* 검색바 */}
          <Form className="flex items-center justify-center max-w-screen-sm mx-auto mt-1 gap-2 mb-6 focus:ring-1 focus:ring-accent">
            <Input name="query" type="text" placeholder="Search for items" />
            <Button type="submit" variant="outline">Search</Button>
          </Form>

        {/* 카테고리 */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5 xl:space-x-6">
            {categories.map((cat, index) => (
              <div 
                key={cat.name} 
                className={`
                  flex flex-col items-center min-w-[65px] 
                  ${index >= 4 ? 'hidden md:flex' : ''}
                  ${index >= 5 ? 'hidden md:flex' : ''}
                  ${index >= 5 ? 'hidden lg:flex' : ''}
                  ${index >= 6 ? 'hidden lg:flex' : ''}
                  ${index >= 7 ? 'hidden lg:flex' : ''}
                `}
              >
                <div className="w-15 h-15 flex items-center justify-center rounded-full bg-purple-100 text-2xl mb-2">
                  {cat.icon}
                </div>
                <span className="text-sm sm:text-sm md:text-sm lg:text-sm xl:text-sm text-center">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 검색 결과 타이틀 */}
        <h2 className="text-3xl font-bold mb-6">
          &quot;{search}&quot; Search Results
        </h2>

        {/* 상품 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <ProductCard
              key={index}
              productId={`${index}`}
              image="/sample.png"
              title="Bicycle for sale"
              price="THB 1000"
            />
          ))}
        </div>
      </main>
    </div>
  );
} 
import { Link } from "react-router";

interface ProductCardProps {
  productId: string;
  image: string;
  title: string;
  price: string;
  seller?: string;
  likes?: number;
  views?: number;
}

export function ProductCard({ productId, image, title, price, seller = "Multiple Owners", likes = 0, views = 0 }: ProductCardProps) {
  return (
    <Link to={`/secondhand/product/${productId}`}>
      <div className="relative w-full h-40 sm:h-48 md:h-60 overflow-hidden bg-white rounded-lg shadow group">
        <img src={image} className="object-cover w-full h-full rounded-t-lg" alt={title} />
        <button className="absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Save</button>
      </div>
      <div className="flex flex-col gap-1 p-3 pb-2">
        <span className="text-base font-semibold truncate">{title}</span>
        <span className="text-xs text-neutral-500 truncate">{seller}</span>
        <span className="text-sm font-semibold text-purple-700 mt-1">{price}</span>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-neutral-500 text-xs">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M16.697 4.747c-1.962 0-3.19 1.28-3.697 2.01-.507-.73-1.735-2.01-3.697-2.01C6.01 4.747 4 6.757 4 9.354c0 3.61 6.31 8.36 6.58 8.56.26.19.62.19.88 0 .27-.2 6.58-4.95 6.58-8.56 0-2.597-2.01-4.607-4.343-4.607Z"/></svg>
            <span>{likes}</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-500 text-xs">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 5c-7 0-7 7 0 7s7-7 0-7Zm0 2c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3Zm0 10c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4Zm-6 4c.001-.001.003-.003.005-.004C6.14 18.67 8.94 18 12 18c3.06 0 5.86.67 5.995.996.002.001.004.003.005.004H6Z"/></svg>
            <span>{views}</span>
          </div>
        </div>
      </div>
    </Link>
  );
} 
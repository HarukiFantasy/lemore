import { Link } from "react-router";

interface ProductCardProps {
  productId: string;
  image: string;
  title: string;
  price: string;
}

export function ProductCard({ productId, image, title, price }: ProductCardProps) {
  return (
    <Link to={`/products/${productId}`}>
      <div className="relative w-full h-40 sm:h-48 md:h-60 overflow-hidden p-2 gap-1 bg-white rounded-lg shadow">
        <img src={image} className="object-cover w-full h-full rounded-md" alt={title} />
      </div>
      <div className="flex flex-col gap-1 p-2">
        <span className="text-lg font-semibold">{title}</span>
        <span className="text-sm font-semibold text-neutral-500">{price}</span>
      </div>
    </Link>
  );
} 
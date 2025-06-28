type ProductCardProps = {
  imageUrl: string;
  title: string;
  price: string;
  vendor: string;
  targetPrice?: string;
  expiresIn?: string;
};

export default function ProductCard({
  imageUrl,
  title,
  price,
  vendor,
  targetPrice,
  expiresIn,
}: ProductCardProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 w-full max-w-xs">
      <img src={imageUrl} alt={title} className="h-32 w-full object-contain mb-2" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-600">{vendor}</p>
      <p className="text-xl font-bold">${price}</p>
      {targetPrice && <p className="text-sm text-gray-500">Target Price: ${targetPrice}</p>}
      {expiresIn && <p className="text-xs text-gray-400">Tracker ends in {expiresIn}</p>}
    </div>
  );
}
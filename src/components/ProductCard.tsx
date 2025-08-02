type ProductCardProps = {
  imageUrl: string;
  title: string;
  price: string;
  vendor: string;
  targetPrice?: string;
  expiresIn?: string;
  status?: 'tracking' | 'paused' | 'completed';
  url?: string;
  extractedAt?: string;
};

export default function ProductCard({
  imageUrl,
  title,
  price,
  vendor,
  targetPrice,
  expiresIn,
  status = 'tracking',
  url,
  extractedAt,
}: ProductCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'tracking':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 w-full max-w-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        {extractedAt && (
          <span className="text-xs text-gray-500">
            {formatDate(extractedAt)}
          </span>
        )}
      </div>
      
      <img src={imageUrl} alt={title} className="h-32 w-full object-contain mb-3" />
      
      <h3 className="text-lg font-semibold mb-1 line-clamp-2">{title}</h3>
      
      <p className="text-gray-600 text-sm mb-2">{vendor}</p>
      
      <div className="flex items-center justify-between mb-2">
        <p className="text-xl font-bold text-green-600">${price}</p>
        {targetPrice && (
          <p className="text-sm text-gray-500">
            Target: ${targetPrice}
          </p>
        )}
      </div>
      
      {expiresIn && (
        <p className="text-xs text-gray-400 mb-2">
          Tracker ends in {expiresIn}
        </p>
      )}
      
      {url && (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 underline block truncate"
        >
          View Original
        </a>
      )}
    </div>
  );
}
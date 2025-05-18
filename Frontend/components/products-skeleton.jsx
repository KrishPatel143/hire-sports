export default function ProductsSkeleton() {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-8 w-full bg-gray-200 dark:bg-gray-800 rounded mt-4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  
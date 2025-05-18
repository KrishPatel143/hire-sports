export default function ProductSkeleton() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
  
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
  
          <div className="h-8 w-1/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
  
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
  
          <div className="space-y-2">
            <div className="h-5 w-1/6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
  
          <div className="space-y-2">
            <div className="h-5 w-1/6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
  
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    )
  }
  
  
// Articles listing skeleton
export default function ArticlesLoading() {
  return (
    <div className="bg-[#F5EFE6] min-h-screen animate-pulse">

      {/* Page header */}
      <div className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
          <div className="h-8 w-40 bg-[#E6DFD5] rounded" />
          <div className="h-3.5 w-56 bg-[#EDE8E1] rounded mt-3" />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

        {/* Featured article skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="aspect-[16/9] bg-[#DDD8D0] rounded" />
          <div className="flex flex-col justify-center gap-4">
            <div className="h-3 w-20 bg-[#C6A66B]/40 rounded" />
            <div className="h-8 w-3/4 bg-[#DDD8D0] rounded" />
            <div className="h-8 w-1/2 bg-[#DDD8D0] rounded" />
            <div className="h-4 w-full bg-[#EDE8E1] rounded" />
            <div className="h-4 w-5/6 bg-[#EDE8E1] rounded" />
            <div className="h-4 w-2/3 bg-[#EDE8E1] rounded" />
            <div className="h-10 w-32 bg-[#203A2B]/20 rounded mt-2" />
          </div>
        </div>

        {/* Article grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#FFFCF7] border border-[#E6DFD5] overflow-hidden rounded">
              <div className="aspect-[16/9] bg-[#EDE8E1]" />
              <div className="p-5 flex flex-col gap-3">
                <div className="h-3 w-20 bg-[#E6DFD5] rounded" />
                <div className="h-5 w-full bg-[#DDD8D0] rounded" />
                <div className="h-5 w-3/4 bg-[#DDD8D0] rounded" />
                <div className="h-3.5 w-full bg-[#EDE8E1] rounded" />
                <div className="h-3.5 w-5/6 bg-[#EDE8E1] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

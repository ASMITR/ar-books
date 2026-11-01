// Homepage skeleton — shown while the RSC fetches Firebase data
export default function HomeLoading() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen animate-pulse">

      {/* Hero skeleton */}
      <div className="bg-[#1C3325] min-h-[520px] flex items-center">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-5">
              <div className="h-3 w-24 bg-white/20 rounded" />
              <div className="h-12 w-3/4 bg-white/20 rounded" />
              <div className="h-12 w-1/2 bg-white/20 rounded" />
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-5/6 bg-white/10 rounded" />
              <div className="flex gap-3 mt-2">
                <div className="h-12 w-32 bg-[#C6A66B]/30 rounded" />
                <div className="h-12 w-32 bg-white/10 rounded" />
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="w-56 h-80 bg-white/10 rounded shadow-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Benefits bar skeleton */}
      <div className="bg-[#FFFCF7] border-y border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5 border-r border-[#E6DFD5] last:border-r-0">
                <div className="w-10 h-10 rounded-full bg-[#E6DFD5]" />
                <div className="flex flex-col gap-2">
                  <div className="h-3 w-24 bg-[#E6DFD5] rounded" />
                  <div className="h-2.5 w-20 bg-[#EDE8E1] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Book carousel skeleton */}
      <div className="bg-[#F5EFE6] py-14 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div className="flex flex-col gap-3">
              <div className="h-2.5 w-20 bg-[#C6A66B]/40 rounded" />
              <div className="h-10 w-56 bg-[#DDD8D0] rounded" />
            </div>
            <div className="h-10 w-32 bg-[#DDD8D0] rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookCardSkeleton() {
  return (
    <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
      <div className="h-[200px] bg-[#EDE8E1]" />
      <div className="p-3.5 flex flex-col gap-2">
        <div className="h-3.5 w-3/4 bg-[#E6DFD5] rounded" />
        <div className="h-3 w-1/2 bg-[#EDE8E1] rounded" />
        <div className="h-px w-full bg-[#E6DFD5] my-1" />
        <div className="flex justify-between">
          <div className="h-4 w-14 bg-[#DDD8D0] rounded" />
        </div>
        <div className="h-8 w-full bg-[#E6DFD5] rounded-sm" />
      </div>
    </div>
  );
}

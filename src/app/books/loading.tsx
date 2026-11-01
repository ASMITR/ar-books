// Books listing skeleton
export default function BooksLoading() {
  return (
    <div className="bg-[#F5EFE6] min-h-screen animate-pulse">

      {/* Page header */}
      <div className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-10 w-48 bg-[#E6DFD5] rounded" />
          <div className="h-4 w-64 bg-[#EDE8E1] rounded mt-3" />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter bar skeleton */}
        <div className="flex gap-3 mb-8">
          <div className="h-10 flex-1 max-w-xs bg-[#EDE8E1] rounded-sm" />
          <div className="h-10 w-36 bg-[#EDE8E1] rounded-sm" />
          <div className="h-10 w-36 bg-[#EDE8E1] rounded-sm" />
        </div>

        {/* Book grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
              <div className="h-[200px] sm:h-[230px] bg-[#EDE8E1]" />
              <div className="p-3.5 flex flex-col gap-2">
                <div className="h-3.5 w-3/4 bg-[#E6DFD5] rounded" />
                <div className="h-3 w-1/2 bg-[#EDE8E1] rounded" />
                <div className="h-px w-full bg-[#E6DFD5] my-1" />
                <div className="flex justify-between items-center">
                  <div className="h-4 w-14 bg-[#DDD8D0] rounded" />
                </div>
                <div className="h-8 w-full bg-[#E6DFD5] rounded-sm mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoriesLoading() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen animate-pulse">
      <div className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="h-2.5 w-20 bg-[#C6A66B]/30 rounded mb-3" />
          <div className="h-12 w-52 bg-[#DDD8D0] rounded" />
          <div className="h-3.5 w-80 bg-[#EDE8E1] rounded mt-3" />
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#FFFCF7] border border-[#E6DFD5] p-6 flex flex-col gap-3">
              <div className="w-10 h-10 bg-[#E6DFD5] rounded" />
              <div className="h-5 w-3/4 bg-[#DDD8D0] rounded" />
              <div className="h-3.5 w-full bg-[#EDE8E1] rounded" />
              <div className="h-3.5 w-4/5 bg-[#EDE8E1] rounded" />
              <div className="h-px w-full bg-[#E6DFD5] mt-2" />
              <div className="flex justify-between">
                <div className="h-3 w-14 bg-[#EDE8E1] rounded" />
                <div className="h-3 w-16 bg-[#DDD8D0] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

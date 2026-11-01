// Article detail skeleton
export default function ArticleLoading() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen animate-pulse">

      {/* Top progress bar placeholder */}
      <div className="fixed top-0 left-0 w-1/3 h-[3px] bg-[#C6A66B]/40 z-50" />

      {/* Header */}
      <div className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex gap-2 mb-5">
            <div className="h-5 w-16 bg-[#E6DFD5] rounded-full" />
          </div>
          <div className="h-10 w-full bg-[#DDD8D0] rounded mb-3" />
          <div className="h-10 w-3/4 bg-[#DDD8D0] rounded mb-6" />
          <div className="flex gap-4">
            <div className="h-3.5 w-28 bg-[#EDE8E1] rounded" />
            <div className="h-3.5 w-20 bg-[#EDE8E1] rounded" />
            <div className="h-3.5 w-24 bg-[#EDE8E1] rounded" />
          </div>
        </div>
      </div>

      {/* Cover image */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="w-full aspect-[16/9] bg-[#DDD8D0] rounded" />
      </div>

      {/* Body text */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`h-4 bg-[#EDE8E1] rounded ${i % 5 === 4 ? "w-2/3" : "w-full"}`} />
        ))}
        <div className="h-8" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i + 10} className={`h-4 bg-[#EDE8E1] rounded ${i % 4 === 3 ? "w-3/4" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}

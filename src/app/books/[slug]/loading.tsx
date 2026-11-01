// Book detail skeleton
export default function BookDetailLoading() {
  return (
    <div className="bg-[#F5EFE6] min-h-screen animate-pulse">

      {/* Breadcrumb */}
      <div className="bg-[#FFFCF7] border-b border-[#E6DFD5] px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-[1440px] mx-auto flex gap-2 items-center">
          <div className="h-3 w-10 bg-[#E6DFD5] rounded" />
          <div className="h-3 w-3 bg-[#E6DFD5] rounded" />
          <div className="h-3 w-20 bg-[#E6DFD5] rounded" />
          <div className="h-3 w-3 bg-[#E6DFD5] rounded" />
          <div className="h-3 w-32 bg-[#DDD8D0] rounded" />
        </div>
      </div>

      {/* Hero / main content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] gap-10 lg:gap-16">

          {/* Left: cover + CTA */}
          <div className="flex flex-col gap-6">
            <div className="w-full aspect-[2/3] max-w-[280px] mx-auto lg:mx-0 bg-[#DDD8D0] rounded shadow-xl" />
            <div className="flex flex-col gap-3">
              <div className="h-5 w-24 bg-[#DDD8D0] rounded" />
              <div className="h-12 w-full bg-[#203A2B]/20 rounded" />
              <div className="h-12 w-full bg-[#E6DFD5] rounded" />
            </div>
          </div>

          {/* Right: details */}
          <div className="flex flex-col gap-6">
            {/* Category tags */}
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-[#E6DFD5] rounded-full" />
              <div className="h-6 w-24 bg-[#E6DFD5] rounded-full" />
            </div>
            {/* Title */}
            <div className="flex flex-col gap-3">
              <div className="h-10 w-3/4 bg-[#DDD8D0] rounded" />
              <div className="h-6 w-1/2 bg-[#E6DFD5] rounded" />
            </div>
            {/* Price */}
            <div className="flex items-baseline gap-3">
              <div className="h-8 w-20 bg-[#DDD8D0] rounded" />
              <div className="h-5 w-16 bg-[#E6DFD5] rounded" />
            </div>
            {/* Description lines */}
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`h-3.5 bg-[#EDE8E1] rounded ${i === 3 ? "w-2/3" : "w-full"}`} />
              ))}
            </div>
            {/* Meta chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-[#FFFCF7] border border-[#E6DFD5] rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

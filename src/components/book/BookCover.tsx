import Image from "next/image";
import { cn } from "@/lib/utils";

interface BookCoverProps {
  src?: string;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  perspective?: boolean;
  className?: string;
}

const sizes = {
  sm: { w: 80, h: 112 },
  md: { w: 120, h: 168 },
  lg: { w: 180, h: 252 },
  xl: { w: 240, h: 336 },
};

export function BookCover({ src, title, size = "md", perspective = false, className }: BookCoverProps) {
  const { w, h } = sizes[size];

  return (
    <div
      className={cn("relative shrink-0 rounded-sm overflow-hidden shadow-lg", className)}
      style={{
        width: w,
        height: h,
        ...(perspective && {
          transform: "perspective(800px) rotateY(-8deg)",
          boxShadow: "6px 6px 20px rgba(0,0,0,0.25)",
        }),
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover"
          sizes={`${w}px`}
        />
      ) : (
        <div
          className="w-full h-full flex items-end p-3"
          style={{ backgroundColor: "#789185" }}
        >
          <span className="font-heading text-white text-sm font-bold leading-tight line-clamp-3">
            {title}
          </span>
        </div>
      )}
      {/* Spine highlight */}
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: "linear-gradient(to right, rgba(255,255,255,0.3), transparent)" }}
      />
    </div>
  );
}

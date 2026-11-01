import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[2px] bg-paper-gray", className)}
      {...props}
    />
  )
}

export { Skeleton }
export default Skeleton;

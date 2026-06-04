"use client";

import { Heart } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toggleWishlist } from "@/app/actions/wishlist";

interface WishlistButtonProps {
  dressId: string;
  isWishlisted: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Heart toggle. Optimistically flips the icon state, then calls the server
 * action. If the user is logged out, redirects to /sign-in.
 */
export function WishlistButton({
  dressId,
  isWishlisted,
  size = "sm",
  className,
}: WishlistButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const res = await toggleWishlist(formData);
          if (res.requiresAuth) {
            router.push(
              `/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
            );
          }
        });
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <input type="hidden" name="dress_id" value={dressId} />
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-cream/90 backdrop-blur transition-all hover:bg-cream",
          dim,
          isPending && "opacity-60",
          className,
        )}
        aria-label={isWishlisted ? "Hapus dari wishlist" : "Simpan ke wishlist"}
        aria-pressed={isWishlisted}
      >
        <Heart
          className={cn(
            icon,
            isWishlisted ? "fill-rose-gold text-rose-gold" : "text-charcoal/60",
          )}
        />
      </button>
    </form>
  );
}

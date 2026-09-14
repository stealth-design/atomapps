import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Long-lived caching for the scene art in `public/images/`.
   *
   * Vercel serves everything under `public/` as `max-age=0, must-revalidate`,
   * and the image optimizer takes the larger of that and `minimumCacheTTL` —
   * so the optimized derivatives were revalidating over the network on every
   * use. Measured against production: a warm edge HIT still cost ~0.3-0.5s,
   * and the first (cold) encode of a scene took 3.7s. Whenever the browser
   * dropped a decoded scene and needed it back, that round trip is a white
   * panel. Locally the same files come off disk instantly, which is why the
   * flicker never showed up in dev.
   *
   * IMPORTANT: `immutable` means a file replaced under the SAME name will not
   * be picked up by anyone who has it cached. Change the filename when the art
   * changes — which is already the convention here (image-N.jpg -> .webp).
   */
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

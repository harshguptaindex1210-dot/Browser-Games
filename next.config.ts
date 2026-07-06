import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com; frame-src 'self' https://pagead2.googlesyndication.com https://html5.gamedistribution.com; connect-src 'self' *.partykit.io",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

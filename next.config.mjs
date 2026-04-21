/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.x.ai; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'" },
      ],
    }];
  },
};

export default nextConfig;

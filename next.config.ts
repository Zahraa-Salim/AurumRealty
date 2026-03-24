import type { NextConfig } from 'next'

type RemotePattern = NonNullable<NonNullable<NextConfig['images']>['remotePatterns']>[number]

function buildRemotePatternFromUrl(urlString: string): RemotePattern | null {
  try {
    const url = new URL(urlString)
    const pathname = url.pathname && url.pathname !== '/' ? `${url.pathname.replace(/\/?$/, '/') }**` : '/**'

    return {
      protocol: url.protocol === 'http:' ? 'http' : 'https',
      hostname: url.hostname,
      port: url.port,
      pathname,
    }
  } catch {
    return null
  }
}

const s3RemotePattern = process.env.S3_PUBLIC_URL
  ? buildRemotePatternFromUrl(process.env.S3_PUBLIC_URL)
  : null

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      ...(s3RemotePattern ? [s3RemotePattern] : []),
    ],
  },
}

export default nextConfig

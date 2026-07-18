import McpPrompt from '@/sections/McpPrompt/McpPrompt'
import { OG_IMAGE } from '@/lib/site'

const DESCRIPTION =
  'The whole AI Marketing Kombat site as one copyable prompt — paste it into your AI agent and ask it anything.'

export const metadata = {
  title: 'MCP',
  description: DESCRIPTION,
  alternates: { canonical: '/mcp' },
  // per-route OpenGraph/Twitter (2026-07-18 audit — was inheriting home's)
  openGraph: {
    type: 'website',
    url: '/mcp',
    siteName: 'AI Marketing Kombat',
    title: 'AI Marketing Kombat — MCP prompt',
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Marketing Kombat — MCP prompt',
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
  },
}

// this page is white — override the root's dark browser-chrome color
// (meta theme-color can't read CSS vars — the raw hex mirrors --k-white)
export const viewport = { themeColor: '#ffffff' }

/**
 * /mcp — the agent mode (Figma Frame 29, node 90:3): a single full-height
 * screen with the centered orange prompt card. The entire site content is
 * one copyable prompt for people who'd rather ask their AI than read.
 */
export default function McpPage() {
  return <McpPrompt />
}

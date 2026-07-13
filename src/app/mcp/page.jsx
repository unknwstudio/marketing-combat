import McpPrompt from '@/sections/McpPrompt/McpPrompt'

export const metadata = {
  title: 'MCP',
  description:
    'The whole AI Marketing Kombat site as one copyable prompt — paste it into your AI agent and ask it anything.',
  alternates: { canonical: '/mcp' },
}

// this page is white — override the root's dark browser-chrome color
export const viewport = { themeColor: '#ffffff' }

/**
 * /mcp — the agent mode (Figma Frame 29, node 90:3): a single full-height
 * screen with the centered orange prompt card. The entire site content is
 * one copyable prompt for people who'd rather ask their AI than read.
 */
export default function McpPage() {
  return <McpPrompt />
}

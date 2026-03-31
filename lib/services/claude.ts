// ============================================================
// Claude API wrapper
// All Claude calls in this app go through this file.
// Never import @anthropic-ai/sdk directly in features.
// Model: claude-sonnet-4-20250514 — do not change without updating CLAUDE.md
// ============================================================

import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-sonnet-4-20250514'
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

// Single-turn call — system prompt + one user message → one response string
// Use for ICP generation, email writing, lead summaries
export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: options?.maxTokens ?? 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Claude returned unexpected content type')
  return block.text
}

// Multi-turn call — for conversational flows (future use)
export async function callClaudeWithHistory(
  systemPrompt: string,
  messages: ClaudeMessage[],
  options?: { maxTokens?: number }
): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: options?.maxTokens ?? 2048,
    system: systemPrompt,
    messages,
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Claude returned unexpected content type')
  return block.text
}

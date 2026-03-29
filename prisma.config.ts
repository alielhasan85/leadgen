import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

// Load .env for local CLI use (no-op on Vercel where env vars are injected)
config({ path: '.env' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  // DATABASE_URL_UNPOOLED is used by migrate commands only, not prisma generate
  ...(process.env.DATABASE_URL_UNPOOLED && {
    datasource: { url: process.env.DATABASE_URL_UNPOOLED },
  }),
})

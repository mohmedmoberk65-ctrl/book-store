#!/bin/bash

# ============================================
# كتابك - Book Store Deployment Script
# For Hostinger VPS / Shared Hosting
# ============================================

echo "🌐 Starting deployment of كتابك Book Store..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# 2. Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# 3. Push database schema
echo "🛢️  Pushing database schema..."
npx prisma db push

# 4. Seed the database
echo "🌱 Seeding database..."
npm run prisma:seed

# 5. Build the Next.js app
echo "🔨 Building the application..."
npm run build

echo "✅ Deployment completed!"
echo ""
echo "To start the server:"
echo "  npm start"
echo ""
echo "Or use PM2 for production:"
echo "  pm2 start npm --name 'book-store' -- start"
echo "  pm2 save"
echo ""
echo "Make sure to set these environment variables in your hosting panel:"
echo "  - DATABASE_URL=file:./prisma/dev.db"
echo "  - NEXTAUTH_SECRET=your-secret-key"
echo "  - NEXTAUTH_URL=https://yourdomain.com"
echo "  - TELEGRAM_BOT_TOKEN=your-telegram-bot-token"
echo "  - TELEGRAM_CHAT_ID=your-telegram-chat-id"

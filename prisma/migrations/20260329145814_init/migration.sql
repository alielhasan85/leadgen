-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "businessName" TEXT,
    "industry" TEXT,
    "whatTheySell" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "trialEndsAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "provider" TEXT,
    "providerCustomerId" TEXT,
    "providerSubscriptionId" TEXT,
    "providerPriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,
    "provider" TEXT,
    "providerRef" TEXT,
    "subscriptionId" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "contentExtracted" TEXT NOT NULL,
    "fileSizeBytes" INTEGER,
    "aiSummary" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_businesses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "googlePlaceId" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "address" TEXT,
    "area" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'QA',
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "googleRating" DOUBLE PRECISION,
    "googleReviewCount" INTEGER,
    "googlePriceLevel" INTEGER,
    "googleOpenNow" BOOLEAN,
    "hasWebsite" BOOLEAN NOT NULL DEFAULT false,
    "hasDigitalMenu" BOOLEAN NOT NULL DEFAULT false,
    "hasQrCode" BOOLEAN NOT NULL DEFAULT false,
    "hasOnlineOrder" BOOLEAN NOT NULL DEFAULT false,
    "instagramUsername" TEXT,
    "instagramFollowers" INTEGER,
    "instagramPostCount" INTEGER,
    "instagramLastPostAt" TIMESTAMP(3),
    "instagramIsActive" BOOLEAN,
    "facebookUrl" TEXT,
    "facebookLikes" INTEGER,
    "linkedinUrl" TEXT,
    "lastEnrichedAt" TIMESTAMP(3),
    "enrichVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_leads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "masterBusinessId" TEXT NOT NULL,
    "campaignId" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "scoreLabel" TEXT NOT NULL DEFAULT 'COLD',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "isSuppressed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActivityAt" TIMESTAMP(3),

    CONSTRAINT "user_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "tone" TEXT NOT NULL DEFAULT 'professional',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "leadsFound" INTEGER NOT NULL DEFAULT 0,
    "leadsScored" INTEGER NOT NULL DEFAULT 0,
    "followupDays" INTEGER NOT NULL DEFAULT 3,
    "maxFollowups" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_emails" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userLeadId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "trackingId" TEXT,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_followups" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userLeadId" TEXT NOT NULL,
    "userEmailId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "sequenceNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_followups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "existing_contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "company" TEXT,
    "phone" TEXT,
    "statusInCrm" TEXT,
    "sourceFile" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "existing_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_signals" (
    "id" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "hourOfDay" INTEGER NOT NULL,
    "signalType" TEXT NOT NULL,
    "subjectPattern" TEXT,
    "language" TEXT,
    "tone" TEXT,
    "outcome" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_signals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "verification_tokens_expires_idx" ON "verification_tokens"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_status_idx" ON "subscriptions"("userId", "status");

-- CreateIndex
CREATE INDEX "subscriptions_currentPeriodEnd_idx" ON "subscriptions"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "payments_userId_paidAt_idx" ON "payments"("userId", "paidAt");

-- CreateIndex
CREATE INDEX "payments_subscriptionId_idx" ON "payments"("subscriptionId");

-- CreateIndex
CREATE INDEX "materials_userId_idx" ON "materials"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "master_businesses_googlePlaceId_key" ON "master_businesses"("googlePlaceId");

-- CreateIndex
CREATE INDEX "master_businesses_city_sector_idx" ON "master_businesses"("city", "sector");

-- CreateIndex
CREATE INDEX "master_businesses_sector_lastEnrichedAt_idx" ON "master_businesses"("sector", "lastEnrichedAt");

-- CreateIndex
CREATE INDEX "master_businesses_googlePlaceId_idx" ON "master_businesses"("googlePlaceId");

-- CreateIndex
CREATE INDEX "user_leads_userId_status_idx" ON "user_leads"("userId", "status");

-- CreateIndex
CREATE INDEX "user_leads_userId_campaignId_idx" ON "user_leads"("userId", "campaignId");

-- CreateIndex
CREATE INDEX "user_leads_userId_scoreLabel_idx" ON "user_leads"("userId", "scoreLabel");

-- CreateIndex
CREATE INDEX "user_leads_campaignId_idx" ON "user_leads"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "user_leads_userId_masterBusinessId_key" ON "user_leads"("userId", "masterBusinessId");

-- CreateIndex
CREATE INDEX "campaigns_userId_status_idx" ON "campaigns"("userId", "status");

-- CreateIndex
CREATE INDEX "campaigns_userId_createdAt_idx" ON "campaigns"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_emails_trackingId_key" ON "user_emails"("trackingId");

-- CreateIndex
CREATE INDEX "user_emails_userId_status_idx" ON "user_emails"("userId", "status");

-- CreateIndex
CREATE INDEX "user_emails_userLeadId_idx" ON "user_emails"("userLeadId");

-- CreateIndex
CREATE INDEX "user_emails_trackingId_idx" ON "user_emails"("trackingId");

-- CreateIndex
CREATE INDEX "user_followups_userId_status_idx" ON "user_followups"("userId", "status");

-- CreateIndex
CREATE INDEX "user_followups_scheduledFor_status_idx" ON "user_followups"("scheduledFor", "status");

-- CreateIndex
CREATE INDEX "user_followups_userLeadId_idx" ON "user_followups"("userLeadId");

-- CreateIndex
CREATE UNIQUE INDEX "user_followups_userLeadId_sequenceNumber_key" ON "user_followups"("userLeadId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "existing_contacts_userId_email_idx" ON "existing_contacts"("userId", "email");

-- CreateIndex
CREATE INDEX "existing_contacts_userId_company_idx" ON "existing_contacts"("userId", "company");

-- CreateIndex
CREATE INDEX "existing_contacts_userId_statusInCrm_idx" ON "existing_contacts"("userId", "statusInCrm");

-- CreateIndex
CREATE INDEX "platform_signals_sector_city_dayOfWeek_idx" ON "platform_signals"("sector", "city", "dayOfWeek");

-- CreateIndex
CREATE INDEX "platform_signals_sector_signalType_outcome_idx" ON "platform_signals"("sector", "signalType", "outcome");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_leads" ADD CONSTRAINT "user_leads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_leads" ADD CONSTRAINT "user_leads_masterBusinessId_fkey" FOREIGN KEY ("masterBusinessId") REFERENCES "master_businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_leads" ADD CONSTRAINT "user_leads_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_emails" ADD CONSTRAINT "user_emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_emails" ADD CONSTRAINT "user_emails_userLeadId_fkey" FOREIGN KEY ("userLeadId") REFERENCES "user_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_followups" ADD CONSTRAINT "user_followups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_followups" ADD CONSTRAINT "user_followups_userLeadId_fkey" FOREIGN KEY ("userLeadId") REFERENCES "user_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_followups" ADD CONSTRAINT "user_followups_userEmailId_fkey" FOREIGN KEY ("userEmailId") REFERENCES "user_emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "existing_contacts" ADD CONSTRAINT "existing_contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

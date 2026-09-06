-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RegionLevel" AS ENUM ('STATE', 'DISTRICT', 'VILLAGE');

-- CreateEnum
CREATE TYPE "VitalityStatus" AS ENUM ('SAFE', 'VULNERABLE', 'ENDANGERED', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('AUDIO', 'VIDEO', 'IMAGE', 'TEXT');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('LULLABY', 'PROVERB', 'STORY', 'FESTIVAL', 'CRAFT_TECHNIQUE', 'RECIPE', 'RITUAL', 'LIFE_SKILL', 'OTHER');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'COMMUNITY_ONLY', 'PRIVATE', 'STEWARD_ONLY');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'COMMUNITY_VERIFIED', 'STEWARD_ENDORSED', 'EXPERT_REVIEWED');

-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('ANONYMOUS', 'EMAIL_OTP', 'PHONE_OTP');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CONTRIBUTOR', 'REVIEWER', 'STEWARD', 'EXPERT');

-- CreateEnum
CREATE TYPE "VerificationAction" AS ENUM ('AGREE', 'EDIT', 'DISPUTE', 'ENDORSE');

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "RegionLevel" NOT NULL,
    "parentRegionId" TEXT,
    "geoJsonData" JSONB,
    "vitalityStatus" "VitalityStatus" NOT NULL DEFAULT 'VULNERABLE',
    "vitalityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scriptName" TEXT,
    "estimatedSpeakers" INTEGER,
    "averageSpeakerAge" INTEGER,
    "vitalityStatus" "VitalityStatus" NOT NULL DEFAULT 'VULNERABLE',
    "yearsToCritical" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Craft" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "estimatedPractitioners" INTEGER,
    "vitalityStatus" "VitalityStatus" NOT NULL DEFAULT 'VULNERABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Craft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionLanguage" (
    "regionId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "RegionLanguage_pkey" PRIMARY KEY ("regionId","languageId")
);

-- CreateTable
CREATE TABLE "RegionCraft" (
    "regionId" TEXT NOT NULL,
    "craftId" TEXT NOT NULL,

    CONSTRAINT "RegionCraft_pkey" PRIMARY KEY ("regionId","craftId")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "authMethod" "AuthMethod" NOT NULL DEFAULT 'ANONYMOUS',
    "role" "UserRole" NOT NULL DEFAULT 'CONTRIBUTOR',
    "points" INTEGER NOT NULL DEFAULT 0,
    "badges" JSONB,
    "assignedRegionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "regionId" TEXT NOT NULL,
    "languageId" TEXT,
    "craftId" TEXT,
    "category" "Category" NOT NULL,
    "tags" TEXT[],
    "speakerName" TEXT,
    "speakerAge" INTEGER,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "transcriptionText" TEXT,
    "translationText" TEXT,
    "summaryText" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "similarityHash" TEXT,
    "contributorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "scopesGranted" TEXT[],
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "action" "VerificationAction" NOT NULL,
    "submittedTranscription" TEXT,
    "submittedTranslation" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UntranslatableEntry" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "script" TEXT,
    "phonetic" TEXT,
    "literalMeaning" TEXT,
    "explanation" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UntranslatableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Craft_name_key" ON "Craft"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_email_key" ON "Contributor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_phoneNumber_key" ON "Contributor"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentRecord_recordId_key" ON "ConsentRecord"("recordId");

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_parentRegionId_fkey" FOREIGN KEY ("parentRegionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionLanguage" ADD CONSTRAINT "RegionLanguage_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionLanguage" ADD CONSTRAINT "RegionLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionCraft" ADD CONSTRAINT "RegionCraft_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionCraft" ADD CONSTRAINT "RegionCraft_craftId_fkey" FOREIGN KEY ("craftId") REFERENCES "Craft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_assignedRegionId_fkey" FOREIGN KEY ("assignedRegionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_craftId_fkey" FOREIGN KEY ("craftId") REFERENCES "Craft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UntranslatableEntry" ADD CONSTRAINT "UntranslatableEntry_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

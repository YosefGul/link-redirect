-- AlterTable
ALTER TABLE "link_logs" ADD COLUMN "os" VARCHAR(64),
ADD COLUMN "device_type" VARCHAR(32),
ADD COLUMN "city" VARCHAR(128),
ADD COLUMN "language" VARCHAR(16);



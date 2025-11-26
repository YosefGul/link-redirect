-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "short_links" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "target_url" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "hits" BIGINT NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "allow_edit" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "short_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_logs" (
    "id" BIGSERIAL NOT NULL,
    "link_id" INTEGER NOT NULL,
    "ip" INET,
    "user_agent" TEXT,
    "referer" TEXT,
    "country" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "short_links_slug_key" ON "short_links"("slug");

-- CreateIndex
CREATE INDEX "short_links_owner_id_idx" ON "short_links"("owner_id");

-- CreateIndex
CREATE INDEX "short_links_slug_idx" ON "short_links"("slug");

-- CreateIndex
CREATE INDEX "link_logs_link_id_idx" ON "link_logs"("link_id");

-- CreateIndex
CREATE INDEX "link_logs_created_at_idx" ON "link_logs"("created_at");

-- AddForeignKey
ALTER TABLE "short_links" ADD CONSTRAINT "short_links_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_logs" ADD CONSTRAINT "link_logs_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "short_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

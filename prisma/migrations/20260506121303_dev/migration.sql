-- CreateEnum
CREATE TYPE "Level" AS ENUM ('Beginner', 'Intermediate', 'Expert');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "date_of_birth" DATE,
    "is_activate" BOOLEAN NOT NULL DEFAULT false,
    "notification" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token" (
    "id" TEXT NOT NULL,
    "hashed_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_propriety" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "country_id" TEXT,
    "level" "Level" NOT NULL DEFAULT 'Beginner',

    CONSTRAINT "user_propriety_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flag_icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_categories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "matchs_played" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "country_id" TEXT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "suggested_answer" JSONB,

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "played_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle" (
    "id" TEXT NOT NULL,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,
    "battle_start_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "battle_end_at" TIMESTAMP(3),
    "winner_id" TEXT,

    CONSTRAINT "battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stat" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "user_stat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranked" (
    "id" TEXT NOT NULL,
    "min_rank" INTEGER NOT NULL,
    "max_rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranked_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_rank_online" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rank_id" TEXT NOT NULL,
    "score_battle" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_rank_online_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_rank_offline" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rank_id" TEXT NOT NULL,
    "score_battle" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_rank_offline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "token_hashed_token_key" ON "token"("hashed_token");

-- CreateIndex
CREATE INDEX "token_user_id_idx" ON "token"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_propriety_user_id_key" ON "user_propriety"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "country_name_key" ON "country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE INDEX "user_categories_user_id_idx" ON "user_categories"("user_id");

-- CreateIndex
CREATE INDEX "user_categories_category_id_idx" ON "user_categories"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_categories_user_id_category_id_key" ON "user_categories"("user_id", "category_id");

-- CreateIndex
CREATE INDEX "quiz_category_id_idx" ON "quiz"("category_id");

-- CreateIndex
CREATE INDEX "quiz_country_id_idx" ON "quiz"("country_id");

-- CreateIndex
CREATE INDEX "games_user_id_idx" ON "games"("user_id");

-- CreateIndex
CREATE INDEX "games_category_id_idx" ON "games"("category_id");

-- CreateIndex
CREATE INDEX "battle_user1_id_idx" ON "battle"("user1_id");

-- CreateIndex
CREATE INDEX "battle_user2_id_idx" ON "battle"("user2_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_stat_user_id_key" ON "user_stat"("user_id");

-- CreateIndex
CREATE INDEX "user_rank_online_user_id_idx" ON "user_rank_online"("user_id");

-- CreateIndex
CREATE INDEX "user_rank_offline_user_id_idx" ON "user_rank_offline"("user_id");

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_propriety" ADD CONSTRAINT "user_propriety_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_propriety" ADD CONSTRAINT "user_propriety_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_categories" ADD CONSTRAINT "user_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_categories" ADD CONSTRAINT "user_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle" ADD CONSTRAINT "battle_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle" ADD CONSTRAINT "battle_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle" ADD CONSTRAINT "battle_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stat" ADD CONSTRAINT "user_stat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rank_online" ADD CONSTRAINT "user_rank_online_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rank_online" ADD CONSTRAINT "user_rank_online_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "ranked"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rank_offline" ADD CONSTRAINT "user_rank_offline_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rank_offline" ADD CONSTRAINT "user_rank_offline_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "ranked"("id") ON DELETE CASCADE ON UPDATE CASCADE;

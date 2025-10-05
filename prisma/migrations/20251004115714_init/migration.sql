-- CreateTable
CREATE TABLE "songs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "thumbnail" TEXT,
    "channelTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "currentSongId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_items" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queue_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_items" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,

    CONSTRAINT "history_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "songs_youtubeId_key" ON "songs"("youtubeId");

-- CreateIndex
CREATE INDEX "songs_title_idx" ON "songs"("title");

-- CreateIndex
CREATE INDEX "songs_artist_idx" ON "songs"("artist");

-- CreateIndex
CREATE INDEX "songs_createdAt_idx" ON "songs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_roomId_key" ON "rooms"("roomId");

-- CreateIndex
CREATE INDEX "rooms_isActive_idx" ON "rooms"("isActive");

-- CreateIndex
CREATE INDEX "rooms_createdAt_idx" ON "rooms"("createdAt");

-- CreateIndex
CREATE INDEX "queue_items_roomId_position_idx" ON "queue_items"("roomId", "position");

-- CreateIndex
CREATE INDEX "queue_items_addedAt_idx" ON "queue_items"("addedAt");

-- CreateIndex
CREATE UNIQUE INDEX "queue_items_roomId_position_key" ON "queue_items"("roomId", "position");

-- CreateIndex
CREATE INDEX "history_items_roomId_playedAt_idx" ON "history_items"("roomId", "playedAt");

-- CreateIndex
CREATE INDEX "history_items_playedAt_idx" ON "history_items"("playedAt");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_currentSongId_fkey" FOREIGN KEY ("currentSongId") REFERENCES "songs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_items" ADD CONSTRAINT "queue_items_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_items" ADD CONSTRAINT "queue_items_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_items" ADD CONSTRAINT "history_items_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_items" ADD CONSTRAINT "history_items_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

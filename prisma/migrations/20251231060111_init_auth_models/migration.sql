-- Create Role table first
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- Insert default admin role
INSERT INTO "Role" ("id","name") VALUES
('00000000-0000-0000-0000-000000000001','admin')
ON CONFLICT DO NOTHING;

-- Alter User safely
ALTER TABLE "User"
DROP COLUMN IF EXISTS "role",
ADD COLUMN "mobile" TEXT,
ADD COLUMN "roleId" TEXT;

-- Backfill existing users
UPDATE "User" SET "mobile" = '9999999999' WHERE "mobile" IS NULL;
UPDATE "User" SET "roleId" = '00000000-0000-0000-0000-000000000001' WHERE "roleId" IS NULL;

-- Enforce constraints
ALTER TABLE "User" ALTER COLUMN "mobile" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "roleId" SET NOT NULL;

CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

ALTER TABLE "User"
ADD CONSTRAINT "User_roleId_fkey"
FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dateOfBirth" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "dateOfBirth", "email", "employeeId", "id", "name", "password", "role") SELECT "createdAt", "dateOfBirth", "email", "employeeId", "id", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

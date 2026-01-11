# Database Repair Instructions

## Issue
MySQL error: "Table '(temporary)' is marked as crashed and should be repaired"

## Solution 1: Repair Database via MySQL Command Line

1. Open MySQL command line or use a MySQL client:
```bash
mysql -u root -p
```

2. Select your database:
```sql
USE global_times_rwanda;
```

3. Check for crashed tables:
```sql
CHECK TABLE password_resets;
```

4. If table exists and is crashed, repair it:
```sql
REPAIR TABLE password_resets;
```

5. If the table doesn't exist yet, that's fine - the migration will create it.

6. Also check and repair the admins table:
```sql
CHECK TABLE admins;
REPAIR TABLE admins;
```

7. Exit MySQL:
```sql
EXIT;
```

## Solution 2: Manual Migration (If Prisma Migration Fails)

If the migration tool continues to fail, you can run the SQL manually:

1. Connect to MySQL:
```bash
mysql -u root -p global_times_rwanda
```

2. Run the migration SQL manually (copy from the migration file):
```sql
-- Add email column to admins
ALTER TABLE `admins` ADD COLUMN `email` VARCHAR(191) NULL;

-- Create unique index on email
CREATE UNIQUE INDEX `admins_email_key` ON `admins`(`email`);

-- Create password_resets table
CREATE TABLE IF NOT EXISTS `password_resets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `password_resets_token_key`(`token`),
    INDEX `password_resets_username_idx`(`username`),
    INDEX `password_resets_token_idx`(`token`),
    INDEX `password_resets_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. After running manually, mark the migration as applied:
```bash
npx prisma migrate resolve --applied 20250130000000_add_email_and_password_reset
```

4. Regenerate Prisma client:
```bash
npx prisma generate
```

## Solution 3: Reset and Recreate (Last Resort)

If the database is severely corrupted:

1. Backup your data first!
2. Reset Prisma migrations (WARNING: This will lose migration history):
```bash
npx prisma migrate reset
```

3. Then run migrations fresh:
```bash
npx prisma migrate dev
```


# Regenerate Prisma Client

After updating the Prisma schema, you need to regenerate the Prisma client to update TypeScript types.

## Steps:

1. **First, apply the migration (if not already done):**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

2. **Then regenerate the Prisma client:**
   ```bash
   npx prisma generate
   ```

3. **Restart the backend server:**
   ```bash
   npm run start
   ```

## If migration fails:

If you get database errors, you can run the migration SQL manually (see REPAIR_DATABASE.md), then mark it as applied:

```bash
npx prisma migrate resolve --applied 20250130000000_add_email_and_password_reset
npx prisma generate
```


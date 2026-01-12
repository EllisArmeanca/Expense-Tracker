import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');
    
    // Run Prisma migrations
    execSync('npx prisma migrate dev', { stdio: 'inherit' });
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

export const createMigration = async (name) => {
  try {
    console.log(`Creating migration: ${name}`);
    
    // Create Prisma migration
    execSync(`npx prisma migrate dev --name ${name}`, { stdio: 'inherit' });
    
    console.log(`Migration '${name}' created successfully!`);
  } catch (error) {
    console.error('Migration creation failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// For direct execution when called via node -e
if (typeof require !== 'undefined' && require.main === module) {
  // This is run when the file is executed directly
  const args = process.argv.slice(2);
  if (args.length > 0) {
    if (args[0] === '--run') {
      runMigrations();
    } else if (args[0] === '--create' && args[1]) {
      createMigration(args[1]);
    }
  }
}
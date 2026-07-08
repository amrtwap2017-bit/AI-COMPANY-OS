# DATA-003 — Seed Data

## `packages/database/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create platform tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'triangle-black' },
    update: {},
    create: {
      name: 'Triangle Black',
      slug: 'triangle-black',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      createdBy: '00000000-0000-0000-0000-000000000001',
      updatedBy: '00000000-0000-0000-0000-000000000001',
    },
  });
  console.log(`  ✓ Tenant: ${tenant.name}`);

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@triangleblack.tech' },
    update: {},
    create: {
      email: 'admin@triangleblack.tech',
      passwordHash: adminPassword,
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'super_admin',
      tenantId: tenant.id,
      isActive: true,
      createdBy: tenant.id,
      updatedBy: tenant.id,
    },
  });
  console.log(`  ✓ Admin: ${admin.email} / Admin@123`);

  // Create demo tenant
  const demoHotel = await prisma.tenant.upsert({
    where: { slug: 'demo-hotel' },
    update: {},
    create: {
      name: 'Demo Hotel Co.',
      slug: 'demo-hotel',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });
  console.log(`  ✓ Demo Tenant: ${demoHotel.name}`);

  // Create demo tenant admin
  const demoPassword = await bcrypt.hash('Demo@123', 12);
  const demoAdmin = await prisma.user.upsert({
    where: { email: 'demo@triangleblack.tech' },
    update: {},
    create: {
      email: 'demo@triangleblack.tech',
      passwordHash: demoPassword,
      firstName: 'Demo',
      lastName: 'Admin',
      role: 'admin',
      tenantId: demoHotel.id,
      isActive: true,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });
  console.log(`  ✓ Demo Admin: ${demoAdmin.email} / Demo@123`);

  // Create demo users
  const users = [
    { email: 'sales@triangleblack.tech', firstName: 'Ahmed', lastName: 'Saleh', role: 'sales_rep' as const },
    { email: 'eng@triangleblack.tech', firstName: 'Karim', lastName: 'Engineer', role: 'engineer' as const },
    { email: 'manager@triangleblack.tech', firstName: 'Mona', lastName: 'Manager', role: 'manager' as const },
  ];

  for (const u of users) {
    const pw = await bcrypt.hash('User@123', 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash: pw,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        tenantId: demoHotel.id,
        isActive: true,
        createdBy: demoAdmin.id,
        updatedBy: demoAdmin.id,
      },
    });
    console.log(`  ✓ User: ${u.email} / User@123`);
  }

  // Create demo company
  const company = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      tenantId: demoHotel.id,
      name: 'Nile Luxury Hotel',
      industry: 'hospitality',
      size: '200 rooms',
      status: 'active',
      createdBy: demoAdmin.id,
      updatedBy: demoAdmin.id,
    },
  });
  console.log(`  ✓ Company: ${company.name}`);

  // Create demo leads
  const leads = [
    { firstName: 'Omar', lastName: 'Hassan', source: 'referral' as const, companyName: 'Pyramids Resort' },
    { firstName: 'Laila', lastName: 'Nadir', source: 'website' as const, companyName: 'Red Sea Hotel' },
    { firstName: 'Youssef', lastName: 'Rashid', source: 'event' as const, companyName: 'Sahara Lodge' },
  ];

  for (const l of leads) {
    await prisma.lead.create({
      data: {
        tenantId: demoHotel.id,
        ...l,
        email: `${l.firstName.toLowerCase()}@example.com`,
        status: 'new',
        score: Math.floor(Math.random() * 60) + 20,
        createdBy: demoAdmin.id,
        updatedBy: demoAdmin.id,
      },
    });
  }
  console.log(`  ✓ ${leads.length} demo leads created`);

  console.log('\n✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## `package.json` db scripts

```json
{
  "scripts": {
    "db:seed": "tsx packages/database/prisma/seed.ts",
    "db:reset": "npx prisma migrate reset --force && pnpm db:seed"
  }
}
```

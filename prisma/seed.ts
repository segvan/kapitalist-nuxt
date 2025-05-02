import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await seedStables();
  await seedAssets();
  await seedJobSyncTime();
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

async function seedStables() {
  await prisma.stable.create({
    data: {id: 'USDT', isDefault: true}
  });
  await prisma.stable.create({
    data: {id: 'BUSD', isDefault: false}
  });
}

async function seedAssets() {
  await prisma.asset.create({
    data: {id: 'BTC'}
  });
  await prisma.asset.create({
    data: {id: 'ETH'}
  });
  await prisma.asset.create({
    data: {id: 'BNB'}
  });
  await prisma.asset.create({
    data: {id: 'LINK'}
  });
  await prisma.asset.create({
    data: {id: 'ADA'}
  });
  await prisma.asset.create({
    data: {id: 'UNI'}
  });
  await prisma.asset.create({
    data: {id: 'DOT'}
  });
  await prisma.asset.create({
    data: {id: 'SOL'}
  });
  await prisma.asset.create({
    data: {id: 'BSW'}
  });
  await prisma.asset.create({
    data: {id: 'MEME'}
  });
  await prisma.asset.create({
    data: {id: 'MATIC'}
  });
  await prisma.asset.create({
    data: {id: 'ATOM'}
  });
  await prisma.asset.create({
    data: {id: 'ARB'}
  });
  await prisma.asset.create({
    data: {id: 'HBAR'}
  });
}

async function seedJobSyncTime() {
  const now = new Date(Date.now());
  await prisma.jobsHistory.create({
    data: {id: 'PricesBot', name: 'Prices Bot', timestamp: now}
  });
  await prisma.jobsHistory.create({
    data: {id: 'PriceChangeBot', name: 'Price Change Bot', timestamp: now}
  });
  await prisma.jobsHistory.create({
    data: {id: 'TradeHistoryBot', name: 'Trade History Bot', timestamp: now}
  });
}

import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'info',  emit: 'stdout' },
      { level: 'warn',  emit: 'stdout' },
      { level: 'error', emit: 'stdout' },
    ],
  })

  prisma.$on('query', (e) => {
    console.log(`💾 [Prisma] Query: ${e.query}`)
  })

  return prisma
}


declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

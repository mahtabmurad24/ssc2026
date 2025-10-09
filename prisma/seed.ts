import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample jersey images
  await prisma.jerseyImage.createMany({
    data: [
      {
        title: 'School Jersey Design',
        imageUrl: '/jersey.jpg',
        imageType: 'jersey',
        order: 1,
      },
      {
        title: 'Jersey Fabric Detail',
        imageUrl: '/fabric.png',
        imageType: 'fabric',
        order: 2,
      },
    ],
  })

  console.log('Sample images added to database')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

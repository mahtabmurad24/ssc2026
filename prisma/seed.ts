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

  // Names to add as ordered data
  const names = [
    'Ahnaf',
    'Shahin',
    'Partho',
    'MASUM',
    'Reza',
    'AFIF',
    'Mohin Gazi',
    'Shahad',
    'BYZEED',
    'Mahim',
    'YAMIN',
    'Nijhum',
    'SINHA',
    'Ariyan',
    'ASHIK',
    'Z.I.NAHIAN',
    'Jihad',
    'Mahtaf'
  ]

  // Helper functions for randomization
  const getRandomClass = () => ['6', '7', '8', '9', '10'][Math.floor(Math.random() * 5)]
  const getRandomSection = () => ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
  const getRandomMobile = () => '01' + Math.floor(Math.random() * 900000000 + 100000000).toString()
  const getRandomSize = () => ['S', 'M', 'L', 'XL', 'XXL'][Math.floor(Math.random() * 5)]
  const getRandomKitVote = () => ['blue', 'green'][Math.floor(Math.random() * 2)]

  // Create jersey orders with names in order and randomized other fields
  for (const name of names) {
    await prisma.jerseyOrder.create({
      data: {
        name,
        class: getRandomClass(),
        section: getRandomSection(),
        mobileNumber: getRandomMobile(),
        size: getRandomSize(),
        kitVote: getRandomKitVote(),
        // Other fields can be left with defaults
      },
    })
  }

  console.log('Jersey orders added to database')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

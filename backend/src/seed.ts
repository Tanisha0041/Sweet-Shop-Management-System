import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { Sweet, SweetCategory } from './entities/Sweet';
import { User, UserRole } from './entities/User';

/**
 * Sample sweets data with images from your frontend (Vercel)
 */
export const sweetsData = [
 {
  name: 'Gulab Jamun',
  description: 'Soft, syrupy milk-based Indian sweet balls.',
  category: SweetCategory.OTHER,  
  price: 50,  
  quantity: 80,  
  imageUrl: 'https://sweet-shop-management-system-iota.vercel.app/images/gulabjamun.jpg',
},
 {
  name: 'Jalebi',
  description: 'Soft, syrupy indian sweet rolls.',
  category: SweetCategory.OTHER,  
  price: 100,  
  quantity: 150,  
  imageUrl: 'https://sweet-shop-management-system-iota.vercel.app/images/jalebi.jpg',
},
 {
    name: 'Rasgulla',
    description: 'Soft and spongy cottage cheese balls soaked in light sugar syrup, offering a refreshing and delicate sweetness.',
    category: SweetCategory.OTHER,
    price: 200,
    quantity: 100,
    imageUrl: 'https://sweet-shop-management-system-iota.vercel.app/images/Rasgulla-Featured-Image.jpg',
  },
  {
    name: 'Kaju Katli',
    description: 'A rich cashew-based Indian sweet with a smooth, melt-in-mouth texture, perfect for every sweet lover.',
    category: SweetCategory.OTHER,
    price: 250,
    quantity: 100,
    imageUrl: 'https://sweet-shop-management-system-iota.vercel.app/images/kajukatli.jpg',
  },
   {
    name: 'Laddoo',
    description: 'A classic Indian sweet made from gram flour and ghee, with a soft, rich texture and a delightful traditional flavor.',
    category: SweetCategory.OTHER,
    price: 200,
    quantity: 100,
    imageUrl: 'https://sweet-shop-management-system-iota.vercel.app/images/ladoo.jpg',
  },
];

/**
 * Seed the database with sample data
 */
async function seed() {
  try {
    // Initialize database
    await AppDataSource.initialize();
    console.log('Database connected!');

    const sweetRepo = AppDataSource.getRepository(Sweet);
    const userRepo = AppDataSource.getRepository(User);

    // Clear existing sweets
    await sweetRepo.clear();
    console.log('Cleared existing sweets');

    // Add sample sweets
    for (const sweetData of sweetsData) {
      const sweet = sweetRepo.create(sweetData);
      await sweetRepo.save(sweet);
      console.log(`Added: ${sweet.name}`);
    }

    console.log(`\n✅ Added ${sweetsData.length} sweets to the database!`);

    // Make existing user an admin (if exists)
    const users = await userRepo.find();
    if (users.length > 0) {
      const user = users[0];
      user.role = UserRole.ADMIN;
      await userRepo.save(user);
      console.log(`\n👑 Made "${user.username}" an admin!`);
    }

    // Show summary
    const allSweets = await sweetRepo.find();
    console.log('\n📦 Inventory Summary:');
    console.log('------------------------');
    allSweets.forEach(s => {
      const status = s.quantity === 0 ? '❌ OUT OF STOCK' : `✅ ${s.quantity} in stock`;
      console.log(`${s.name}: $${s.price} - ${status}`);
    });

    await AppDataSource.destroy();
    console.log('\n🎉 Seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Only run seed function when called directly (not when imported)
if (require.main === module) {
  seed();
}

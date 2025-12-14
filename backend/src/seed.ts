import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { Sweet, SweetCategory } from './entities/Sweet';
import { User, UserRole } from './entities/User';

/**
 * Sample sweets data with real images (using online URLs for production)
 */
export const sweetsData = [
 {
  name: 'Gulab Jamun',
  description: 'Soft, syrupy milk-based Indian sweet balls.',
  category: SweetCategory.OTHER,  
  price: 50,  
  quantity: 80,  
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Gulab_jamun_%28homemade%29.jpg/800px-Gulab_jamun_%28homemade%29.jpg',
},
 {
  name: 'Jalebi',
  description: 'Soft, syrupy indian sweet rolls.',
  category: SweetCategory.OTHER,  
  price: 100,  
  quantity: 150,  
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Jalebi_on_a_white_plate.jpg/800px-Jalebi_on_a_white_plate.jpg',
},
 {
    name: 'Rasgulla',
    description: 'Soft and spongy cottage cheese balls soaked in light sugar syrup, offering a refreshing and delicate sweetness.',
    category: SweetCategory.OTHER,
    price: 200,
    quantity: 100,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Rasgulla_in_syrup.jpg/800px-Rasgulla_in_syrup.jpg',
  },
  {
    name: 'Dark Chocolate Truffle',
    description: 'Rich, velvety dark chocolate truffles made with premium cocoa. Melt-in-your-mouth goodness!',
    category: SweetCategory.CHOCOLATE,
    price: 60,
    quantity: 50,
    imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400',
  },
  {
    name: 'Milk Chocolate Bar',
    description: 'Creamy milk chocolate bar with smooth, silky texture. Perfect for any chocolate lover.',
    category: SweetCategory.CHOCOLATE,
    price: 120,
    quantity: 100,
    imageUrl: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400',
  },
  {
    name: 'Kaju Katli',
    description: 'A rich cashew-based Indian sweet with a smooth, melt-in-mouth texture, perfect for every sweet lover.',
    category: SweetCategory.OTHER,
    price: 250,
    quantity: 100,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Kaju_katli.jpg/800px-Kaju_katli.jpg',
  },
   {
    name: 'Laddoo',
    description: 'A classic Indian sweet made from gram flour and ghee, with a soft, rich texture and a delightful traditional flavor.',
    category: SweetCategory.OTHER,
    price: 200,
    quantity: 100,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Besan_Ke_Laddu.jpg/800px-Besan_Ke_Laddu.jpg',
  },

 
  {
    name: 'Chocolate Chip Cookies',
    description: 'Freshly baked cookies loaded with chocolate chips. Crispy outside, chewy inside!',
    category: SweetCategory.COOKIE,
    price: 150,
    quantity: 75,
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
  },
 
  {
    name: 'Red Velvet Cake',
    description: 'Luxurious red velvet cake with cream cheese frosting. Perfect for celebrations!',
    category: SweetCategory.CAKE,
    price: 400,
    quantity: 10,
    imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400',
  },
  {
    name: 'Chocolate Fudge Cake',
    description: 'Decadent chocolate fudge cake with rich ganache topping. A chocolate paradise!',
    category: SweetCategory.CAKE,
    price: 500,
    quantity: 8,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
  },
  {
    name: 'Butter Croissants',
    description: 'Flaky, buttery croissants baked to golden perfection. French breakfast classic!',
    category: SweetCategory.PASTRY,
    price: 130,
    quantity: 60,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
  },
 
 
  {
    name: 'Chocolate Sundae',
    description: 'Chocolate ice cream sundae with fresh berries, whipped cream & chocolate drizzle.',
    category: SweetCategory.ICE_CREAM,
    price: 200,
    quantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
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

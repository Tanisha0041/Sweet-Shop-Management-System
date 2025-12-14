import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { Sweet, SweetCategory } from './entities/Sweet';
import { User, UserRole } from './entities/User';

/**
 * Sample sweets data with real images (using reliable image CDNs)
 */
export const sweetsData = [
 {
  name: 'Gulab Jamun',
  description: 'Soft, syrupy milk-based Indian sweet balls.',
  category: SweetCategory.OTHER,  
  price: 50,  
  quantity: 80,  
  imageUrl: 'https://cdn.pixabay.com/photo/2020/10/09/13/15/gulab-jamun-5640139_640.jpg',
},
 {
  name: 'Jalebi',
  description: 'Soft, syrupy indian sweet rolls.',
  category: SweetCategory.OTHER,  
  price: 100,  
  quantity: 150,  
  imageUrl: 'https://cdn.pixabay.com/photo/2020/10/05/12/22/jalebi-5629001_640.jpg',
},
 {
    name: 'Rasgulla',
    description: 'Soft and spongy cottage cheese balls soaked in light sugar syrup, offering a refreshing and delicate sweetness.',
    category: SweetCategory.OTHER,
    price: 200,
    quantity: 100,
    imageUrl: 'https://cdn.pixabay.com/photo/2021/09/24/17/51/rasgulla-6653765_640.jpg',
  },
  {
    name: 'Dark Chocolate Truffle',
    description: 'Rich, velvety dark chocolate truffles made with premium cocoa. Melt-in-your-mouth goodness!',
    category: SweetCategory.CHOCOLATE,
    price: 60,
    quantity: 50,
    imageUrl: 'https://cdn.pixabay.com/photo/2017/09/11/23/34/chocolate-truffles-2740435_640.jpg',
  },
  {
    name: 'Milk Chocolate Bar',
    description: 'Creamy milk chocolate bar with smooth, silky texture. Perfect for any chocolate lover.',
    category: SweetCategory.CHOCOLATE,
    price: 120,
    quantity: 100,
    imageUrl: 'https://cdn.pixabay.com/photo/2018/05/01/18/21/chocolate-3366545_640.jpg',
  },
  {
    name: 'Kaju Katli',
    description: 'A rich cashew-based Indian sweet with a smooth, melt-in-mouth texture, perfect for every sweet lover.',
    category: SweetCategory.OTHER,
    price: 250,
    quantity: 100,
    imageUrl: 'https://cdn.pixabay.com/photo/2020/10/30/17/44/kaju-katli-5699267_640.jpg',
  },
   {
    name: 'Laddoo',
    description: 'A classic Indian sweet made from gram flour and ghee, with a soft, rich texture and a delightful traditional flavor.',
    category: SweetCategory.OTHER,
    price: 200,
    quantity: 100,
    imageUrl: 'https://cdn.pixabay.com/photo/2020/10/21/05/29/laddoo-5671545_640.jpg',
  },

 
  {
    name: 'Chocolate Chip Cookies',
    description: 'Freshly baked cookies loaded with chocolate chips. Crispy outside, chewy inside!',
    category: SweetCategory.COOKIE,
    price: 150,
    quantity: 75,
    imageUrl: 'https://cdn.pixabay.com/photo/2017/09/19/21/19/cookies-2766052_640.jpg',
  },
 
  {
    name: 'Red Velvet Cake',
    description: 'Luxurious red velvet cake with cream cheese frosting. Perfect for celebrations!',
    category: SweetCategory.CAKE,
    price: 400,
    quantity: 10,
    imageUrl: 'https://cdn.pixabay.com/photo/2021/01/29/08/10/red-velvet-cake-5959875_640.jpg',
  },
  {
    name: 'Chocolate Fudge Cake',
    description: 'Decadent chocolate fudge cake with rich ganache topping. A chocolate paradise!',
    category: SweetCategory.CAKE,
    price: 500,
    quantity: 8,
    imageUrl: 'https://cdn.pixabay.com/photo/2017/01/11/11/33/cake-1971552_640.jpg',
  },
  {
    name: 'Butter Croissants',
    description: 'Flaky, buttery croissants baked to golden perfection. French breakfast classic!',
    category: SweetCategory.PASTRY,
    price: 130,
    quantity: 60,
    imageUrl: 'https://cdn.pixabay.com/photo/2012/02/29/12/17/bread-18987_640.jpg',
  },
 
 
  {
    name: 'Chocolate Sundae',
    description: 'Chocolate ice cream sundae with fresh berries, whipped cream & chocolate drizzle.',
    category: SweetCategory.ICE_CREAM,
    price: 200,
    quantity: 25,
    imageUrl: 'https://cdn.pixabay.com/photo/2016/12/26/17/28/ice-cream-sundae-1932470_640.jpg',
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

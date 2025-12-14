import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Categories for sweets
 */
export enum SweetCategory {
  CHOCOLATE = 'chocolate',
  CANDY = 'candy',
  COOKIE = 'cookie',
  CAKE = 'cake',
  PASTRY = 'pastry',
  ICE_CREAM = 'ice_cream',
  OTHER = 'other',
}

/**
 * Sweet entity representing products in the sweet shop.
 * Tracks inventory and product details.
 */
@Entity('sweets')
export class Sweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'text',
    default: SweetCategory.OTHER,
  })
  category: SweetCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Check if sweet is in stock
   */
  isInStock(): boolean {
    return this.quantity > 0;
  }

  /**
   * Purchase sweet - decrease quantity
   * @param amount - Amount to purchase
   * @throws Error if insufficient stock
   */
  purchase(amount: number = 1): void {
    if (amount <= 0) {
      throw new Error('Purchase amount must be positive');
    }
    if (this.quantity < amount) {
      throw new Error('Insufficient stock');
    }
    this.quantity -= amount;
  }

  /**
   * Restock sweet - increase quantity
   * @param amount - Amount to add to stock
   */
  restock(amount: number): void {
    if (amount <= 0) {
      throw new Error('Restock amount must be positive');
    }
    this.quantity += amount;
  }
}

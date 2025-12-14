import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import bcrypt from 'bcryptjs';

/**
 * User roles for authorization
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * User entity representing registered users in the system.
 * Handles authentication and role-based access control.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 100 })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'text',
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Hash password before inserting into database
   */
  @BeforeInsert()
  async hashPassword(): Promise<void> {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  /**
   * Compare provided password with stored hash
   * @param candidatePassword - Password to compare
   */
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Returns user data without sensitive information
   */
  toJSON(): Partial<User> {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

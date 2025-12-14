import { DataSource, Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../entities/User';

/**
 * Interface for registration data
 */
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  role?: UserRole;
}

/**
 * Interface for login data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Interface for auth response
 */
export interface AuthResponse {
  user: Partial<User>;
  token: string;
}

/**
 * Authentication Service
 * Handles user registration, login, and token management
 */
export class AuthService {
  private userRepository: Repository<User>;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
  }

  /**
   * Register a new user
   * @param data - User registration data
   * @returns AuthResponse with user data and JWT token
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = this.userRepository.create({
      email: data.email,
      username: data.username,
      password: data.password,
      role: data.role || UserRole.USER,
    });

    await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Login a user
   * @param data - Login credentials
   * @returns AuthResponse with user data and JWT token
   */
  async login(data: LoginData): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User without sensitive data
   */
  async getUserById(userId: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    return user ? user.toJSON() : null;
  }

  /**
   * Verify JWT token and return user
   * @param token - JWT token
   * @returns User data or null
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      const decoded = jwt.verify(token, secret) as { userId: string };
      
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId },
      });

      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate JWT token for user
   * @param user - User entity
   * @returns JWT token string
   */
  private generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || 'default-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      secret,
      { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
    );
  }
}

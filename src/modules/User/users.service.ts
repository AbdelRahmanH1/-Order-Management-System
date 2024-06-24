import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Order } from 'src/Interfaces/models/order.interface';
import { User } from 'src/Interfaces/models/user.interface';
import { ResponseInterface } from 'src/Interfaces/response.interface';
import { formatOrderHistory } from 'src/Utils/formatHistory.utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { userRole } from './user-role.enum';
import { LoginDTO } from './userDTO/login.dto';
import { SignupDTO } from './userDTO/signup.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly _jwtService: JwtService,
  ) {}

  async login(body: LoginDTO): Promise<ResponseInterface> {
    try {
      // Find user by email
      const user: User = await this.prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });

      if (!user) {
        // Throw NotFoundException for clarity
        throw new NotFoundException('User not found');
      }

      // Compare password hashes
      const isMatch: boolean = await bcrypt.compare(
        body.password,
        user.password,
      );
      if (!isMatch) {
        // Throw BadRequestException for clear error messaging
        throw new BadRequestException('Invalid Password');
      }

      // Generate token on successful login
      const token = this._jwtService.sign(
        { email: user.email },
        { secret: process.env.SECRETKEY },
      );

      // Return successful response with token
      return { success: true, token };
    } catch (error) {
      throw error;
    }
  }

  async signUp(body: SignupDTO): Promise<ResponseInterface> {
    try {
      const isExists: User = await this.prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });
      if (isExists) throw new ConflictException('User already exists!');

      const hashPassword: string = await bcrypt.hash(
        body.password,
        parseInt(process.env.SALTROUND),
      );

      const role: userRole = body.role
        ? (body.role as userRole)
        : userRole.USER;
      const user: User = await this.prisma.user.create({
        data: {
          name: body.name,
          password: hashPassword,
          email: body.email,
          address: body.address,
          role: role,
        },
      });
      await this.prisma.cart.create({
        data: {
          userId: user.userId,
        },
      });
      return { success: true, message: 'User created successfully!' };
    } catch (error) {
      throw error;
    }
  }

  async orderHistory(userId: number, req: any): Promise<ResponseInterface> {
    let orders: Order[];
    try {
      if (req.user.role === userRole.ADMIN) {
        // Admin can view order history for any user
        orders = await this.prisma.order.findMany({
          where: { userId },
          include: {
            products: {
              include: { product: true },
            },
            user: true,
          },
        });
      } else if (req.user.role === userRole.USER) {
        // User can only view their own order history
        if (userId !== req.user.userId) {
          throw new ForbiddenException(
            "You do not have access to this user's order history",
          );
        }

        orders = await this.prisma.order.findMany({
          where: { userId: req.user.userId },
          include: {
            products: {
              include: { product: true },
            },
            user: true,
          },
        });
      }

      if (!orders || orders.length === 0) {
        throw new NotFoundException('No orders found');
      }

      // Format the response with desired fields
      const formattedOrders = formatOrderHistory(orders);

      return { success: true, result: formattedOrders };
    } catch (error) {
      throw error;
    }
  }
}

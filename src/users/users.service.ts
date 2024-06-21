import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ResponseInterface } from 'src/Interfaces/response.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO } from './userDTO/login.dto';
import { SignupDTO } from './userDTO/signup.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly _jwtService: JwtService,
  ) {}

  async login(body: LoginDTO): Promise<ResponseInterface> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid Password');

    const token = this._jwtService.sign(
      { email: user.email },
      { secret: process.env.SECRETKEY },
    );
    return { success: true, token };
  }

  async signUp(body: SignupDTO): Promise<ResponseInterface> {
    const isExists = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (isExists) throw new ConflictException('User already exists!');

    const hashPassword = await bcrypt.hash(
      body.password,
      parseInt(process.env.SALTROUND),
    );
    const user = await this.prisma.user.create({
      data: {
        name: body.name,
        password: hashPassword,
        email: body.email,
        address: body.address,
      },
    });
    await this.prisma.cart.create({
      data: {
        userId: user.userId,
      },
    });
    return { success: true, message: 'User created successfully!' };
  }

  profile(req: any) {
    console.log(req.user);
  }
}

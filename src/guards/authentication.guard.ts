import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class authenticationGuard implements CanActivate {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    let token: string = req.headers.authorization;

    if (!token || !token.startsWith(process.env.BEARER_KEY))
      throw new UnauthorizedException('Token invalid');

    token = token.split(process.env.BEARER_KEY)[1];
    const cleanedToken = token.toString();
    try {
      const payload = this._jwtService.verify(cleanedToken, {
        secret: process.env.SECRETKEY,
      });

      const user = await this.prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });
      if (!user) throw new UnauthorizedException('User not found');

      req.user = user;
      return true;
    } catch (error) {}
  }
}

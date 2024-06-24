import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { userRole } from 'src/modules/User/user-role.enum';

@Injectable()
export class authorizationGuard implements CanActivate {
  constructor(private readonly _role: userRole[]) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!this._role.includes(user.role))
      throw new ForbiddenException("Can't access");

    return true;
  }
}

import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { userRole } from '../modules/User/user-role.enum';
import { authorizationGuard } from './authorization.guard';

describe('AuthorizationGuard', () => {
  let guard: authorizationGuard;

  beforeEach(() => {
    guard = new authorizationGuard([userRole.ADMIN]);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when user has the correct role', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            role: userRole.ADMIN,
          },
        }),
      }),
    } as ExecutionContext;

    const result = guard.canActivate(mockContext);
    expect(result).toBeTruthy();
  });

  it('should throw ForbiddenException when user does not have the correct role', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            role: userRole.USER,
          },
        }),
      }),
    } as ExecutionContext;

    try {
      guard.canActivate(mockContext);
      fail('Expected ForbiddenException to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }
  });
});

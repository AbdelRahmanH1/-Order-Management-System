import { userRole } from 'src/users/user-role.enum';
import { authorizationGuard } from './authorization.guard';

describe('GuradsGuard', () => {
  it('should be defined', () => {
    expect(new authorizationGuard(userRole.ADMIN)).toBeDefined();
  });
});

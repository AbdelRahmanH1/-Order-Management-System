import { authenticationGuard } from './authentication.guard';

describe('GuardsGuard', () => {
  it('should be defined', () => {
    expect(new authenticationGuard()).toBeDefined();
  });
});

import { User } from './user';

describe('User', () => {
  it('should create a user object', () => {
    const user: User = {
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123',
      role: 'USER'
    };
    expect(user).toBeTruthy();
  });
});

import { validate } from 'class-validator';
import { CreateAuthDto } from './create-auth.dto';
import { LoginAuthDto } from './login-auth.dto';
import { plainToInstance } from 'class-transformer';

describe('Auth DTOs', () => {
  describe('CreateAuthDto', () => {
    it('should fail if email is missing', async () => {
      const dto = plainToInstance(CreateAuthDto, { password: 'password123' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail if email is invalid', async () => {
      const dto = plainToInstance(CreateAuthDto, { email: 'invalid-email', password: 'password123' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail if password is missing', async () => {
      const dto = plainToInstance(CreateAuthDto, { email: 'test@example.com' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should pass if all fields are valid', async () => {
      const dto = plainToInstance(CreateAuthDto, { email: 'test@example.com', password: 'password123' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('LoginAuthDto', () => {
    it('should fail if email is invalid', async () => {
      const dto = plainToInstance(LoginAuthDto, { email: 'invalid', password: 'password123' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should pass if email and password are valid', async () => {
      const dto = plainToInstance(LoginAuthDto, { email: 'test@example.com', password: 'password123' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});

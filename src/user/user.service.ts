import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userLevel: true,
        rankOnline: {
          include: {
            rank: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    // Remove sensitive data
    const { password, userType, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      // Check if username is already taken by another user
      if (updateUserDto.username) {
        const existingUser = await this.prisma.user.findUnique({
          where: { username: updateUserDto.username },
        });
        if (existingUser && existingUser.id !== userId) {
          throw new HttpException('Username already taken', 400);
        }
      }

      // Check if email is already in use by another user
      if (updateUserDto.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: updateUserDto.email },
        });
        if (existingUser && existingUser.id !== userId) {
          throw new HttpException('Email already in use', 400);
        }
      }

      // Update user with provided fields
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateUserDto,
      });

      const { password, userType, ...userWithoutPassword } = updatedUser;
      return {
        message: 'User profile updated successfully',
        user: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update user profile', 400);
    }
  }

  async deleteUser(userId: string) {
    try {
      await this.prisma.user.delete({
        where: { id: userId },
      });

      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new HttpException('Failed to delete user', 400);
    }
  }
  async updateemail(userId: string, newEmail: string, code: number) {
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }
      const otpValid = await this.authService.optpVerification(
        user.email,
        code,
      );
      if (!otpValid) {
        throw new HttpException('OTP verification failed', 400);
      }
      // Check if email is already in use by another user
      const existingUser = await this.prisma.user.findUnique({
        where: { email: newEmail },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new HttpException('Email already in use', 400);
      }
      // Update user email
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          email: newEmail,
        },
      });

      return {
        message: 'Email updated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update email', 400);
    }
  }

  /**
   * Update user type (Admin only)
   */
  async updateUserType(userId: string, userType: any) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { userType },
      });
      return { message: 'User role updated successfully', userType: user.userType };
    } catch (error) {
      throw new HttpException('Failed to update user role', 400);
    }
  }

  /**
   * Get platform-wide user statistics (Admin only)
   */
  async getAdminStats() {
    const [totalUsers, activeToday, newThisWeek] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeToday,
      newThisWeek,
    };
  }

  async getAllUsers(skip = 0, take = 10) {
    const users = await this.prisma.user.findMany({
      skip,
      take,
      select: {
        id: true,
        email: true,
        username: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
        userLevel: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.user.count();

    return {
      data: users,
      total,
      skip,
      take,
    };
  }

  /**
   * Get a public profile of any user safely
   */
  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        color: true,
        createdAt: true,
        userLevel: true,
        rankOnline: {
          include: {
            rank: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return user;
  }

  /**
   * Update user country preference for automated filtering
   */
  async updateCountryPreference(userId: string, countryId: string) {
    try {
      const data =
        countryId.toLowerCase() === 'all'
          ? { preferredCountryId: null }
          : { preferredCountryId: countryId };

      const user = await this.prisma.user.update({
        where: { id: userId },
        data,
        select: { preferredCountryId: true },
      });

      return {
        message: 'Country preference updated successfully',
        preferredCountryId: user.preferredCountryId,
      };
    } catch (error) {
      throw new HttpException('Failed to update country preference', 400);
    }
  }
}

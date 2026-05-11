import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Usertype } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Usertype[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by AuthGuard

    if (!user || !user.id) {
      return false;
    }

    const userRecord = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { userType: true },
    });

    if (!userRecord) {
      return false;
    }

    const hasRole = requiredRoles.includes(userRecord.userType);
    if (!hasRole) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    // Get the required roles from the metadata
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) return true;
    // Get the user from the request
    const { user } = context.switchToHttp().getRequest();
    // Check if the user has the required role
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied');
    }
    return true;
  }
}

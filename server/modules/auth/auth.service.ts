import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export class LoginDto {
  email!: string;
  password!: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  // 1. Sync Admin account from environment variables if present
  private async syncAdminFromEnv() {
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();

    if (!adminEmail || !adminPassword) return null;

    let admin = await this.prisma.contributor.findUnique({
      where: { email: adminEmail },
    });

    const hashed = bcrypt.hashSync(adminPassword, 10);

    if (!admin) {
      admin = await this.prisma.contributor.create({
        data: {
          displayName: 'System Heritage Administrator',
          email: adminEmail,
          passwordHash: hashed,
          role: 'ADMIN',
          points: 1000,
          badges: ['Platform Supervisor', 'Supreme Overseer'],
          authMethod: 'EMAIL_OTP',
        },
      });
    } else {
      const isSamePassword = admin.passwordHash && bcrypt.compareSync(adminPassword, admin.passwordHash);
      if (!isSamePassword || admin.role !== 'ADMIN') {
        admin = await this.prisma.contributor.update({
          where: { id: admin.id },
          data: {
            role: 'ADMIN',
            passwordHash: hashed,
          },
        });
      }
    }

    return admin;
  }

  // 2. Login handler with bcrypt verification
  async login(dto: LoginDto) {
    try {
      if (!dto || !dto.email || !dto.password) {
        throw new BadRequestException('Email and password are required.');
      }

      const email = String(dto.email).trim().toLowerCase();
      const password = String(dto.password);

      // Check if logging in as Admin using environment credentials
      const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

      if (adminEmail && email === adminEmail) {
        const admin = await this.syncAdminFromEnv();
        if (!admin || !admin.passwordHash) {
          throw new UnauthorizedException('Admin account not configured.');
        }
        const isMatch = bcrypt.compareSync(password, admin.passwordHash);
        if (!isMatch) {
          throw new UnauthorizedException('Invalid credentials for administrator.');
        }
        return {
          user: {
            id: admin.id,
            displayName: admin.displayName,
            email: admin.email,
            role: admin.role,
            points: admin.points,
            badges: admin.badges,
          },
          token: `dharohar-session-${randomUUID()}`,
        };
      }

      // Find user in Contributor database
      const user = await this.prisma.contributor.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
        },
      });

      if (!user) {
        throw new UnauthorizedException('No account found with this email address.');
      }

      // Verify cryptographic bcrypt password hash
      let isValid = false;
      if (user.passwordHash) {
        isValid = bcrypt.compareSync(password, user.passwordHash);
      } else {
        // Fallback for demo seed accounts
        isValid = password === 'dharohar2026';
      }

      if (!isValid) {
        throw new UnauthorizedException('Invalid password entered.');
      }

      return {
        user: {
          id: user.id,
          displayName: user.displayName,
          email: user.email,
          role: user.role,
          points: user.points,
          badges: user.badges,
        },
        token: `dharohar-session-${randomUUID()}`,
      };
    } catch (err: any) {
      console.error('[AuthService.login Error]:', err);
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(err?.message || 'Login verification failed');
    }
  }

  // 3. Return demo role users for fast client 1-click testing
  async getDemoUsers() {
    const demoAccounts = await this.prisma.contributor.findMany({
      where: {
        email: {
          in: ['contributor@dharohar.org', 'reviewer@dharohar.org', 'steward@dharohar.org'],
        },
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        points: true,
        badges: true,
      },
    });

    const hasAdminConfigured = !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);

    return {
      accounts: demoAccounts,
      sharedDemoPassword: 'dharohar2026',
      hasAdminConfigured,
      adminEmail: process.env.ADMIN_EMAIL || null,
      adminEmailEnvName: 'ADMIN_EMAIL',
      adminPasswordEnvName: 'ADMIN_PASSWORD',
    };
  }

  // 4. Get profile by ID
  async getProfile(id: string) {
    const user = await this.prisma.contributor.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        points: true,
        badges: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Session expired or user not found.');
    }

    return user;
  }
}

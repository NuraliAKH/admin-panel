import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(data: { email: string; password: string; name?: string }) {
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: { email: data.email, password: hashed, name: data.name },
    });
    return { id: user.id, email: user.email };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwt.signAsync(payload),
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    };
  }
}

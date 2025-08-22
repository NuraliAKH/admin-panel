import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { DrugsModule } from "./drugs/drugs.module";

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, DrugsModule],
})
export class AppModule {}

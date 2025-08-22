// src/drugs/drugs.module.ts
import { Module } from "@nestjs/common";
import { DrugsService } from "./drugs.service";
import { DrugsController } from "./drugs.controller";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  controllers: [DrugsController],
  providers: [DrugsService, PrismaService],
})
export class DrugsModule {}

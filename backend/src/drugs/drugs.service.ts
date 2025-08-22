import { Injectable } from "@nestjs/common";
import { CreateDrugDto } from "./dto/create-drug.dto";
import { UpdateDrugDto } from "./dto/update-drug.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DrugsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.drug.findMany({ orderBy: { id: "desc" } });
  }

  findById(id: number) {
    return this.prisma.drug.findUnique({ where: { id } });
  }

  create(data: CreateDrugDto) {
    return this.prisma.drug.create({ data });
  }

  update(id: number, data: UpdateDrugDto) {
    return this.prisma.drug.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.drug.delete({ where: { id } });
  }
}

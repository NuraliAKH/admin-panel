import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { DrugsService } from "./drugs.service";
import { CreateDrugDto } from "./dto/create-drug.dto";
import { UpdateDrugDto } from "./dto/update-drug.dto";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { multerConfig } from "multer.config";

@Controller("drugs")
export class DrugsController {
  constructor(private readonly service: DrugsService) {}

  @Get()
  async findAll() {
    const products = await this.service.findAll();
    return { products };
  }

  @Get(":id")
  async findById(@Param("id", ParseIntPipe) id: number) {
    return this.service.findById(id);
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @UseInterceptors(FilesInterceptor("images", 10, multerConfig))
  create(@Body() dto: CreateDrugDto, @UploadedFiles() files: Express.Multer.File[]) {
    const images = files?.map(f => `/uploads/${f.filename}`) || [];
    return this.service.create({ ...dto, images });
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @UseInterceptors(FilesInterceptor("images", 10, multerConfig))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDrugDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const images = files?.map(f => `/uploads/${f.filename}`) || [];
    return this.service.update(id, { ...dto, images });
  }

  @Delete(":id")
  @Roles("ADMIN")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Post("upload")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FilesInterceptor("images", 10, {
      // до 10 файлов
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    })
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const imageUrls = files.map(file => `/uploads/${file.filename}`);
    return { images: imageUrls };
  }
}

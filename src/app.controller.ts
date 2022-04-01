import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';

@Controller('/api/v1/restaurants')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('')
  async getRestaurants(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number = 0,
    @Query('pageSize', new DefaultValuePipe(12), ParseIntPipe)
    pageSize: number = 12,
    @Query('search') search: string,
    @Query('time') time: string,
    @Query('day') day: string,
  ) {
    return this.appService.fetchRestaurants(page, pageSize, search, day, time);
  }
  @Post('upload')
  @UseInterceptors(FileInterceptor('file_asset', { dest: './files' }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.appService.transformAndSave(file);
  }
}

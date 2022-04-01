import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from 'ormconfig';
import { Restaurant } from './restaurant.entity';
import { RestaurantDetails } from './restaurantDetails.entity';
import { HttpModule } from '@nestjs/axios';
import { CsvModule } from 'nest-csv-parser';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    TypeOrmModule.forFeature([Restaurant, RestaurantDetails]),
    HttpModule,
    CsvModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

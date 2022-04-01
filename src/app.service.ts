import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { RestaurantDetails } from './restaurantDetails.entity';
import { dayMapper } from './utils/commonUtils';
import { CsvParser } from 'nest-csv-parser';
import fs, { createReadStream } from 'fs';
import { openDayTypeList } from './enums/OpenDayType.enum';

class Entity {
  restaurantName: string;
  openHours: string;
}

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepo: Repository<Restaurant>,
    @InjectRepository(RestaurantDetails)
    private restaurantDetails: Repository<RestaurantDetails>,
    private readonly csvParser: CsvParser,
  ) {}
  async transformAndSave(file: Express.Multer.File) {
    try {
      const stream = createReadStream(`files/${file.filename}`, 'utf-8');
      const entities = await this.csvParser.parse(stream, Entity, null, null, {
        strict: true,
        separator: ',',
      });
      const durationRegex =
        /(?:(\d+):)?\d+ (?:[ap]m) - (?:(\d+):)?\d+ (?:[ap]m)/gi;

      entities.list.forEach(async (element: Entity) => {
        const openHoursSlots = element.openHours.split('/');
        const restaurant = await this.restaurantRepo.create({
          name: element.restaurantName,
        });
        await this.restaurantRepo.save(restaurant);
        const openHoursList: RestaurantDetails[] = [];
        openHoursSlots.forEach(async (element) => {
          const durationStr = element.match(durationRegex);
          if (durationStr != null) {
            const daysStr = element
              .substring(0, element.indexOf(durationStr.toString()))
              .trim();
            const parts = daysStr.trim().split(', ');
            const days = parts[0].split('-');
            if (days.length > 1) {
              for (
                let i = openDayTypeList.indexOf(dayMapper(days[0]));
                i <= openDayTypeList.indexOf(dayMapper(days[1]));
                i++
              ) {
                const openHours = this.restaurantDetails.create({
                  openDay: openDayTypeList[i],
                  openTime: durationStr.toString().split(' - ')[0],
                  closeTime: durationStr.toString().split(' - ')[1],
                });
                openHours.restaurant = restaurant;
                await this.restaurantDetails.save(openHours);
                openHoursList.push(openHours);
              }
            } else {
              const openHours = this.restaurantDetails.create({
                openDay: parts[0],
                openTime: durationStr.toString().split(' - ')[0],
                closeTime: durationStr.toString().split(' - ')[1],
              });
              openHours.restaurant = restaurant;
              await this.restaurantDetails.save(openHours);
              openHoursList.push(openHours);
            }

            if (parts.length == 2) {
              const openHours = this.restaurantDetails.create({
                openDay: parts[1],
                openTime: durationStr.toString().split(' - ')[0],
                closeTime: durationStr.toString().split(' - ')[1],
              });
              openHours.restaurant = restaurant;
              await this.restaurantDetails.save(openHours);
              openHoursList.push(openHours);
            }
          }
        });
        restaurant.openDaysAndHours = openHoursList;
        await this.restaurantRepo
          .createQueryBuilder()
          .update(restaurant)
          .set({ openDaysAndHours: openHoursList })
          .where('id = :id', { id: 1 })
          .execute();
      });
    } catch (error) {
      console.log(error);
    }
  }

  async fetchRestaurants(
    page: number,
    pageSize: number,
    search: string,
    day: string,
    time: string,
  ) {
    try {
      const keyword = search || '';
      const openDay = day || '';
      const openTime = time || '';
      const queryBuilder = await this.restaurantRepo
        .createQueryBuilder('r')
        .leftJoinAndSelect(`r.openDaysAndHours`, 'rd')
        .take(pageSize)
        .skip(page);
      if (keyword) {
        queryBuilder.where({ name: Like('%' + keyword + '%') });
      }
      if (openTime) {
        queryBuilder.andWhere("rd.openTime >='" + openTime+"'");
        queryBuilder.andWhere("rd.closeTime <'" + openTime+"'");
      }
      if (openDay) {
      
        const where = "rd.openDay='" + openDay +"'";
        queryBuilder.orWhere(where);
      }

      const [list, total] = await queryBuilder.getManyAndCount();
      return {
        list,
        page,
        pageSize,
        total,
      };
    } catch (error) {
      return {
        list: [],
        page: 0,
        pageSize: 0,
        total: 0,
      };
    }
  }
}

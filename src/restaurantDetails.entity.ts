import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { OpenDayType } from './types/OpenDayType';

@Entity()
export class RestaurantDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  openDay: string;

  @Column()
  openTime: string;

  @Column()
  closeTime: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.openDaysAndHours, {
    onDelete: 'SET NULL',
  })
  restaurant: Restaurant;
}

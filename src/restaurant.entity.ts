import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { RestaurantDetails } from './restaurantDetails.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => RestaurantDetails, (detail) => detail.restaurant, {
    cascade: true,
    eager: true,
  })
  openDaysAndHours: RestaurantDetails[];
}

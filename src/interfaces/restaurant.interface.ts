export interface IRestaurant {
  name: string;
  openHours?: IRestaurantDetails[];
}

export interface IRestaurantDetails {
  openDay: string;
  openTime: string;
  closeTime: string;
}

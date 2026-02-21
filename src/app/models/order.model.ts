import { Address } from "./address.model";
import { Item } from "./item.model";
import { Restaurant } from "./restaurant.model";

export class Order {
    constructor(
        public address: Address,
        public restaurant_id: any,
        public order: Item[],
        public total: number,
        public grandTotal: number,
        public deliveryCharge: number,
        public status: string,
        // public time: string,
        public payment_status: boolean,
        public payment_mode: string,
        public _id?: string,
        public user_id?: string,
        public instruction?: string,
        public created_at?: Date,
        public updated_at?: Date,
        public restaurant?: Restaurant,
        public payment_id?: string
    ) {}
}
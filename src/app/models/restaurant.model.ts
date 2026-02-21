export class Restaurant {
    
    constructor(
        public user_id: string,
        public cover: string,
        public name: string,
        public short_name: string,
        public cuisines: string[],
        public rating: number,
        public delivery_time: number,
        public price: number,
        public _id?: string,
        public phone?: number,
        public email?: string,
        public isClose?: boolean,
        public description?: string,
        public openTime?: string,
        public closeTime?: string,
        public city_id?: string,
        public address?: string,
        public distance?: number,
        public location?: any, 
        public status?: string,
        public totalRating?: number,
        public created_at?: Date,
        public updated_at?: Date,
        public latitude?: any,
        public longitude?: any
    ) {}

}
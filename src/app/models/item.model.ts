export class Item {
    
    constructor(
        public _id: string,
        public category_id: string,
        public restaurant_id: string,
        public cover: string,
        public name: string,
        public description: string,
        public price: number,
        // public rating: number,
        public status: boolean,
        // public variation: boolean,
        public veg: boolean,
        public quantity?: number
    ) {}

}
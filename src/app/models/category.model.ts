export class Category {
    
    constructor(
        public _id: string,
        public name: string,
        public restaurant_id: string,
        public created_at?: Date,
        public updated_at?: Date
    ) {}

}
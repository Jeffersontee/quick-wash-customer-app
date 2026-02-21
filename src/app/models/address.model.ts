export class Address {
    
    constructor(
        public _id: string,
        public title: string,
        public address: string,
        public landmark: string,
        public house: string,
        public lat: number,
        public lng: number,
        public user_id?: string,
        public created_at?: Date,
        public updated_at?: Date
    ) {}

}
export interface Banner {
    _id: string;
    banner: string;
    status: boolean;
    created_at: Date;
    updated_at: Date;
    restaurant_id?: string;
}
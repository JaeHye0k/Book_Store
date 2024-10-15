import { RowDataPacket } from "mysql2";

export interface OrderRequestBody {
    orderItems: number[];
    delivery: {
        address: string;
        receiver: string;
        contact: string;
    };
    totalPrice: number;
    totalQuantity: number;
    firstBookTitle: string;
    userId: number;
}

export interface OrderRecord extends RowDataPacket {
    id: number;
    user_id: number;
    total_quantity: number;
    total_price: number;
    book_title: string;
    ordered_at: string;
    delivery_id: number;
}

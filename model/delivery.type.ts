import { RowDataPacket } from "mysql2";

export interface DeliveryRecord extends RowDataPacket {
    id: number;
    receiver: string;
    contact: string;
    address: string;
}

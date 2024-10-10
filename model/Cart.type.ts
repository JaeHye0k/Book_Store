export interface CartRequestBody {
    bookId: number;
    quantity: number;
    userId: number;
    cartItemId: number;
    selected: number[];
}

export type JSONType = number | boolean | string | null | JSONType[] | { [key: string]: JSONType };

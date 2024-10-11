export interface OrderRequestBody {
    userId: number;
    items: Item[];
    delivery: {
        address: string;
        receiver: string;
        contact: string;
    };
    totalPrice: number;
    totalQuantity: number;
    firstBookTitle: string;
}

interface Item {
    cartItemId: number;
    bookId: number;
    quantity: number;
}

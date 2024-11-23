export interface BookQuery {
    category_id?: string | number;
    news?: string | boolean;
    limit: string | number;
    currentPage: string | number;
}

export interface Book {
    id: number;
    price: number;
    pages: number;
    category_id: number;
    title: string;
    author: string;
    readonly isbn: string;
    form: string;
    summary?: string;
    detail?: string;
    contents?: string;
    pub_date?: string;
    [key: string]: Book[keyof Book];
}

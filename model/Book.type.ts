export interface BookParams {}

export interface BookBody {}

export interface BookResBody {}

export interface BookReqBody {}

export interface BookQuery {
    category?: string | number;
    isNew?: string | boolean;
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
}

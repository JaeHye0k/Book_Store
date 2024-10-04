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

export interface BookCategoryQuery {
    categoryId?: string;
    newly?: string;
}

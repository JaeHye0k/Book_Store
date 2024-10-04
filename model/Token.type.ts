export interface Token {
    id: number;
    email: string;
    password: string;
    iat: number;
    exp: number;
    iss?: string;
}

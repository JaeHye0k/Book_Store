import * as core from "express-serve-static-core";

export interface LikeParams extends core.ParamsDictionary {
    bookId: string;
}

export interface LikeBody {
    userId: number;
}

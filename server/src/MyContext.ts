import { Request, Response } from 'express';
import { createUsersLoader } from './utils/usersLoader';
export interface MyContext {
    req: Request;
    res: Response;
    payload?: { userId: number } | null;
}

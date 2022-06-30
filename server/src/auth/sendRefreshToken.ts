import { Response } from 'express';
require('dotenv').config();

export const sendRefreshToken = (res: Response, token: string) => {
    res.cookie('jid', token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/refresh_token',
    });
};

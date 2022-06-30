import { verify } from 'jsonwebtoken';
import { MyContext } from 'src/MyContext';
import { MiddlewareFn } from 'type-graphql';

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
    const authorization = context.req.headers['authorization'];

    if (!authorization) {
        context.payload = null;
        return next();
    }
    try {
        const token = authorization?.split(' ')[1];
        const payload = verify(token, process.env.ACCESS_SECRET!);
        context.payload = payload as any;
    } catch (error) {
        console.log('isAuth error : ', error);
        context.payload = null;
    }

    return next();
};

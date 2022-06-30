import { AppDataSource } from './config/data-source';
import express, { NextFunction, Request } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cookieParser from 'cookie-parser';
import { verify } from 'jsonwebtoken';
import { createAccessToken, createRefreshToken } from './auth/Auth';
import { sendRefreshToken } from './auth/sendRefreshToken';
import cors from 'cors';
import { User } from './entity/User';
import { Page } from './entity/Page';
import { UserToPage } from './entity/UserToPage';
import { PageResolvers } from './modules/PageResolvers';
import { UserResolvers } from './modules/UserResolvers';
import { SharedPageResolvers } from './modules/SharedPageResolvers';
import { mongooseConnect } from './config/mongoose';
import { PageDataModel } from './entity/PageContents';

import { createServer } from 'http';
import { Server } from 'socket.io';
require('dotenv').config();

(async () => {
    const app = express();
    app.use(cookieParser());
    app.set('trust proxy', 1);
    app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));

    app.get('/', (_req, res) => {
        res.send('Hello World!');
    });

    app.post('/refresh_token', async (req, res) => {
        const token = req.cookies.jid;
        console.log('refresh_token route called');
        if (!token) {
            console.log('refresh_token: returned no token');
            return res.send({ ok: false, accessToken: '' });
        }
        let payload: any = null;
        try {
            payload = verify(token, process.env.REFRESH_SECRET!);
        } catch (error) {
            console.log('refresh_token: error, ', error.message);
            return res.send({ ok: false, accessToken: '' });
        }

        // valid token, send acc
        const user = await User.findOneBy({ id: payload.userId });
        if (!user) {
            console.log('refresh_token: user not found');
            return res.send({ ok: false, accessToken: '' });
        }
        // check version
        if (user.tokenVersion !== payload.tokenVersion) {
            console.log('refresh_token : wrong version');
            return res.send({ ok: false, accessToken: '' });
        }

        // also refresh the refresh token
        sendRefreshToken(res, createRefreshToken(user));
        return res.send({ ok: true, accessToken: createAccessToken(user) });
    });

    await AppDataSource.initialize();
    // await AppDataSource.synchronize(true);
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolvers, PageResolvers, SharedPageResolvers],
        }),
        context: ({ req, res }) => ({
            req,
            res,
        }),
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });

    await mongooseConnect();

    const checkAuth = async (req: any, res: any, next: any) => {
        const authorization = req.headers['authorization'];
        const pageId = req.headers['page-id'];
        console.log('socket auth : ');
        if (!authorization || !pageId) {
            return next(new Error('not authorized'));
        }
        try {
            const token = authorization?.split(' ')[1];
            const payload: any = verify(token, process.env.ACCESS_SECRET!);
            const page = await Page.findOneBy({ id: pageId });
            if (!page) {
                console.log('socket auth : no page');
                return next(new Error('page not found'));
            }
            const userPage = await UserToPage.findOneBy({
                userId: payload.userId,
                pageId: pageId,
            });
            if (!userPage) {
                console.log('socket auth : no userpage');
                return next(new Error('not authorized'));
            }
            req.userId = payload.userId as any;
            req.pageId = pageId;
            console.log('socket auth : authenticated');
            next();
        } catch (error) {
            console.log('socket auth : error, ', error);
            return next(new Error('not authorized'));
        }
    };

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL,
            allowedHeaders: ['Authorization', 'Content-Type', 'Page-Id'],
            credentials: true,
        },
    });
    const wrap = (middleware: any) => (socket: any, next: any) =>
        middleware(socket.request, {}, next);

    io.use(wrap(checkAuth));

    io.on('connection', (socket) => {
        console.log('connected user: ', socket.id);
        const { pageId } = socket.request as any;
        socket.on('get-page-contents', async (callback) => {
            try {
                const page = await PageDataModel.findById(pageId).exec();
                if (page === null) {
                    callback({
                        ok: false,
                        page_contents: null,
                    });
                } else {
                    socket.join(pageId);
                    console.log(`user with id ${socket.id} joined room `);
                    callback({
                        ok: true,
                        page_contents: page.data,
                    });
                }
            } catch (e) {
                callback({
                    ok: false,
                    page_contents: null,
                });
            }
        });

        socket.on('send-changes', (obj) => {
            socket.broadcast.to(pageId).emit('receive-changes', obj);
        });
        socket.on('save-document', async (data) => {
            const a = await PageDataModel.findByIdAndUpdate(pageId, {
                data,
            }).exec();
        });
    });
    httpServer.listen(process.env.PORT || '4000', () => {
        console.log();
        console.log('Server started on port', process.env.PORT || '4000');
        console.log();
    });
})();

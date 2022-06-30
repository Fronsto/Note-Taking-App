import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Page } from '../entity/Page';
import { UserToPage } from '../entity/UserToPage';
require('dotenv').config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.HDB_URI,
    ssl: { rejectUnauthorized: false },

    logging: false,
    synchronize: false,
    entities: [User, Page, UserToPage],
    migrations: [],
    subscribers: [],
});

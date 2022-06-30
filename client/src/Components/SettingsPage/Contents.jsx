import React, { useState } from 'react';
import { useLogout } from '../../graphql/auth.jsx';
import { Button } from '@mui/material';
import { useMeQuery } from '../../graphql/auth.jsx';
import useDarkMode from '../hooks/useDarkMode';

const Divider = () => {
    return <div className="w-full h-[2px] opacity-30 my-4 bg-gray-500" />;
};

export const AccountSettings = () => {
    const logout = useLogout();
    const { data } = useMeQuery();
    return (
        <>
            <div className="text-lg text-gray-700 mb-2 dark:text-gray-300">
                Personal Info
            </div>
            <div className="text-sm text-gray-500  dark:text-gray-400 ">
                Email
            </div>
            <div className=" text-lg mb-1  w-full">{data.me.email}</div>
            <div className="text-sm text-gray-500 mt-2 dark:text-gray-400 ">
                Username
            </div>
            <div className=" text-lg mb-1  w-full">{data.me.username}</div>
            <Divider />
            <div className="text-lg text-gray-700 dark:text-gray-300 ">
                Logout
            </div>
            <div className="text-sm text-gray-500 mb-4 dark:text-gray-500 ">
                You will be logged out of your account and will have to log back
                in.
            </div>
            <LogoutButton logout={logout} />
        </>
    );
};
export const PreferencesSettings = () => {
    const [darkTheme, setDarkTheme] = useDarkMode();
    const handleMode = (val) => setDarkTheme(val === '1' ? true : false);
    return (
        <>
            <div className="text-lg text-gray-700 mb-2 dark:text-gray-300 ">
                Theme
            </div>
            <select
                name="theme"
                className="dark:bg-gray-600 rounded outline-none px-2 dark:border-gray-500"
                onChange={(e) => {
                    handleMode(e.target.value);
                }}
            >
                <option value={1}>Dark</option>
                <option value={0}>Light</option>
            </select>
        </>
    );
};
export const AboutSection = () => {
    return (
        <>
            <div className="text-3xl text-gray-700 mb-3 dark:text-gray-300">
                About
            </div>
            <div className=" text-gray-700  dark:text-gray-300 mb-3">
                {'This app is designed for fast, collaborative note-taking.'}
            </div>
            <div className="text-2xl text-gray-700 mb-2 dark:text-gray-300">
                Markdown Shortcuts
            </div>
            <div className=" text-gray-700  dark:text-gray-300 ">
                Here is a list of all markdown shortcuts supported
            </div>
            <ul className="mx-2 my-4">
                <li>{'# , ## , ### => headings'}</li>
                <li>{'``` => codeblock'}</li>
                <li>{'> => blockquote'}</li>
                <li>{'* , - or + => lists'}</li>
                <li>{'[] => checklists'}</li>
                <li>{'--- or *** => hr'}</li>
            </ul>
            <div className="text-2xl text-gray-700 mt-4 mb-2 dark:text-gray-300">
                Team stuff
            </div>
            <div className=" text-gray-700  dark:text-gray-300 mb-20">
                <ul>
                    <li>
                        Added members are added as "collaboraters", meaning they
                        would have access to edit the page but not change the
                        title or delete it or invite other members.
                    </li>
                    <li>
                        A Team menu will appear when you add users to a page,
                        and from there you can make them admins who will have
                        access to invite other users to the page and make them
                        admins.
                    </li>
                    <li>
                        Only the owners (the person who created the page) can
                        change title or delete the page.
                    </li>
                </ul>
            </div>
        </>
    );
};
const LogoutButton = ({ logout }) => {
    return (
        <div>
            <Button
                variant="outlined"
                color="warning"
                onClick={async () => {
                    await logout();
                }}
            >
                Logout
            </Button>
        </div>
    );
};

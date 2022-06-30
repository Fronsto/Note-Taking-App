import React, { useState, useEffect } from 'react';
import TeamMenu from './Team/TeamMenu';
import { useGetUsers } from '../graphql/sharedpage';
import { useParams } from 'react-router-dom';
import Loading from './Auth/Loading.jsx';
import EditorComp from './Blocks/EditorComp';
import initialValue from './Blocks/initialValue';
import { getAccessToken } from '../contexts/accessToken';
const io = require('socket.io-client');

function ViewArea({ currentPage, teamMenuState }) {
    const { pageId } = useParams();
    let pollInterval = 1000 * 60 * 60 * 24 * 7;
    if (currentPage && currentPage.isShared) pollInterval = 4000;
    const [getusers, usersRes] = useGetUsers(pageId, pollInterval);

    // get page data using rest
    const [pageContents, setPageContents] = useState(initialValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [socket, setSocket] = useState(null);
    const [accessToken, setAccessToken] = useState(() => getAccessToken());

    useEffect(() => {
        (async () => {
            setLoading(true);
            await getusers();
            setAccessToken(() => getAccessToken());
            if (usersRes.error) {
                setError(true);
                return;
            }
            const socket = io(process.env.REACT_APP_BACKEND_URL, {
                withCredentials: true,
                extraHeaders: {
                    Authorization: `Bearer ${accessToken}`,
                    'Page-Id': pageId,
                },
            });
            socket.on('connect_error', (err) => {
                setError(true);
                setAccessToken(() => getAccessToken());
            });
            socket.once('connect', () => {
                socket.emit('get-page-contents', ({ ok, page_contents }) => {
                    if (!ok) setError(true);
                    else {
                        setPageContents(page_contents);
                        setError(false);
                        setLoading(false);
                    }
                });
            });
            setSocket(socket);
        })();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [pageId]); // eslint-disable-line

    if (error) {
        return (
            <div className="flex flex-col h-screen mt-10 w-auto justify-center items-center dark:text-gray-400 opacity-60 text-4xl">
                <div className="text-4xl mb-2">{'Error :('}</div>
                <div>Try reloading the page in a few minutes</div>
            </div>
        );
    }

    if (usersRes.loading || !usersRes.data || loading) {
        return (
            <div className="flex flex-row justify-center items-center dark:text-gray-400 opacity-60 h-full">
                <Loading />
            </div>
        );
    }
    if (!usersRes.data.getUsersOfThisPage) {
        return null;
    }

    return (
        <>
            <EditorComp pageContents={pageContents} socket={socket} />
            <TeamMenu
                openState={teamMenuState}
                page={currentPage}
                users={usersRes.data.getUsersOfThisPage}
            />
        </>
    );
}
export default ViewArea;

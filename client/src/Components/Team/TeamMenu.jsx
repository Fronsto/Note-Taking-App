import { Button } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useMeQuery } from '../../graphql/auth';
import {
    useAddUserToTeam,
    useMakePrivate,
    useLeaveTeam,
    useSetAccessType,
    useRemoveUserFromTeam,
} from '../../graphql/sharedpage';
import Loading from '../Auth/Loading';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import { useEffect } from 'react';

const TeamMenu = ({ openState, page, users }) => {
    const { data } = useMeQuery();

    if (!page) return null;

    return (
        <div
            className={
                'team-sidebar ' +
                (openState ? 'translate-x-0' : 'translate-x-[19rem]')
            }
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {page.isShared && (
                <>
                    <TeamSection users={users} page={page} />
                    <Divider />
                </>
            )}
            {page.accessType === 1 && (
                <>
                    <AddUser />
                    <Divider />
                </>
            )}
            {page.isShared && (
                <>
                    {data.me.id === String(page.owner) ? (
                        <>
                            <MakePrivate />
                        </>
                    ) : (
                        <>
                            <LeaveTeam />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

const AddUser = () => {
    const { pageId } = useParams();
    const [value, setValue] = useState('');
    const [infoText, setInfoText] = useState('');
    const [addUserFn, { data, loading, error }] = useAddUserToTeam();
    const handleClick = async () => {
        const res = await addUserFn({
            variables: {
                email: value,
                pageId: pageId,
            },
        });
        if (res.data && res.data.addUserToTeam) {
            setInfoText(res.data.addUserToTeam.message);
            if (res.data.addUserToTeam.success) {
                setValue('');
            }
        }
    };
    return (
        <>
            <div className="text-lg text-gray-700 mb-2 dark:text-gray-300 font-semibold tracking-wide cursor-default">
                Add users to the team
            </div>
            <div className=" text-gray-500 text-sm tracking-wide p-[0.2rem] dark:text-gray-400 ">
                Enter email of the user you want to add
            </div>
            <input
                type="email"
                placeholder="email"
                className=" text-gray-500 outline-none rounded bg-gray-900 h-8 w-full p-[0.2rem] dark:text-gray-300 opacity-90"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <div className="my-2 mr-2 flex flex-row justify-start items-center">
                <Button
                    color="info"
                    variant="outlined"
                    size="small"
                    onClick={handleClick}
                    className="w-2/3"
                >
                    Add
                </Button>
                {loading && (
                    <div className="mx-4">
                        <Loading />
                    </div>
                )}
            </div>
            {infoText !== '' && (
                <div
                    onClick={() => setInfoText('')}
                    className="font-semibold ring-1 ring-orange-300  px-2 rounded tracking-wide text-gray-500 my-4 dark:text-gray-200  opacity-80 "
                >
                    {infoText + ' !'}
                </div>
            )}
        </>
    );
};
const MakePrivate = () => {
    const [makePrivateFn, { data, loading, error }] = useMakePrivate();
    const { pageId } = useParams();
    const handleClick = async () => {
        await makePrivateFn({
            variables: {
                pageId: pageId,
            },
        });
    };
    return (
        <>
            <div className="text-lg text-gray-700 mb-4 dark:text-gray-300 font-semibold tracking-wide cursor-default">
                Danger Zone
            </div>
            <div className="my-2 mr-2 flex flex-row justify-start items-center">
                <Button
                    color="warning"
                    variant="outlined"
                    className="w-2/3"
                    onClick={handleClick}
                >
                    Make Private
                </Button>
                {loading && (
                    <div className="mx-4">
                        <Loading />
                    </div>
                )}
            </div>
            <div className=" text-gray-500 text-sm tracking-wide my-1 dark:text-gray-400 ">
                This will remove all users from the team and make the page
                private.
            </div>
        </>
    );
};
const LeaveTeam = () => {
    const [leaveTeamFn, { data, loading, error }] = useLeaveTeam();
    const { pageId } = useParams();
    const navigate = useNavigate();
    const handleClick = async () => {
        await leaveTeamFn({
            variables: {
                pageId: pageId,
            },
        });
        navigate('/');
    };
    return (
        <>
            <div className="text-lg text-gray-700 mb-4 dark:text-gray-300 font-semibold tracking-wide cursor-default">
                Leave Team
            </div>
            <div className="my-2 mr-2 flex flex-row justify-start items-center">
                <Button
                    color="warning"
                    variant="outlined"
                    className="w-2/3"
                    onClick={handleClick}
                >
                    Leave
                </Button>
                {loading && (
                    <div className="mx-4">
                        <Loading />
                    </div>
                )}
            </div>
            <div className=" text-gray-500 text-sm tracking-wide my-1 dark:text-gray-400 ">
                After clicking this you will no longer be able to access this
                page.
            </div>
        </>
    );
};
const Divider = () => {
    return (
        <div className="w-full h-[2px] opacity-30 mt-8 mb-4 bg-gray-500 rounded-xl " />
    );
};
const TeamSection = ({ users, page }) => {
    const [loading, setLoading] = useState(false);
    return (
        <div className="exp-section">
            <div className="flex flex-row justify-between text-lg text-gray-700 mb-2 dark:text-gray-300 font-semibold tracking-wide cursor-default">
                <span>Team Members</span>
                {loading && <Loading />}
            </div>

            {users &&
                users.map((user) => (
                    <DisplayUser
                        key={user.id}
                        user={user}
                        page={page}
                        setLoading={setLoading}
                    />
                ))}
        </div>
    );
};
const DisplayUser = ({ user, page, setLoading }) => {
    const [menu, setMenu] = useState(false);
    const myref = useRef(null);
    const { data } = useMeQuery();
    useEffect(() => {
        function handleClickOutside(event) {
            if (myref.current && !myref.current.contains(event.target)) {
                setMenu(false);
            }
        }
        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [myref]);

    const [setAccTypeFn, setAccTypeRes] = useSetAccessType();
    const [removeUserFn, removeUserRes] = useRemoveUserFromTeam();

    const makeAdmin = async () => {
        setLoading(true);
        await setAccTypeFn({
            variables: {
                userId: Number(user.id),
                pageId: page.id,
                accessType: 1,
            },
        });
        setLoading(false);
    };
    const rmvAdmin = async () => {
        setLoading(true);
        await setAccTypeFn({
            variables: {
                userId: Number(user.id),
                pageId: page.id,
                accessType: 2,
            },
        });
        setLoading(false);
    };
    const rmvUser = async () => {
        setLoading(true);
        await removeUserFn({
            variables: {
                userId: Number(user.id),
                pageId: page.id,
            },
        });
        setLoading(false);
    };

    return (
        <div
            className={
                ' flex flex-row justify-between items-center p-2 rounded h-[3.5rem] group' +
                (menu
                    ? 'bg-gray-300 dark:bg-gray-700'
                    : ' hover:bg-gray-300 dark:hover:bg-gray-700')
            }
        >
            <div className="flex flex-col justify-between items-start">
                <h5 className={' mb-2  text-gray-900 dark:text-gray-300'}>
                    {user.username}
                </h5>
                <div className=" flex flex-row justify-start">
                    {user.id === String(page.owner) && <Tag text="Owner" />}
                    {user.accessType === 1 && <Tag text="Admin" />}
                </div>
            </div>
            {page.accessType === 1 &&
                user.id !== String(page.owner) &&
                user.id !== data.me.id && (
                    <div
                        ref={myref}
                        className={
                            'flex flex-col justify-between items-end rounded-lg p-1 transition-opacity duration-150 ease-in-out ' +
                            (menu
                                ? 'dark:bg-gray-900 bg-gray-400'
                                : 'opacity-50 group-hover:opacity-100 group-hover:brightness-110 dark:hover:bg-gray-900 hover:bg-gray-400')
                        }
                        onClick={() => setMenu(!menu)}
                    >
                        <ArrowDropDownCircleIcon className="dark:text-gray-400 text-gray-500" />
                        {menu && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className=" absolute shadow-[0_0_10px_5px_rgba(0,0,0,0.2)] dark:shadow-[0_0_10px_5px_rgba(0,0,0,0.6)] text-sm tracking-wide translate-y-6 bg-gray-300 dark:bg-gray-800 dark:text-gray-300 p-1 flex flex-col justify-start overflow-hidden rounded-lg z-50 w-[7.5rem]"
                            >
                                <div className="cursor-default p-1">
                                    Set access type
                                </div>
                                <div className="flex flex-row justify-center mb-1">
                                    <div className="w-5/6 h-[2px] bg-gray-700 " />
                                </div>
                                <div
                                    className="cursor-pointer dark:hover:bg-gray-700 p-1 rounded"
                                    onClick={makeAdmin}
                                >
                                    Admin
                                </div>
                                <div
                                    className="cursor-pointer dark:hover:bg-gray-700 p-1 rounded"
                                    onClick={rmvAdmin}
                                >
                                    Collaborator
                                </div>
                                <div
                                    className="cursor-pointer dark:hover:bg-gray-700 p-1 rounded text-red-400"
                                    onClick={rmvUser}
                                >
                                    Remove
                                </div>
                            </div>
                        )}
                    </div>
                )}
        </div>
    );
};
const Tag = ({ text }) => {
    return (
        <div className="font-semibold text-yellow-600 text-xs rounded-sm mx-1 tracking-wide p-[0.2rem] dark:text-yellow-400 bg-neutral-300 dark:bg-gray-900">
            {text}
        </div>
    );
};

export default TeamMenu;

import React, { useState, useEffect } from 'react';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ArticleIcon from '@mui/icons-material/Article';
import useDarkMode from '../hooks/useDarkMode';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { useMeQuery } from '../../graphql/auth';
import { useMarkFav, useChangeTitle, useDeletePage } from '../../graphql/page';
import useConstant from 'use-constant';
import { useAsync } from 'react-async-hook';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import Loading from '../Auth/Loading';
import { useNavigate, useParams } from 'react-router-dom';

const HeaderPane = ({ sidebarState, pageStuff, handleLoading, teamMenu }) => {
    const [loading, setLoading] = handleLoading;
    const [teamMenuOpen, setTeamMenuOpen] = teamMenu;
    const [currentPage, setCurrentPage] = pageStuff;
    const { data } = useMeQuery();
    return (
        <div
            className={
                'top-navigation ' +
                (sidebarState !== 'close'
                    ? 'w-[calc(100vw-280px)]'
                    : ' w-[calc(100vw-40px)] ')
            }
        >
            {currentPage && currentPage !== '404' ? (
                <>
                    <TitleIcon />
                    {String(currentPage.owner) === data.me.id ? (
                        <EditableTitle
                            page={currentPage}
                            setLoading={setLoading}
                        />
                    ) : (
                        <NonEditableTitle page={currentPage} />
                    )}
                    {loading && <LoadingMark />}
                    <MarkFav page={currentPage} setLoading={setLoading} />
                    {String(currentPage.owner) === data.me.id && (
                        <DeletePage
                            page={currentPage}
                            setPage={setCurrentPage}
                            setLoading={setLoading}
                        />
                    )}
                    <ThemeIcon />
                    <div
                        onClick={() => setTeamMenuOpen((x) => !x)}
                        className="cursor-pointer group opacity-80 mx-2 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300 text-sm tracking-wide font-semibold py-[0.2rem] px-2 border-2 border-gray-400 dark:border-gray-800 rounded-lg shadow"
                    >
                        {currentPage.isShared ? 'Team' : 'Share'}
                        <span
                            className={
                                'top-navigation-tooltip  w-20 -translate-x-[4.5rem]' +
                                (!teamMenuOpen && ' group-hover:scale-100')
                            }
                        >
                            {currentPage.isShared
                                ? 'View Team'
                                : 'Share this page with someone'}
                        </span>
                    </div>
                </>
            ) : (
                <ThemeIcon />
            )}
        </div>
    );
};

const LoadingMark = () => {
    return (
        <>
            <span className="top-navigation-icon mr-0">
                <Loading />
            </span>
        </>
    );
};
const MarkFav = ({ page, setLoading }) => {
    const [markFavFn, { data, loading, error }] = useMarkFav();
    const handleClick = async () => {
        setLoading(true);
        await markFavFn({
            variables: {
                pageId: page.id,
            },
        });
        setLoading(false);
    };
    return (
        <div className="top-navigation-icon group" onClick={handleClick}>
            {page.isFav ? (
                <>
                    <StarIcon className=" dark:text-yellow-600 text-yellow-400" />
                    <span className="top-navigation-tooltip group-hover:scale-100">
                        Unmark as Favorite
                    </span>
                </>
            ) : (
                <>
                    <StarBorderIcon className="" />
                    <span className="top-navigation-tooltip group-hover:scale-100">
                        Mark as Favorite
                    </span>
                </>
            )}
        </div>
    );
};

const DeletePage = ({ page, setLoading, setPage }) => {
    const navigate = useNavigate();
    const [deletePageFn, { data, loading, error }] = useDeletePage();
    // const [showConfirm, setShowConfirm] = React.useState(false);
    // const closeModal = () => setShowConfirm(false);
    // const deleteMenu = <p>Are you sure you want to delete this page?</p>;
    const handleDel = async () => {
        setLoading(true);
        setPage(null);
        await deletePageFn({
            variables: {
                pageId: page.id,
            },
        });
        setLoading(false);
        navigate('/');
    };
    return (
        <div className="top-navigation-icon group" onClick={handleDel}>
            <DeleteOutlineIcon />
            <span className="top-navigation-tooltip group-hover:scale-100">
                Delete Current Page.
            </span>
        </div>
    );
};

const ThemeIcon = () => {
    const [darkTheme, setDarkTheme] = useDarkMode();
    const handleMode = () => setDarkTheme(!darkTheme);
    const { pageId } = useParams();
    return (
        <div
            onClick={handleMode}
            className={'top-navigation-icon group ' + (!pageId ? ' mx-20' : '')}
        >
            {darkTheme ? (
                <>
                    <LightModeIcon />
                    <span className="top-navigation-tooltip group-hover:scale-100">
                        Change theme to Light
                    </span>
                </>
            ) : (
                <>
                    <DarkModeIcon />
                    <span className="top-navigation-tooltip group-hover:scale-100">
                        Change Theme to Dark
                    </span>
                </>
            )}
        </div>
    );
};

const TitleIcon = () => <ArticleIcon className="title-hashtag" />;
const NonEditableTitle = ({ page }) => {
    return <span className="title-text cursor-default">{page.title}</span>;
};

const EditableTitle = ({ page }) => {
    const [title, setTitle] = useState(page.title);
    const [changeTitleFn, { data, loading, error }] = useChangeTitle();
    useEffect(() => {
        if (!page) return;
        setTitle(page.title);
    }, [page.id]); // eslint-disable-line

    const changeTitle = async (newTitle, pageId) => {
        await changeTitleFn({
            variables: {
                pageId: pageId,
                title: newTitle,
            },
        });
    };
    const debouncedChangeTitle = useConstant(() =>
        AwesomeDebouncePromise(changeTitle, 1000)
    );

    const results = useAsync(async () => {
        if (title === '' || title === page.title) return {};
        else {
            return debouncedChangeTitle(title, page.id);
        }
    }, [title, debouncedChangeTitle]);

    const handleChange = async (e) => {
        setTitle(e.target.value);
    };

    return (
        <input
            type="text"
            placeholder="Title can't be empty!"
            value={title}
            onChange={handleChange}
            className="title-text"
        />
    );
};

export default HeaderPane;

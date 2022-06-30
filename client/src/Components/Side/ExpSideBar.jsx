import React, { useState, useEffect, useRef, useMemo } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ArrowRightSharpIcon from '@mui/icons-material/ArrowRightSharp';
import { useNavigate, useParams } from 'react-router-dom';
import { useAddPage } from '../../graphql/page';
function ExpSideBar({ sidebarState, pages, handleLoading }) {
    const [_, setLoading] = handleLoading;

    const favoritePages = useMemo(
        () => pages.filter((pg) => pg.isFav),
        [pages]
    );
    const privatePages = useMemo(
        () => pages.filter((pg) => !pg.isShared),
        [pages]
    );
    const sharedPages = useMemo(
        () => pages.filter((pg) => pg.isShared),
        [pages]
    );
    const [addPageFunction, { data, loading, error }] = useAddPage();
    const handleAddPage = async () => {
        setLoading(true);
        await addPageFunction();
        setLoading(false);
    };

    const [favExpanded, setfavExpanded] = useState(true);
    const [prpagesExpanded, setprpagesExpanded] = useState(true);
    const [shpagesExpanded, setshpagesExpanded] = useState(true);
    const sidebarRef = useRef(null);

    useEffect(() => {
        if (sidebarState === 'expandAll' || sidebarState === 'expandAll1') {
            setfavExpanded(true);
            setprpagesExpanded(true);
            setshpagesExpanded(true);
            return;
        } else if (sidebarState === 'fav' || sidebarState === 'fav1') {
            setfavExpanded(true);
            sidebarRef.current.scrollTo(0, 0);
            return;
        }
    }, [sidebarState]);

    return (
        <div
            className={
                'exp-sidebar ' +
                (sidebarState !== 'close' ? 'translate-x-0' : '-translate-x-64')
            }
        >
            <div ref={sidebarRef} className="exp-sidebar-container">
                {favoritePages.length !== 0 && (
                    <Section
                        state={[favExpanded, setfavExpanded]}
                        title="FAVORITES"
                        pages={favoritePages}
                    />
                )}
                <Section
                    state={[prpagesExpanded, setprpagesExpanded]}
                    title="PRIVATE"
                    pages={privatePages}
                />
                {sharedPages.length !== 0 && (
                    <Section
                        state={[shpagesExpanded, setshpagesExpanded]}
                        title="SHARED"
                        pages={sharedPages}
                    />
                )}
            </div>
            <AddPageButton onClick={handleAddPage} />
        </div>
    );
}
const Section = ({ state, title, pages, customRef }) => {
    const [expanded, setExpanded] = state;
    const { pageId } = useParams();
    return (
        <div className="exp-section" ref={customRef}>
            <div className="exp-dropdown-header">
                <DropDownIcon
                    onClick={() => setExpanded(!expanded)}
                    expanded={expanded}
                />
                <h5
                    onClick={() => setExpanded(!expanded)}
                    className={'exp-dropdown-header-text'}
                >
                    {title}
                </h5>
            </div>
            {expanded &&
                pages &&
                pages.map((page) => (
                    <Page
                        key={page.id}
                        page={page}
                        isSelected={pageId === page.id}
                    />
                ))}
        </div>
    );
};
const AddPageButton = ({ onClick }) => {
    const iconClass =
        'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-100 group-hover:text-gray-900';
    return (
        <div onClick={onClick} className="exp-add-page group">
            <AddIcon className={iconClass} fontSize="medium" />
            <span className="exp-page-text group-hover:text-gray-900 dark:group-hover:text-gray-300">
                Add Page
            </span>
        </div>
    );
};

const DropDownIcon = ({ expanded, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={
                'text-gray-500 cursor-pointer transition-all duration-150 ease-in-out ' +
                (expanded ? 'rotate-90 translate-x-[0.12rem]' : 'rotate-0')
            }
        >
            <ArrowRightSharpIcon fontSize="small" />
        </div>
    );
};

const Page = ({ page, isSelected }) => {
    const navigate = useNavigate();
    return (
        <div
            className={
                'exp-page group ' +
                (isSelected
                    ? ' bg-gray-300 dark:bg-gray-700'
                    : 'hover:bg-gray-300 dark:hover:bg-gray-700')
            }
            onClick={() => navigate(`/${page.id}`)}
        >
            <h5
                className={
                    'exp-page-text ' +
                    (isSelected && ' text-gray-900 dark:text-gray-300')
                }
            >
                {page.title}
            </h5>
        </div>
    );
};

export default ExpSideBar;

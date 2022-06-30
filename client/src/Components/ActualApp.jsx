import React, { useEffect, useState } from 'react';
import SideBar from './Side/SideBar.jsx';
import ViewArea from './ViewArea.jsx';
import ExpSideBar from './Side/ExpSideBar.jsx';
import { AnimatePresence } from 'framer-motion';
import Modal from './Modal/Modal.jsx';
import SettingsModal from './SettingsPage/SettingsModal.jsx';
import { useGetPages } from '../graphql/page.jsx';

import HeaderPane from './Side/Header.jsx';

import { useParams } from 'react-router-dom';

function ActualApp() {
    const modalStuff = useState(0);
    const [modalOpen, setModalOpen] = modalStuff;
    const closeModal = () => setModalOpen(0);
    const sidePaneStuff = useState('close');
    const [sidePaneOpened, setSidePaneOpen] = sidePaneStuff;

    const load = useState(false);

    const teamMenuOpen = useState(false);
    const pageStuff = useState(null);
    const [currentPage, setCurrentPage] = pageStuff;
    const { pageId } = useParams();

    const { data } = useGetPages();

    // To set the current page whenever the pageId changes
    useEffect(() => {
        if (!pageId || !data || !data.getPagesOfThisUser) {
            return setCurrentPage(null);
        }
        const page = data.getPagesOfThisUser.find((page) => page.id === pageId);
        if (!page) {
            return setCurrentPage('404');
        }
        setCurrentPage(page);
        return () => {
            setCurrentPage(null);
        };
    }, [pageId, setCurrentPage, data]); // eslint-disable-line

    return (
        <div className=" h-screen w-screen ">
            <SideBar
                handlePaneOpen={sidePaneStuff}
                handleModalOpen={modalStuff}
            />
            <ExpSideBar
                pages={data.getPagesOfThisUser}
                sidebarState={sidePaneOpened}
                pageStuff={pageStuff}
                handleLoading={load}
            />
            <div
                className={
                    'content-container ' +
                    (sidePaneOpened !== 'close' ? 'ml-[17.5rem]' : 'ml-10')
                }
            >
                <HeaderPane
                    sidebarState={sidePaneOpened}
                    pageStuff={pageStuff}
                    handleLoading={load}
                    teamMenu={teamMenuOpen}
                />
                {currentPage === null || currentPage === '404' ? (
                    <AlternateDisplay currentPage={currentPage} />
                ) : (
                    <ViewArea
                        teamMenuState={teamMenuOpen[0]}
                        currentPage={currentPage}
                    />
                )}
            </div>
            <AnimatePresence
                initial={false}
                exitBeforeEnter={true}
                onExitComplete={() => null}
            >
                {modalOpen && (
                    <Modal
                        modalOpen={modalOpen}
                        handleClose={closeModal}
                        content={<SettingsModal />}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const AlternateDisplay = ({ currentPage }) => {
    return (
        <div className="flex flex-col h-screen mt-10 w-auto justify-center items-center dark:text-gray-400 opacity-60 text-4xl">
            {currentPage === null && 'Hey!'}
            {currentPage === '404' && (
                <>
                    <div className="text-6xl mb-2">404 :/</div>
                    <div>Page not found</div>
                </>
            )}
        </div>
    );
};
export default ActualApp;

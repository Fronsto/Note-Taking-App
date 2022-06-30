import React from 'react';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import StarRateIcon from '@mui/icons-material/StarRate';
import SettingsIcon from '@mui/icons-material/Settings';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

function SideBar(props) {
    const [opened, setOpen] = props.handlePaneOpen;
    const [modalOpen, setModalOpen] = props.handleModalOpen;

    // functions for open and close modal

    return (
        <div className="sidebar">
            <div className="space-y-3 ">
                <ExpandIcon state={[opened, setOpen]} />
                <Divider />
                <SideBarIcon
                    state={[opened, setOpen]}
                    defaultTab={'fav'}
                    icon={<StarRateIcon />}
                    text="Fav"
                />
                <SideBarIcon
                    state={[opened, setOpen]}
                    defaultTab={'expandAll'}
                    icon={<StickyNote2Icon />}
                    text="Pages"
                />
            </div>
            <div className="space-y-3">
                <ModalIcon
                    state={[modalOpen, setModalOpen]}
                    icon={<QuestionMarkIcon />}
                    text="About / Help"
                    defaultTab={2}
                />
                <Divider />
                <ModalIcon
                    state={[modalOpen, setModalOpen]}
                    icon={<SettingsIcon />}
                    text="Settings"
                    defaultTab={1}
                />
            </div>
        </div>
    );
}

const ExpandIcon = ({ state: [opened, setOpen] }) => {
    return (
        <div
            className={
                'sidebar-icon  ' +
                (opened !== 'close' ? '-rotate-180' : 'rotate-0')
            }
            onClick={() => {
                setOpen((curr) =>
                    curr === 'close' ? (curr = 'open') : (curr = 'close')
                );
            }}
        >
            <KeyboardDoubleArrowRightIcon />
        </div>
    );
};

const SideBarIcon = ({ state: [opened, setOpen], defaultTab, icon, text }) => (
    <div
        className="sidebar-icon group"
        onClick={() => {
            opened === defaultTab
                ? setOpen(defaultTab + '1')
                : setOpen(defaultTab);
        }}
    >
        {icon}
        <span className="sidebar-tooltip group-hover:scale-100">{text}</span>
    </div>
);

const ModalIcon = ({
    state: [modalOpen, setModalOpen],
    icon,
    text,
    defaultTab,
}) => (
    <div
        className="sidebar-icon group"
        onClick={() => (modalOpen ? setModalOpen(0) : setModalOpen(defaultTab))}
    >
        {icon}
        <span className="sidebar-tooltip group-hover:scale-100">{text}</span>
    </div>
);

const Divider = () => <hr className="sidebar-hr" />;

export default SideBar;

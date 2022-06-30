import React, { useState, useRef, useEffect } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Range } from 'slate';
import {
    isBlockActive,
    isMarkActive,
    toggleBlock,
    toggleMark,
} from './Toggles';
import { Button, Icon, Menu, Portal } from './components';
import { motion } from 'framer-motion';

import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import CodeIcon from '@mui/icons-material/Code';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';

export const HoveringToolbar = () => {
    const ref = useRef<HTMLDivElement | null>();
    const selection_menu = useRef<HTMLSelectElement | null>(null);
    const editor = useSlate();
    const [isTypeMenuShown, setTypeMenu] = useState<boolean>(false);

    useEffect(() => {
        const el = ref.current;
        const { selection } = editor;

        if (!el) {
            return;
        }
        if (
            !selection ||
            !ReactEditor.isFocused(editor) ||
            Range.isCollapsed(selection) ||
            Editor.string(editor, selection) === ''
        ) {
            el.removeAttribute('style');
            return;
        }
        const FORMATS = [
            'paragraph',
            'heading-one',
            'heading-two',
            'heading-three',
            'block-quote',
            'code-blocks',
            'list-item',
            'check-list-item',
        ];
        // first check if multiple blocks are in selection
        if (selection.anchor.path[0] === selection.focus.path[0]) {
            setTypeMenu(true);
        } else {
            setTypeMenu(false);
        }
        if (isTypeMenuShown && selection_menu.current) {
            FORMATS.forEach((format) => {
                if (isBlockActive(editor, format)) {
                    selection_menu.current.value = format;
                }
            });
        }
        const domSelection = window.getSelection();
        const domRange = domSelection.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();
        // TODO take in account left and right window boundaries

        el.style.opacity = '1';
        el.style.top = `${rect.top - el.offsetHeight}px`;
        el.style.left = `${rect.left + rect.width / 2 - el.offsetWidth / 2}px`;
    }, [editor, editor.selection, isTypeMenuShown]);
    const iconSize = 'small';

    return (
        <Portal>
            <Menu ref={ref} className="toolbar">
                {isTypeMenuShown && (
                    <div className="  p-1 dark:text-gray-200 hover:dark:bg-[#555] border-r-[0.1rem] border-l-0 border-zinc-300 dark:border-zinc-700 ">
                        <motion.select
                            className="h-6 outline-none bg-inherit"
                            onChange={(e) => {
                                toggleBlock(editor, e.target.value);
                            }}
                            ref={selection_menu}
                        >
                            <option value="paragraph">Paragraph</option>
                            <option value="heading-one">Heading 1</option>
                            <option value="heading-two">Heading 2</option>
                            <option value="heading-three">Heading 3</option>
                            <option value="block-quote">Blockquote</option>
                            <option value="code-blocks">CodeBlock</option>
                            <option value="check-list-item">ToDo List</option>
                            <option value="list-item">Bulletted List</option>
                        </motion.select>
                    </div>
                )}
                <div className=" h-8 rounded-r-lg flex flex-row">
                    <FormatButton
                        format="bold"
                        icon={<FormatBoldIcon fontSize={iconSize} />}
                    />
                    <FormatButton
                        format="italic"
                        icon={<FormatItalicIcon fontSize={iconSize} />}
                    />
                    <FormatButton
                        format="underline"
                        icon={<FormatUnderlinedIcon fontSize={iconSize} />}
                    />
                    <FormatButton
                        format="code"
                        icon={<CodeIcon fontSize={iconSize} />}
                    />
                    <FormatButton
                        format="strikethrough"
                        icon={<FormatStrikethroughIcon fontSize={iconSize} />}
                    />
                    <FormatButton
                        format="highlight"
                        icon={<FormatPaintIcon fontSize={iconSize} />}
                    />
                </div>
            </Menu>
        </Portal>
    );
};
const FormatButton = ({ format, icon }) => {
    const editor = useSlate();
    return (
        <Button
            className=" px-1 align-middle h-full hover:dark:bg-[#555] "
            active={isMarkActive(editor, format)}
            onMouseDown={(event) => {
                event.preventDefault();
                toggleMark(editor, format);
            }}
        >
            <Icon className="h-full py-[0.18rem] align-middle">{icon}</Icon>
        </Button>
    );
};

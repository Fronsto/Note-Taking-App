import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Slate,
    Editable,
    withReact,
    useFocused,
    useSelected,
    useSlateStatic,
    ReactEditor,
    useReadOnly,
} from 'slate-react';
import {
    Editor,
    Transforms,
    Range,
    createEditor,
    Element as SlateElement,
    Descendant,
    Node,
    Operation,
} from 'slate';
import {
    isBlockActive,
    isMarkActive,
    toggleBlock,
    toggleMark,
} from './Toggles';
import { withShortcuts } from './withShortcuts';
import { withHistory } from 'slate-history';
import isHotkey from 'is-hotkey';
import { useMeQuery } from '../../graphql/auth';
import { Button } from './components';

import { HoveringToolbar } from './Toolbar';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
const HOTKEYS = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
    'mod+shift+s': 'strikethrough',
    'mod+shift+h': 'highlight',
};

const MD_SHORTCUTS = {
    '*': { type: 'bold', regex: /(?<=\W|^)\*(\S.*\S)\*$/ },
    _: { type: 'italic', regex: /(?<=\W|^)_(\S.*\S)_$/ },
    '`': { type: 'code', regex: /(?<=\W|^)`(\S.*\S)`$/ },
    '=': { type: 'highlight', regex: /(?<=\W|^)=(\S.*\S)=$/ },
    '~': { type: 'strikethrough', regex: /(?<=\W|^)~(\S.*\S)~$/ },
};
const MARKS = [
    'bold',
    'italic',
    'underline',
    'code',
    'strikethrough',
    'highlight',
];
const SINGLE_LINE_STUFF = ['heading-one', 'heading-two', 'heading-three'];
const MULTI_LINE_STUFF = [
    'list-item',
    'check-list-item',
    'code-blocks',
    'block-quote',
];
const SHOULDNT_BE_EMPTY = [...SINGLE_LINE_STUFF, ...MULTI_LINE_STUFF];

const SlateEditor = ({ pageContents, socket }) => {
    const [value, setValue] = useState<Descendant[]>(pageContents);
    const renderElement = useCallback((props) => <Element {...props} />, []);
    const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
    const editorRef = useRef<Editor>();
    if (!editorRef.current)
        editorRef.current = withShortcuts(
            withReact(withHistory(createEditor()))
        );
    const editor = editorRef.current;

    const remote = useRef(false);
    const SAVE_INTERVAL_MS = 2000;
    const [editorON, seteditorON] = useState<boolean>(true);

    useEffect(() => {
        if (socket == null) return;

        const interval = setInterval(() => {
            socket.emit('save-document', editor.children);
        }, SAVE_INTERVAL_MS);

        return () => {
            clearInterval(interval);
        };
    }, [socket]); //eslint-disable-line

    // GET
    const { data } = useMeQuery();
    useEffect(() => {
        if (socket == null) return;

        const applyOps = async (ops: Operation[]) => {
            ops.forEach((op: Operation) => {
                editor.apply(op);
            });
        };
        const handler = async ({
            userId,
            ops,
        }: {
            userId: string;
            ops: Operation[];
        }) => {
            if (data.me.id !== userId) {
                remote.current = true;
                await applyOps(ops);
                remote.current = false;
            }
        };
        socket.on('receive-changes', handler);
        return () => {
            socket.off('receive-changes', handler);
        };
    }, [socket]); // eslint-disable-line

    // SEND
    // Can't do it in useeffect since can't get operations

    return (
        <Slate
            editor={editor}
            value={value}
            onChange={(value) => {
                setValue(value);
                const ops = editor.operations.filter((op: Operation) => {
                    if (op) {
                        return op.type !== 'set_selection';
                    }
                    return false;
                });

                if (ops.length && !remote.current && socket) {
                    socket.emit('send-changes', { userId: data.me.id, ops });
                }
            }}
        >
            <HoveringToolbar />
            <Editable
                readOnly={!editorON}
                renderLeaf={renderLeaf}
                renderElement={renderElement}
                placeholder="Type Something..."
                spellCheck={false}
                autoFocus
                onKeyUp={(event) => {
                    if (event.key === 'Enter') {
                        removeMarks(editor);
                    }
                    for (const format in MD_SHORTCUTS) {
                        if (event.key === format) {
                            const { selection } = editor;
                            // if only if its a normal cursor typed stuff
                            if (selection && Range.isCollapsed(selection)) {
                                // first get the path
                                const block = Editor.above(editor, {
                                    match: (n) => Editor.isBlock(editor, n),
                                });
                                const path = block ? block[1] : [];
                                // node might be useful, if in final refactoring I don't use Node then delete this
                                const node = Node.get(editor, path);
                                if (Editor.isVoid(editor, node)) {
                                    return;
                                }
                                const { anchor } = selection;
                                const start = Editor.start(editor, path);
                                const range = { anchor, focus: start };
                                const beforeText = Editor.string(editor, range);
                                // const textInNode = Node.string(node);

                                // we run regex over the beforeText
                                const matchedStr = beforeText.match(
                                    MD_SHORTCUTS[format].regex
                                );
                                if (!matchedStr) return;
                                // if it is a match, prevent default
                                event.preventDefault();
                                const searchMatch = matchedStr[0];
                                const revDistance = searchMatch.length - 1;
                                const forwdDistance = revDistance - 1;

                                // The way I accomplish the task is as follows:
                                //    first delete the last mark
                                //    move the cursor back
                                //    delete the special char
                                //    move cursor back to original position
                                //    select this thing, toggle mark, deselect
                                Transforms.delete(editor, {
                                    at: editor.selection,
                                    distance: 1,
                                    unit: 'character',
                                    reverse: true,
                                });
                                Transforms.move(editor, {
                                    distance: revDistance,
                                    unit: 'character',
                                    reverse: true,
                                });
                                const getLocation = editor.selection;
                                Transforms.delete(editor, {
                                    at: editor.selection,
                                    distance: 1,
                                    unit: 'character',
                                });
                                Transforms.move(editor, {
                                    distance: forwdDistance,
                                    unit: 'character',
                                    reverse: false,
                                });
                                Transforms.setSelection(editor, {
                                    focus: getLocation.focus,
                                });
                                toggleMark(editor, MD_SHORTCUTS[format].type);
                                Transforms.collapse(editor, { edge: 'end' });
                            }
                        }
                    }
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Tab') {
                        // insert 4 spaces instead
                        event.preventDefault();
                        Transforms.insertText(editor, '    ');
                    }
                    if (event.key === 'Enter') {
                        SHOULDNT_BE_EMPTY.some((stuff) => {
                            if (isBlockActive(editor, stuff)) {
                                // check if its empty
                                const isEmpty = isBlockEmpty(editor);
                                // for things that shouldn't be empty, if current one is, we'll change to para
                                if (isEmpty) {
                                    event.preventDefault();
                                    toggleBlock(editor, 'paragraph');
                                } else {
                                    // it ain't empty: check if enter should insert para
                                    // for things that should occupy only one line
                                    SINGLE_LINE_STUFF.some((stuff) => {
                                        if (isBlockActive(editor, stuff)) {
                                            event.preventDefault();
                                            const { selection } = editor;
                                            if (selection) {
                                                // first get the path
                                                const block = Editor.above(
                                                    editor,
                                                    {
                                                        match: (n) =>
                                                            Editor.isBlock(
                                                                editor,
                                                                n
                                                            ),
                                                    }
                                                );
                                                const path = block
                                                    ? block[1]
                                                    : [];
                                                // then will check if its the start of the block
                                                if (
                                                    Range.isCollapsed(
                                                        selection
                                                    ) &&
                                                    Editor.isStart(
                                                        editor,
                                                        selection.anchor,
                                                        path
                                                    )
                                                ) {
                                                    // Yes: add a paragraph above
                                                    toggleBlock(
                                                        editor,
                                                        'paragraph'
                                                    );
                                                    Editor.insertBreak(editor);
                                                    toggleBlock(editor, stuff);
                                                } else {
                                                    // No: add a paragraph below
                                                    Editor.insertBreak(editor);
                                                    toggleBlock(
                                                        editor,
                                                        'paragraph'
                                                    );
                                                }
                                            }
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    });
                                }
                                return true;
                            } else {
                                return false;
                            }
                        });
                    }
                    // this if for ctrl shortcuts
                    for (const hotkey in HOTKEYS) {
                        if (isHotkey(hotkey, event as any)) {
                            event.preventDefault();
                            const mark = HOTKEYS[hotkey];
                            toggleMark(editor, mark);
                        }
                    }
                }}
                // this is for events fired directly on DOM
                onDOMBeforeInput={(e: Event) => {
                    const event = e as InputEvent;
                    // this is in case browser uses different type of input
                    switch (event.inputType) {
                        case 'formatBold':
                            event.preventDefault();
                            return toggleMark(editor, 'bold');
                        case 'formatItalic':
                            event.preventDefault();
                            return toggleMark(editor, 'italic');
                        case 'formatUnderline':
                            event.preventDefault();
                            return toggleMark(editor, 'underline');
                        case 'formatStrikeThrough':
                            event.preventDefault();
                            return toggleMark(editor, 'strikethrough');
                        /// Later complete this
                    }
                }}
            />
        </Slate>
    );
};

// Leafs are different from elements in the sense that they change properties of elements
const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.code) {
        children = <code className="inline-code">{children}</code>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    if (leaf.strikethrough) {
        children = <span className="line-through">{children}</span>;
    }
    if (leaf.highlight) {
        children = (
            <span className=" dark:text-yellow-600 text-yellow-600">
                {children}
            </span>
        );
    }

    return <span {...attributes}>{children}</span>;
};

const Element = ({ attributes, children, element }: any) => {
    const props = { attributes, children, element };
    switch (element.type) {
        case 'block-quote':
            return <blockquote {...attributes}>{children}</blockquote>;
        case 'bulleted-list':
            return <ul {...attributes}>{children}</ul>;
        case 'heading-one':
            return <h1 {...attributes}>{children}</h1>;
        case 'heading-two':
            return <h2 {...attributes}>{children}</h2>;
        case 'heading-three':
            return <h3 {...attributes}>{children}</h3>;
        case 'list-item':
            return <li {...attributes}>{children}</li>;
        case 'code-blocks':
            return (
                <p className="codeblocks" {...attributes}>
                    <code>{children}</code>
                </p>
            );
        case 'line-break':
            return <CustomHR {...props} />;
        case 'image':
            return <Image {...props} />;
        case 'video':
            return <VideoElement {...props} />;
        case 'check-list-item':
            return <ChecklistItemElement {...props} />;
        default:
            return <p {...attributes}>{children}</p>;
    }
};

const isBlockEmpty = (editor) => {
    const { selection } = editor;
    if (!selection) {
        return false;
    }
    if (!Range.isCollapsed(selection)) {
        return false;
    }
    const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
    });
    // block: an array, first part- current obj desc, second part- location within the page
    const path = block ? block[1] : [];
    const [start, end] = Editor.edges(editor, path);
    if (start.offset === end.offset) return true;
    else return false;
};
const removeMarks = (editor) => {
    MARKS.forEach((stuff) => {
        if (isMarkActive(editor, stuff)) {
            toggleMark(editor, stuff);
        }
    });
};

const ChecklistItemElement = ({ attributes, children, element }) => {
    const editor = useSlateStatic();
    const readOnly = useReadOnly();
    const { checked } = element;
    return (
        <div {...attributes} className="flex flex-row items-center my-[0.1rem]">
            <span contentEditable={false} className="mr-[0.75em]">
                <input
                    type="checkbox"
                    className="custom-checkbox-object"
                    checked={checked}
                    onChange={(event) => {
                        const path = ReactEditor.findPath(editor, element);
                        const newProperties: Partial<SlateElement> = {
                            checked: event.target.checked,
                        };
                        Transforms.setNodes(editor, newProperties, {
                            at: path,
                        });
                    }}
                />
            </span>
            <span
                contentEditable={!readOnly}
                suppressContentEditableWarning
                className={
                    'flex-1 transition ' +
                    (!checked ? '' : 'line-through opacity-60')
                }
            >
                {children}
            </span>
        </div>
    );
};

const VideoElement = ({ attributes, children, element }) => {
    const editor = useSlateStatic();
    const { url } = element;
    return (
        <div {...attributes}>
            <div contentEditable={false}>
                <div
                    style={{
                        padding: '56% 0 0 0',
                        position: 'relative',
                    }}
                >
                    <iframe
                        title={url}
                        src={`${url}?title=0&byline=0&portrait=0`}
                        frameBorder="0"
                        style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                        }}
                    />
                </div>
                <UrlInput
                    url={url}
                    onChange={(val) => {
                        const path = ReactEditor.findPath(editor, element);
                        const newProperties: Partial<SlateElement> = {
                            url: val,
                        };
                        Transforms.setNodes<SlateElement>(
                            editor,
                            newProperties,
                            {
                                at: path,
                            }
                        );
                    }}
                />
            </div>
            {children}
        </div>
    );
};
const UrlInput = ({ url, onChange }) => {
    const [value, setValue] = React.useState(url);
    return (
        <input
            value={value}
            onClick={(e) => e.stopPropagation()}
            className="w-full mt-1 dark:bg-gray-600 dark:border-black border-2 rounded-sm"
            onChange={(e) => {
                const newUrl = e.target.value;
                setValue(newUrl);
                onChange(newUrl);
            }}
        />
    );
};

// Important to note: how to deal with void elements
// first div
//      second div, content-editable false
//            element you want
//      second div closed
//
//      {childer} // IMP
// first div closed

const CustomHR = ({ attributes, children, element }) => {
    // const editor = useSlateStatic();
    // const _path = ReactEditor.findPath(editor, element);
    const selected = useSelected();
    const focused = useFocused();

    return (
        <div {...attributes}>
            <div
                contentEditable={false}
                className={
                    'my-3 border-y-4' +
                    (selected && focused
                        ? ' border-blue-500 border-opacity-50'
                        : ' border-gray-100 dark:border-gray-900 transition-colors duration-200')
                }
            >
                <hr className="bg-gray-400 dark:bg-gray-700 border-y-gray-300 transition-colors duration-200 dark:border-y-gray-700" />
            </div>
            {children}
        </div>
    );
};
const Image = ({ attributes, children, element }) => {
    const editor = useSlateStatic();
    const path = ReactEditor.findPath(editor, element);

    const selected = useSelected();
    const focused = useFocused();
    return (
        <div {...attributes}>
            <div
                contentEditable={false}
                className={
                    'group relative m-1 mt-2 h-fit w-fit border-2 ' +
                    (selected && focused
                        ? ' border-blue-400'
                        : ' border-gray-200 dark:border-gray-800')
                }
            >
                <img src={element.url} alt="" className="block max-w-full " />
                <Button
                    active
                    onClick={() => {
                        Transforms.removeNodes(editor, { at: path });
                    }}
                    className={
                        'top-2 right-2 z-4 rounded bg-white absolute transform-all duration-150 ease-in-out ' +
                        (selected && focused
                            ? 'opacity-60'
                            : 'group-hover:opacity-50 opacity-0')
                    }
                >
                    <DeleteOutlineIcon className="text-gray-700" />
                </Button>
            </div>
            {children}
        </div>
    );
};

export default SlateEditor;

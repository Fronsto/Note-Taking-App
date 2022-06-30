import {
    Editor,
    Transforms,
    Range,
    Point,
    Element as SlateElement,
} from 'slate';
import { ImageElement } from './custom-types';

import imageExtensions from 'image-extensions';
import isUrl from 'is-url';

const SHORTCUTS = {
    '-': 'list-item',
    '*': 'list-item',
    '+': 'list-item',
    '>': 'block-quote',
    '#': 'heading-one',
    '##': 'heading-two',
    '###': 'heading-three',
    '---': 'line-break',
    '***': 'line-break',
    '[]': 'check-list-item',
    '[x]': 'check-list-item-checked',
    '[X]': 'check-list-item-checked',
    '```': 'code-blocks',
};
// This is handling a lot of stuff here
const withShortcuts = (editor) => {
    const { insertData, isVoid, deleteBackward, insertText } = editor;
    // Void elements: those that'll not _hold_ content
    // basically all the non-typable stuff
    editor.isVoid = (element) => {
        return element.type === 'image' ||
            element.type === 'video' ||
            element.type === 'line-break'
            ? true
            : isVoid(element);
    };
    // This is for inserting images
    editor.insertData = (data) => {
        const text = data.getData('text/plain');

        if (isImageUrl(text)) {
            insertImage(editor, text);
        } else {
            insertData(data);
        }
    };

    // inserting text
    editor.insertText = (text) => {
        const { selection } = editor;
        if (text === ' ' && selection && Range.isCollapsed(selection)) {
            const { anchor } = selection;
            const block = Editor.above(editor, {
                match: (n) => Editor.isBlock(editor, n),
            });
            const path = block ? block[1] : [];
            const start = Editor.start(editor, path);
            const range = { anchor, focus: start };
            const beforeText = Editor.string(editor, range);
            const type = SHORTCUTS[beforeText];
            if (type) {
                Transforms.select(editor, range);
                Transforms.delete(editor);
                var newProperties: Partial<SlateElement> = {
                    type,
                };
                if (type === 'check-list-item-checked')
                    newProperties = {
                        type: 'check-list-item',
                        checked: true,
                    };
                if (type === 'check-list-item')
                    newProperties = {
                        type,
                        checked: false,
                    };

                Transforms.setNodes<SlateElement>(editor, newProperties, {
                    match: (n) => Editor.isBlock(editor, n),
                });
                if (type === 'line-break') {
                    Transforms.insertNodes<SlateElement>(editor, {
                        type: 'paragraph',
                        children: [{ text: '' }],
                    });
                }
                return;
            }
        }

        insertText(text);
    };

    // what this does is that pressing backspace won't delete the element
    // rather it would change it to para if its not already. Else,(its a para) noraml delete
    editor.deleteBackward = (...args: any) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const match = Editor.above(editor, {
                match: (n) => Editor.isBlock(editor, n),
            });

            if (match) {
                const [block, path] = match;
                const start = Editor.start(editor, path);

                if (
                    !Editor.isEditor(block) &&
                    SlateElement.isElement(block) &&
                    block.type !== 'paragraph' &&
                    Point.equals(selection.anchor, start)
                ) {
                    const newProperties: Partial<SlateElement> = {
                        type: 'paragraph',
                    };
                    Transforms.setNodes(editor, newProperties);

                    return;
                }
            }

            deleteBackward(...args);
        }
    };

    return editor;
};

const insertImage = (editor, url) => {
    const text = { text: '' };
    const image: ImageElement = { type: 'image', url, children: [text] };
    Transforms.insertNodes(editor, image);
    // Transforms.insertNodes<SlateElement>(editor, {
    //     type: 'paragraph',
    //     children: [{ text: '' }],
    // });
};

const isImageUrl = (url) => {
    if (!url) return false;
    if (!isUrl(url)) return false;
    const ext = new URL(url).pathname.split('.').pop();
    return imageExtensions.includes(ext);
};

export { withShortcuts };

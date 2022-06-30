import { Editor, Transforms, Text, Element as SlateElement } from 'slate';

const toggleBlock = (editor, format) => {
    var newProperties: Partial<SlateElement> = {
        type: format,
    };
    if (format === 'check-list-item')
        newProperties = {
            type: format,
            checked: false,
        };
    Transforms.setNodes<SlateElement>(editor, newProperties);
};
const isBlockActive = (editor, format) => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === format,
        })
    );

    return !!match;
};

const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format);
    Transforms.setNodes(
        editor,
        { [format]: isActive ? null : true },
        { match: Text.isText, split: true }
    );
};

const isMarkActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
        match: (n) => n[format] === true,
        mode: 'all',
    });
    return !!match;
};

export { isBlockActive, isMarkActive, toggleBlock, toggleMark };

import { Descendant, BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export type BlockQuoteElement = { type: 'block-quote'; children: Descendant[] };

export type BulletedListElement = {
    type: 'bulleted-list';
    children: Descendant[];
};

export type CheckListItemElement = {
    type: 'check-list-item';
    checked: boolean;
    children: Descendant[];
};
export type EditableVoidElement = {
    type: 'editable-void';
    children: EmptyText[];
};

export type HeadingElement = { type: 'heading'; children: Descendant[] };

export type HeadingTwoElement = { type: 'heading-two'; children: Descendant[] };
export type HeadingThreeElement = {
    type: 'heading-three';
    children: Descendant[];
};

export type ImageElement = {
    type: 'image';
    url: string;
    children: EmptyText[];
};

export type LinkElement = { type: 'link'; url: string; children: Descendant[] };

export type ButtonElement = { type: 'button'; children: Descendant[] };

export type ListItemElement = { type: 'list-item'; children: Descendant[] };

export type ParagraphElement = { type: 'paragraph'; children: Descendant[] };

export type TitleElement = { type: 'title'; children: Descendant[] };

export type VideoElement = {
    type: 'video';
    url: string;
    children: EmptyText[];
};

type CustomElement =
    | BlockQuoteElement
    | BulletedListElement
    | CheckListItemElement
    | EditableVoidElement
    | HeadingElement
    | HeadingTwoElement
    | HeadingThreeElement
    | ImageElement
    | LinkElement
    | ButtonElement
    | ListItemElement
    | ParagraphElement
    | TitleElement
    | VideoElement;

export type CustomText = {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    text: string;
};

export type EmptyText = {
    text: string;
};

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module 'slate' {
    interface CustomTypes {
        Editor: CustomEditor;
        Element: CustomElement;
        Text: CustomText | EmptyText;
    }
}

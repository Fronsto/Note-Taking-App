const GuidePage: any = [
    { type: 'heading-one', children: [{ text: 'Welcome' }] },
    {
        type: 'paragraph',
        children: [
            { text: 'This app is designed for ' },
            { text: 'fast', italic: true, bold: true },
            { text: ', ', bold: true },
            { text: 'collaborative', italic: true, bold: true },
            { text: ' ' },
            { text: 'note taking', code: true },
            {
                text: '. Text can be formatted freely, just as the text written on this page. The app is collaborative, meaning',
            },
            {
                text: ' you can add other users to work on the page simultaneously',
                bold: true,
                highlight: true,
            },
            { bold: true, text: ' ' },
            {
                text: 'with you! Check out the share option in the top right corner.',
            },
        ],
    },
    { type: 'line-break', children: [{ text: '' }] },
    {
        type: 'paragraph',
        children: [
            {
                text: 'To support fast formatting, this app has certain markdown shortcuts that you can use to format text. Try it out! for example, put a ',
            },
            { text: '#', code: true },
            {
                text: ' at the start of some paragraph and press space to make it a heading. Below is a list of markdown shortcuts currently supported.',
            },
        ],
    },
    { type: 'heading-three', children: [{ text: 'Markdown shortcuts' }] },
    {
        type: 'paragraph',
        children: [{ text: 'Use these at the start of a paragraph: ' }],
    },
    {
        type: 'list-item',
        children: [
            { text: '#', code: true },
            { text: ' , ' },
            { text: '##', code: true },
            { text: ' , ' },
            { text: '###', code: true },
            { text: ' => headings' },
        ],
    },
    {
        type: 'list-item',
        children: [{ text: '```', code: true }, { text: ' => codeblock' }],
    },
    {
        type: 'list-item',
        children: [{ text: '>', code: true }, { text: ' => blockquote' }],
    },
    {
        type: 'list-item',
        children: [
            { text: '*', code: true },
            { text: ' , ' },
            { text: '-', code: true },
            { text: ' or ' },
            { text: '+', code: true },
            { text: ' => lists' },
        ],
    },
    {
        type: 'list-item',
        children: [{ text: '[]', code: true }, { text: ' => checklists' }],
    },
    {
        type: 'list-item',
        children: [
            { text: ' ' },
            { text: '---', code: true },
            { text: ' or ' },
            { text: '***', code: true },
            { text: ' => hr' },
        ],
    },
    { type: 'line-break', children: [{ text: '' }] },
    {
        type: 'paragraph',
        children: [
            { text: 'To make text ' },
            { text: 'bold', bold: true },
            { text: ', ' },
            { text: 'italic', italic: true },
            { text: ', ' },
            { text: 'highlighted', highlight: true },
            { text: ', ' },
            { text: 'underlined', underline: true },
            { text: ', ' },
            { text: 'strikethrough', strikethrough: true },
            { text: ' or ' },
            { text: 'code', code: true },
            {
                text: ', select text then either use keyboard shortcuts or the hovering toolbar.',
            },
        ],
    },
    { type: 'paragraph', children: [{ text: '' }] },
    {
        type: 'paragraph',
        children: [
            { text: 'You can also ' },
            { text: 'insert images by pasting their URL', italic: true },
            { text: '!' },
        ],
    },
    { type: 'paragraph', children: [{ text: '' }] },
    {
        type: 'image',
        url: 'https://cdn.pixabay.com/photo/2015/06/19/21/24/avenue-815297_960_720.jpg',
        children: [{ text: '' }],
    },
    { type: 'paragraph', children: [{ text: '' }] },
];
export default GuidePage;

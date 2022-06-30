import React from 'react';
import SlateEditor from './slate-editor';

const EditorComp = ({ pageContents, socket }) => {
    return (
        <div className="write-container">
            <div className="write-box">
                <div className="min-h-[2rem] m-2">
                    <SlateEditor pageContents={pageContents} socket={socket} />
                </div>
            </div>
        </div>
    );
};

export default EditorComp;

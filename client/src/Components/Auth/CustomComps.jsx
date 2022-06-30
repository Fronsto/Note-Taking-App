import React from 'react';
import Image from '../../Assets/diagmonds.png';
export default function Card({ children, title, subtitle }) {
    return (
        <div
            style={{ backgroundImage: `url(${Image})` }}
            className=" items-center h-screen w-screen bg-black text-gray-200 px-4 py-3 flex flex-col justify-center sm:py-8"
        >
            <div className="relative py-3 w-[min(90%,26rem)] text-center">
                <div className="text-4xl ">{title}</div>
                {subtitle && <div className="my-2 text-xl">{subtitle}</div>}

                <div className=" mt-4 bg-gray-700 shadow-xl sm:rounded-lg text-left">
                    <div className="h-2 bg-indigo-400 sm:rounded-t-lg"></div>
                    <div className="pt-6 pb-2 px-8">{children}</div>
                </div>
            </div>
        </div>
    );
}

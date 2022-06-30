import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Auth/CustomComps';
export default function HomePage() {
    return (
        <Card
            title="Welcome"
            subtitle="This is a Collaborative Note Taking App"
        >
            <div className=" m-2 p-4 flex-col justify-center items-baseline">
                <div className=" flex justify-center items-baseline font-bold text-white w-full rounded-t-lg">
                    <Link
                        to="/login"
                        className="text-center hover:underline  text-xl p-2"
                    >
                        Continue with Email
                    </Link>
                </div>
            </div>
        </Card>
    );
}

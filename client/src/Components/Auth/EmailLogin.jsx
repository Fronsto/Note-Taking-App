import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './CustomComps';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation, MEQUERY } from '../../graphql/auth';
import Loading from './Loading';
import { setAccessToken } from '../../contexts/accessToken';

export default function EmailLogin() {
    const navigate = useNavigate();
    const emailRef = useRef();
    const passwordRef = useRef();
    const [loginFunction, { data, loading, error }] = useLoginMutation();
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        const returnedLoad = await loginFunction({
            variables: {
                email,
                password,
            },
            update: (cache, { data }) => {
                if (!data) {
                    return null;
                }
                cache.writeQuery({
                    query: MEQUERY,
                    data: {
                        me: data.login.user,
                    },
                });
            },
        }).catch((err) => {
            console.log(err);
            if (err.message === 'Invalid Email/Password')
                setStatus(err.message);
            else setStatus('Error Occured, please try again');
        });
        if (!error && returnedLoad && returnedLoad.data) {
            setAccessToken(returnedLoad.data.login.accessToken);
            navigate('/');
        }
    };
    return (
        <Card title="Login">
            <form onSubmit={handleSubmit}>
                {loading ? (
                    <Loading />
                ) : (
                    status && (
                        <label className=" text-red-200 block font-semibold text-center">
                            {status}
                        </label>
                    )
                )}
                <label className="login-label">Email</label>
                <input
                    type="email"
                    placeholder="Email"
                    className="login-input"
                    ref={emailRef}
                />
                <label className="login-label">Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    className="login-input"
                    ref={passwordRef}
                />
                <div className=" flex justify-center items-baseline">
                    <button className="login-button">Login</button>
                </div>
                <div className="text-sm flex justify-center items-baseline mt-2">
                    <Link className="hover:underline" to="/register">
                        SignUp Instead
                    </Link>
                </div>
            </form>
        </Card>
    );
}

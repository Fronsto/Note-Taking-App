import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './CustomComps';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../graphql/auth';
import Loading from './Loading';

export default function EmailLogin() {
    const navigate = useNavigate();
    const emailRef = useRef();
    const passwordRef = useRef();
    const usernameRef = useRef();
    const [registerFunction, { data, loading, error }] = useRegisterMutation();
    const [status, setStatus] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        const username = usernameRef.current.value;

        const returnedLoad = await registerFunction({
            variables: { password, email, username },
        });
        if (error) {
            setStatus('Error Occured, please try again');
        } else if (returnedLoad && returnedLoad.data.register.ok) {
            setStatus('Registered Successfully ');
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } else if (returnedLoad && returnedLoad.data.register.ok === false) {
            setStatus(returnedLoad.data.register.message);
        }
    };
    return (
        <Card title="SignUp">
            <form onSubmit={handleSubmit}>
                {loading ? (
                    <Loading />
                ) : (
                    status && (
                        <label className="block font-semibold text-center">
                            {status}
                        </label>
                    )
                )}

                <label className="login-label">Username</label>
                <input
                    type="text"
                    placeholder="username"
                    className="login-input"
                    ref={usernameRef}
                    required
                />
                <label className="login-label">Email</label>
                <input
                    type="email"
                    placeholder="Email"
                    className="login-input"
                    ref={emailRef}
                    required
                />
                <label className="login-label">Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    className="login-input"
                    ref={passwordRef}
                    required
                />
                <div className=" flex justify-center items-baseline">
                    <button className="login-button">Register</button>
                </div>
                <div className="text-sm mt-3 flex-col text-center justify-center align-middle items-center">
                    Already have an account?<br></br>
                    <Link className="hover:underline " to="/login">
                        Login Instead
                    </Link>
                </div>
            </form>
        </Card>
    );
}

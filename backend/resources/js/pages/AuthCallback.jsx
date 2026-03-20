import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userJson = params.get('user');

        if (token && userJson) {
            const user = JSON.parse(decodeURIComponent(userJson));
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (!user.profile_completed) {
                navigate('/complete-profile');
            } else if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } else {
            navigate('/login?error=auth_failed');
        }
    }, [location, navigate]);

    return (
        <Layout>
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Finalizing Sign In...</h2>
                <p className="text-slate-500 italic mt-2">Just a moment while we set things up.</p>
            </div>
        </Layout>
    );
};

export default AuthCallback;

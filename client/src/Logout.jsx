import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { useEffect } from "react";

export default function Logout(){
    const cookies = Cookies.get();
    const navigate = useNavigate();
    useEffect(() => {
        Cookies.set('username', null);
        Cookies.set('token', null);
        navigate('/login');
    }, [])
}
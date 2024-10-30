import { useDispatch } from "react-redux";
import { sessionActions } from "../store";
import { useEffect, useState } from "react";
import { useCatch, useEffectAsync } from "../reactHelper";
import { useNavigate } from "react-router-dom";
import { handleLoginTokenListeners } from "../common/components/NativeInterface";

const companyLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [companyname, setCompany] = useState()
    const handleCheck = () => {
        if (users.length > 0) {
            if (users.filter(item => item.company === companyname).length > 0) {
                localStorage.setItem("company", companyname)
                navigate("/login")

            }
            else {
                throw Error("error:");
            }
        }
        else {

        }
    }
    const [timestamp, setTimestamp] = useState(Date.now());
    useEffect(() => {
        const listener = (token) => handleTokenLogin(token);
        handleLoginTokenListeners.add(listener);
        return () => handleLoginTokenListeners.delete(listener);
    }, []);
    const handleTokenLogin = useCatch(async (token) => {
        const response = await fetch(ui
            `/api/session?token=${encodeURIComponent(token)}`
        );
        if (response.ok) {
            const user = await response.json();
            dispatch(sessionActions.updateUser(user));
            navigate("/");
        } else {
            throw Error(await response.text());
        }
    });
    const [users, setUsers] = useState()
    useEffectAsync(async () => {
        // setLoading(true);
        try {
            const response = await fetch("/api/users");
            if (response.ok) {
                const newUser = await response.json()
                setUsers(newUser)
            } else {
                throw Error(await response.text());
            }
        } finally {
            // setLoading(false);
        }
    }, [timestamp]);
    return (
        <div>

            <input type="text" value={companyname} onChange={(e) => setCompany(e.target.value)} />
            <button onClick={handleCheck}>check</button>

        </div>
    )
}
export default companyLogin;
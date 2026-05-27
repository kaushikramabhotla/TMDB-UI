import {
    createContext,
    useContext,
    useEffect,
    useState
}
from "react";

import * as signalR
from "@microsoft/signalr";

const SignalRContext =
    createContext();

export function SignalRProvider({children})
{
    const [connection, setConnection] = useState(null);

    const [notifications, setNotifications] = useState([]);

    const [notifCount, setNotifCount] = useState(0);

    useEffect(() => {

        const token =
            localStorage.getItem("token");
            if(!token)
                return;

        const decoded =
            JSON.parse(
                atob(token.split('.')[1])
            );

        const userId =
            decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ];

        const newConnection =
            new signalR
                .HubConnectionBuilder()
                .withUrl(`${import.meta.env.VITE_API_URL}/chatHub`, {accessTokenFactory: () => token})
                .withAutomaticReconnect()
                .build();
        setConnection(newConnection);

    }, []);

    useEffect(() => {
        if (!connection)
            return;

        connection.start()
            .then(async () => {
                console.log("SignalR Connected");

                const token = localStorage.getItem("token");

                if (token)
                {
                    const decoded =JSON.parse(atob(token.split('.')[1]));
                    const userId =
                        decoded[
                          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                        ];

                    await connection.invoke("JoinUserGroup",userId);
                    console.log("Joined group:", userId);

                    connection.on(
                    "ReceiveNotification",
                    (type, message) => {
                        console.log(
                            "NOTIFICATION RECEIVED"
                        );
                        setNotifications(prev => [
                            ...prev,
                            {
                                type,
                                message,
                                id: Date.now()
                            }
                        ]);
                        setNotifCount(prev =>prev + 1);
                    }
                );
                }
            })
            .catch(err => {
                console.error(err);
            });

    }, [connection]);

    return (

        <SignalRContext.Provider value={{connection, notifications, notifCount}}>
            {children}
        </SignalRContext.Provider>
    );
}

export function useSignalR()
{
    return useContext(SignalRContext);
}
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
    const [connection,
        setConnection] =
            useState(null);

    useEffect(() => {
        const newConnection =
            new signalR
                .HubConnectionBuilder()
                .withUrl("https://localhost:7022/chatHub")
                .withAutomaticReconnect()
                .build();
        setConnection(
            newConnection
        );

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
                    console.log(
                        "Joined group:",
                        userId
                    );
                }
            })
            .catch(err => {
                console.error(err);
            });

    }, [connection]);

    return (

        <SignalRContext.Provider value={connection}>
            {children}
        </SignalRContext.Provider>
    );
}

export function useSignalR()
{
    return useContext(SignalRContext);
}
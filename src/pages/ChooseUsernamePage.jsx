import { useState }
  from "react";

import axios from "axios";

import "../styles/ChooseUsernamePage.css";

function ChooseUsernamePage()
{
  const [username, setUsername]
    = useState("");

  const [error, setError]
    = useState("");

  const saveUsername = async () =>
{
  try
  {
    setError("");

    if (username.trim().length < 6)
    {
      setError("Username must be at least 3 characters");
      return;
    }

    const token =
      localStorage.getItem("token");

    await axios.put(
      "https://localhost:7022/api/users/username",
      {
        username
      },
      {
        headers:
        {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Update JWT in localStorage
    const decodedGoogleUser =
      JSON.parse(localStorage.getItem("googleUser"));

    decodedGoogleUser.username = username;

    localStorage.setItem("googleUser",JSON.stringify(decodedGoogleUser));

    window.location.href ="/movies";
  }

  catch (err)
  {
    if (err.response?.data)
    {
      setError(err.response.data);
    }

    else
    {
      setError("Something went wrong");
    }
  }
};

  return (

    <div className="choose-username-page">

      <div className="choose-username-overlay">

        <div className="choose-username-card">

          <h1 className="choose-username-title">

            Choose Username

          </h1>

          <p className="choose-username-subtitle">

            Pick a unique username
            so friends can find you.

          </p>

          <input
            type="text"

            className="username-input"

            value={username}

            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }

            placeholder="Enter username"
          />

          {
            error && (

              <p className="username-error">

                {error}

              </p>
            )
          }

          <button
            className="username-button"

            onClick={saveUsername}
          >
            Continue
          </button>

        </div>

      </div>

    </div>
  );
}

export default ChooseUsernamePage;
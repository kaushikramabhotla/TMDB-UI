import { useEffect, useState } from "react";

import "../styles/ProfilePage.css";
import MovieNavBar from "../components/MovieNavBar";

function ProfilePage() {

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [bio, setBio] = useState("");
  
  const [user, setUser] = useState(null);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {

    const storedUser =
      localStorage.getItem("googleUser");

    if (storedUser) {

      const user = JSON.parse(storedUser);
      setUser(user);

      setName(user.name || "");

      setEmail(user.email || "");
    }

  }, []);

  return (

    <div className="profile-page">
        <MovieNavBar
            user={user}
            showProfileMenu={showProfileMenu}
            setShowProfileMenu={setShowProfileMenu}
        />

      <div className="profile-card">

        <h1>
          Your Profile
        </h1>

        <div className="profile-field">

          <label>
            Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

        </div>

        <div className="profile-field">

          <label>
            Email
          </label>

          <input
            className="readonly-input"
            type="text"
            value={email}
            disabled
            title="Email cannot be changed"
          />

        </div>

        <div className="profile-field">

          <label>
            Bio
          </label>

          <textarea
            rows="4"
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
          />

        </div>

        <button className="save-btn">

          Save Changes

        </button>

      </div>

    </div>
  );
}

export default ProfilePage;
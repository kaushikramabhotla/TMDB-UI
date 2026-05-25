import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../styles/LoginPage.css";

function LoginPage() {

  const handleSuccess = async (credentialResponse) => {

    try {

      const idToken = credentialResponse.credential;

      // 🔥 Login to backend
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/google",
        idToken,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const jwt = res.data;

      //  Save JWT
      localStorage.setItem("token", jwt);
      const decodedJwt = jwtDecode(jwt);

      const googleUser = jwtDecode(idToken);

      localStorage.setItem(
        "googleUser",
        JSON.stringify(googleUser)
      );

      if (!decodedJwt.username)
      {
        window.location.href =
          "/choose-username";
      }

      else
      {
        window.location.href =
          "/movies";
      }

    }
    catch (err) {
      console.error("Login failed", err);
    }
  };

  return (

  <div className="login-page">

    <div className="login-overlay">

      <div className="login-card">

        <h1 className="login-logo">
          TMDB
        </h1>

        <p className="login-subtitle">

          Discover movies,
          build favorites,
          and chat with movie lovers.

        </p>

        <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%"
      }}
    >

      <div
        style={{
          transform: "scale(1.15)"
        }}
      >

        <GoogleLogin
          onSuccess={handleSuccess}

          onError={() =>
            console.log("Login Failed")
          }

          theme="filled_black"

          size="large"

          shape="pill"
        />

  </div>

</div>

      </div>

    </div>

  </div>
);
}

export default LoginPage;
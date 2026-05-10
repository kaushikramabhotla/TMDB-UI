import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function LoginPage() {

  const handleSuccess = async (credentialResponse) => {

    try {

      const idToken = credentialResponse.credential;

      // 🔥 Login to backend
      const res = await axios.post(
        "https://localhost:7022/api/auth/google",
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

      const googleUser = jwtDecode(idToken);

      localStorage.setItem(
        "googleUser",
        JSON.stringify(googleUser)
      );

      //  redirect
      window.location.href = "/movies";

    }
    catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="login-container">

      <h1>Login</h1>

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
      />

    </div>
  );
}

export default LoginPage;
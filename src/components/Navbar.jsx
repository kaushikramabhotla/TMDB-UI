import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <h2 className="logo">TMDB</h2>

      <button
        className="nav-btn"
        onClick={() => navigate("/login")}
      >
        Login
      </button>
    </nav>
  );
}

export default Navbar;
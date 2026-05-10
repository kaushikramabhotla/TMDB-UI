import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <div className="hero">
      <div className="overlay" />

      <div className="hero-content">
        <h1>Unlimited Movies, TV Shows & More</h1>
        <p>Discover trending movies powered by TMDB</p>
        <button onClick={() => navigate("/movies")}>
          Explore Movies
        </button>
      </div>
    </div>
  );
}

export default Hero;
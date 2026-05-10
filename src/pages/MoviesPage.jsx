import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function MoviesPage() {

  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {

    const fetchMovies = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "https://localhost:7022/api/movies/top10",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setMovies(res.data);

      }
      catch (err) {
        console.error(err);
      }
    };

    const token = localStorage.getItem("token");

    const storedUser =
          localStorage.getItem("googleUser");

    if (storedUser) {

      setUser(JSON.parse(storedUser));
    }

    fetchMovies();

  }, []);

  const searchMovies = async (query) => {

    setSearch(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://localhost:7022/api/movies/search?query=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSearchResults(res.data);

    }
    catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = async (movieId) => {

    try {

      const token = localStorage.getItem("token");

      await axios.put(
        "https://localhost:7022/api/movies",
        movieId,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
          }
        }
      );

      setMovies(prevMovies =>
        prevMovies.map(movie =>
          movie.id === movieId
            ? { ...movie, isFavorite: !movie.isFavorite }
            : movie
        )
      );

    }
    catch (err) {
      console.error(err);
    }
  };

return (

  <div className="movies-page">

    {/* 🔥 NAVBAR */}

    <div className="navbar">

      <h2 className="logo">
        TMDB
      </h2>

      <div className="profile-section"onClick={() =>setShowProfileMenu(!showProfileMenu)}>
        {
          user?.picture && (

            <img
              className="profile-pic"
              src={user.picture}
              alt="profile"
            />

          )
        }

        <span>{user?.name}</span>
                {
          showProfileMenu && (

            <div className="profile-dropdown">

              <div className="dropdown-item">
                Favorites
              </div>

              <div className="dropdown-item">
                Profile
              </div>

              <div
                className="dropdown-item"
                onClick={() => {

                  localStorage.clear();

                  window.location.href = "/login";
                }}
              >
                Logout
              </div>

            </div>

          )
        }

      </div>

    </div>

    {/* 🔥 MAIN TITLE */}

    <h1 className="page-title">
      Discover Movies
    </h1>

    {/* 🔥 SEARCH */}

    <div className="search-container">

      <input
        className="search-bar"
        type="text"
        placeholder="Search movies..."
        value={search}
        onChange={(e) => searchMovies(e.target.value)}
      />

      {
        searchResults.length > 0 && (

          <div className="search-dropdown">

            {searchResults.map((movie) => (

              <div
                key={movie.id}
                className="search-item"
              >

                {
                  movie.posterPath && (

                    <img
                      className="search-poster"
                      src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
                      alt={movie.title}
                    />

                  )
                }

                <span>{movie.title}</span>

              </div>

            ))}

          </div>
        )
      }

    </div>

    {/* 🔥 TOP 10 */}

    <h2 className="page-title">
      Top 10 Movies
    </h2>

    <div className="movies-row">

      {movies.map((movie) => (

        <div
          className="movie-card"
          key={movie.id}
        >

          <img
            className="movie-poster"
            src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
            alt={movie.title}
          />

          <h3>{movie.title}</h3>

          <p>⭐ {movie.voteCount}</p>

          <button
            onClick={() => toggleFavorite(movie.id)}
          >
            {movie.isFavorite ? "❤️" : "🤍"}
          </button>

        </div>

      ))}

    </div>

  </div>
);
}

export default MoviesPage;
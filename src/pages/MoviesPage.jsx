import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import MovieNavBar from "../components/MovieNavBar";
import ChatWidget from "../components/ChatWidget";

function MoviesPage() {

  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSessionPopup, setShowSessionPopup] = useState(false);
  const [movieToShare, setMovieToShare] = useState(null);

  useEffect(() => {

    const fetchMovies = async () => {

      try {

        const token = localStorage.getItem("token");

        if (token) {

          const decoded = jwtDecode(token);

          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {

            alert("Session expired. Please login again.");

            localStorage.clear();

            window.location.href = "/login";

            return;
          }
        }

        const storedUser =
              localStorage.getItem("googleUser");

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/movies/top10`,
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

  useEffect(() => {

  const timer = setTimeout(() => {

    if (search.trim() !== "") {

      searchMovies(search);
    }

    else {

      setSearchResults([]);
    }

  }, 80);

  return () => clearTimeout(timer);

  }, [search]);

  useEffect(() => {

  const token = localStorage.getItem("token");

  if (!token)
    return;

  const decoded = jwtDecode(token);

  const expiryTime = decoded.exp * 1000;

  const warningTime =
    expiryTime - (2 * 60 * 1000);

  const timeout =
    warningTime - Date.now();

  if (timeout > 0) {

    setTimeout(() => {

      setShowSessionPopup(true);

    }, timeout);
  }

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
        `${import.meta.env.VITE_API_URL}/api/movies/search?query=${query}`,
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
        `${import.meta.env.VITE_API_URL}/api/movies`,
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

  const shareMovie = (movie) =>
  {
    console.log("Sharing movie:", movie);

    setMovieToShare(movie);
  };

return (

  <div className="movies-page">

    <MovieNavBar
      user={user}
      showProfileMenu={showProfileMenu}
      setShowProfileMenu={setShowProfileMenu}
    />

    <h1 className="page-title">
      Discover Movies
    </h1>

    <SearchBar
      search={search}
      setSearch={setSearch}
      searchResults={searchResults}
    />

    <h2 className="page-title">
      Top 10 Movies
    </h2>

    <div className="movies-row">

      {movies.map((movie) => (

        <MovieCard
          key={movie.id}
          movie={movie}
          toggleFavorite={toggleFavorite}
          shareMovie={shareMovie}
        />

      ))}

    </div>

    {
      showSessionPopup && (

        <div className="session-popup">

          <h2>
            Session Expiring Soon
          </h2>

          <p>
            Your session will expire soon.
          </p>

          <div className="session-buttons">

            <button
              onClick={() =>
                setShowSessionPopup(false)
              }
            >
              Continue
            </button>

            <button
              onClick={() => {

                localStorage.clear();

                window.location.href = "/login";
              }}
            >
              Logout
            </button>

          </div>

        </div>
      )
    }
  <ChatWidget />
  </div>
);

}

export default MoviesPage;
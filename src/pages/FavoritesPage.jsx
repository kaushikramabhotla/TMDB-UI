import { useEffect, useState } from "react";

import axios from "axios";

import MovieCard from "../components/MovieCard";

import MovieNavBar from "../components/MovieNavBar";

function FavoritesPage() {

  const [movies, setMovies] = useState([]);

  const [user, setUser] = useState(null);

  const [showProfileMenu, setShowProfileMenu]
    = useState(false);



    const toggleFavorite = async (movieId) => {

    try {

        const token =
        localStorage.getItem("token");

        await axios.put(
        "https://localhost:7022/api/movies",
        movieId,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
            }
        }
        );

        setMovies(prev =>
        prev.filter(m => m.id !== movieId)
        );

    }
    catch (err) {

        console.error(err);
    }
    };

  useEffect(() => {

    const fetchFavorites = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const res = await axios.get(
          "https://localhost:7022/api/users/favorites",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setMovies(res.data);
        console.log(res.data);

      }
      catch (err) {

        console.error(err);
      }
    };

    const storedUser =
      localStorage.getItem("googleUser");

    if (storedUser) {

      setUser(JSON.parse(storedUser));
    }

    fetchFavorites();

  }, []);

  return (

    <div className="movies-page">

      <MovieNavBar
        user={user}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
      />

      <h1 className="page-title">
        Your Favorites
      </h1>

      <div className="movies-row">
        {movies.map((movie) => (

          <MovieCard
            key={movie.id}
            movie={movie}
            toggleFavorite = {toggleFavorite}
          />
        ))}
      </div>

    </div>
  );
}

export default FavoritesPage;
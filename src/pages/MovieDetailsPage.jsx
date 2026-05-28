import "../styles/MovieDetailsPage.css";
import MovieNavBar from "../components/MovieNavBar";
import FriendsChat from "../components/FriendsChat";

import { useEffect, useState }
  from "react";

import { useParams }
  from "react-router-dom";

import axios from "axios";

function MovieDetailsPage() {

  const { id } = useParams();

  const [movie, setMovie] = useState(null);

  const [user, setUser] = useState(null);

  const [showProfileMenu,setShowProfileMenu] = useState(false);

  const [showChat, setShowChat] = useState(false);
  

  useEffect(() => {

    const fetchMovie =
      async () => {

        try {

          const token =
            localStorage.getItem("token");

          const res =
            await axios.get(

              `${import.meta.env.VITE_API_URL}/api/movies/${id}`,

              {
                headers: {
                  Authorization:
                    `Bearer ${token}`
                }
              }
            );

          setMovie(res.data);
        }

        catch (err) {

          console.error(err);
        }
      };

    fetchMovie();

    }, [id]);

    useEffect(() => {

    const storedUser =
        localStorage.getItem("googleUser");

    if (storedUser) {

        setUser(
        JSON.parse(storedUser)
        );
    }

    }, []);

  if (!movie)
  {
    return <h1>Loading...</h1>;
  }

return (

  <div className="movie-details-page">

    <MovieNavBar
        user={user}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
    />

        <div
        className="backdrop-section"

        style={{
            backgroundImage:
            `url(https://image.tmdb.org/t/p/original${movie.backdropPath})`
        }}
        >

      <div className="backdrop-overlay">

        <div className="movie-content">

          <img
            className="details-poster"

            src={
              `https://image.tmdb.org/t/p/w500${movie.posterPath}`
            }

            alt={movie.title}
          />

          <div className="movie-info">

            <h1 className="movie-title">
              {movie.title}
            </h1>

            <p className="movie-overview">

              {movie.overview}

            </p>

            <div className="movie-meta">

              <div className="meta-box">

                <span className="meta-label">
                  Rating
                </span>

                <span className="meta-value">
                  ⭐ {movie.voteAverage?.toFixed(1)}
                </span>

              </div>

              <div className="meta-box">

                <span className="meta-label">
                  Runtime
                </span>

                <span className="meta-value">
                  🕒 {movie.runtime} mins
                </span>

              </div>

              <div className="meta-box">

                <span className="meta-label">
                  Release Date
                </span>

                <span className="meta-value">
                  📅 {movie.releaseDate}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

    <FriendsChat/>

  </div>
);
}

export default MovieDetailsPage;
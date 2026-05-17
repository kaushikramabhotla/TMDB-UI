import { useNavigate } from "react-router-dom";

function MovieCard({ movie, toggleFavorite }) {

  const navigate = useNavigate();
  return (

    <div className="movie-card">

      <img
        className="movie-poster"
        src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
        alt={movie.title}
        onClick={() =>
          navigate(`/movies/${movie.id}`)
        }
      />

      <h3>{movie.title}</h3>

      <p>⭐ {movie.voteCount}</p>

      <button
        onClick={() => toggleFavorite(movie.id)}
      >
        {movie.isFavorite ? "❤️" : "🤍"}
      </button>


    </div>
  );
}

export default MovieCard;
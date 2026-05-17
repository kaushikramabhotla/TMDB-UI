function MovieCard({ movie, toggleFavorite }) {

  return (

    <div className="movie-card">

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
  );
}

export default MovieCard;
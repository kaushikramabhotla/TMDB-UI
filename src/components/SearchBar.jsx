function SearchBar({
    search,
    setSearch,
    searchResults
})
{
    return (
    <div className="search-container">

      <input
        className="search-bar"
        type="text"
        placeholder="Search movies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
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
    )
}

export default SearchBar
function MovieNavbar({
  user,
  showProfileMenu,
  setShowProfileMenu
}) {

  return (

    <div className="navbar">

      <h2
        className="logo"
        onClick={() => {
          window.location.href = "/movies";
        }}
      >
        TMDB
      </h2>

      <div
        className="profile-section"
        onBlur={() => setShowProfileMenu(false)}
        tabIndex={0}
      >
        <div
          className="profile-trigger"
          onClick={() =>
            setShowProfileMenu(!showProfileMenu)
          }
        >
          {
            user?.picture && (
              <img
                className="profile-pic"
                src={user.picture}
                alt="profile"
              />

            )
          }
          <span>
            {user?.name}
          </span>

        </div>

        {
          showProfileMenu && (

            <div className="profile-dropdown">

              <div
                className="dropdown-item"
                onClick={() => {

                  window.location.href = "/favorites";
                }}>
                Favorites
              </div>

              <div
                className="dropdown-item"
                onClick={() => {
                  window.location.href = "/profile";
                }}>
                Profile
              </div>

              <div
                className="dropdown-item"
                onClick={() => {

                  localStorage.clear();

                  window.location.href = "/login";
                }}>
                Logout
              </div>
            </div>
          )
        }
      </div>

    </div>
  );
}

export default MovieNavbar;
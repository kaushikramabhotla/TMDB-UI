import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MoviesPage from "./pages/MoviesPage";
import LoginPage from "./pages/LoginPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import MovieDetailsPage from "./pages/MovieDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/favorites" element={<FavoritesPage />}/>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/movies/:id" element={<MovieDetailsPage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
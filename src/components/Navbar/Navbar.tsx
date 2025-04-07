import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../../assets/Icon.png";

const Navbar = () => {
  const { session } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center gap-4">
              <img src={Icon} alt="Logo" className="w-6 h-6" />
              <span className="text-xl font-bold text-gray-800">
                Die Rezeptwelt
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/recipes"
              className="text-gray-600 hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Rezepte
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Über Uns
            </Link>
            {session ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  {session.user.user_metadata.avatar_url ? (
                    <img
                      src={session.user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                  ) : (
                    <svg
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                  {session.user.user_metadata.username || "Profile"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-yellow-600 text-white hover:bg-yellow-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-yellow-600 text-white hover:bg-yellow-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

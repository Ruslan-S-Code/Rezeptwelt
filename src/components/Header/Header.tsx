import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg
            className="w-8 h-8 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6 3V2h8v1h2a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h2zm0 2H4v12h12V5h-2v1H6V5zm1 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xl font-bold">Rezepte</span>
        </Link>

        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Startseite
          </Link>
          <Link
            to="/rezepte"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Rezepte
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;

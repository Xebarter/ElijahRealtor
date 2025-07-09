import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-extrabold text-red-600 dark:text-red-400 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-2">
          Oops! Page not found.
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-primary text-white dark:bg-blue-600 hover:bg-primary/80 dark:hover:bg-blue-700 font-medium py-2 px-4 rounded transition duration-200"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}

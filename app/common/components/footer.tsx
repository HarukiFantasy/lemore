import { Link } from "react-router";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-bold text-gray-900">
              LE:MORE
            </Link>
            <p className="mt-2 text-sm text-gray-600">
              Sustainable living through secondhand marketplace and AI-powered decluttering.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              🇹🇭 Thailand | 🇰🇷 Korea
            </p>
          </div>

          {/* Marketplace */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Marketplace
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/secondhand/browse-listings" className="text-sm text-gray-600 hover:text-gray-900">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link to="/secondhand/post-listing" className="text-sm text-gray-600 hover:text-gray-900">
                  Sell Items
                </Link>
              </li>
              <li>
                <Link to="/my/liked-products" className="text-sm text-gray-600 hover:text-gray-900">
                  My Likes
                </Link>
              </li>
            </ul>
          </div>

          {/* Let Go Buddy */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Let Go Buddy
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/let-go-buddy" className="text-sm text-gray-600 hover:text-gray-900">
                  Start Decluttering
                </Link>
              </li>
              <li>
                <Link to="/let-go-buddy/analysis" className="text-sm text-gray-600 hover:text-gray-900">
                  My Analysis
                </Link>
              </li>
              <li>
                <Link to="/let-go-buddy/challenge-calendar" className="text-sm text-gray-600 hover:text-gray-900">
                  Challenge Calendar
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Legal & Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:contact@lemore.life" className="text-sm text-gray-600 hover:text-gray-900">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-sm text-gray-500">
                © {currentYear} LE:MORE. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <Link to="/privacy-policy" className="text-xs text-gray-400 hover:text-gray-600">
                  Privacy
                </Link>
                <Link to="/terms-of-service" className="text-xs text-gray-400 hover:text-gray-600">
                  Terms
                </Link>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <p className="text-xs text-gray-400">
                Made with ❤️ for sustainable living
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
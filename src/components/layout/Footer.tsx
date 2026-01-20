import { Link } from 'react-router-dom'
import { Briefcase, Github, Mail, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-secondary-50 dark:bg-secondary-950 border-t border-secondary-200 dark:border-secondary-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Vakans.uz</span>
            </Link>
            <p className="text-secondary-600 dark:text-secondary-400 text-sm">
              O'zbekiston ish bozori platformasi. Ish qidiring yoki ishchi toping!
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Sahifalar
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors text-sm">
                  Barcha ishlar
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors text-sm">
                  Ro'yxatdan o'tish
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors text-sm">
                  Kirish
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Huquqiy
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors text-sm">
                  Maxfiylik siyosati
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors text-sm">
                  Foydalanish shartlari
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Bog'lanish
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 text-sm">
                <Phone className="h-4 w-4" />
                +998 90 123 45 67
              </li>
              <li className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 text-sm">
                <Mail className="h-4 w-4" />
                info@vakans.uz
              </li>
              <li>
                <a
                  href="https://github.com/thexojisaid-lab/Vakans.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors text-sm"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-secondary-200 dark:border-secondary-800">
          <p className="text-center text-secondary-500 text-sm">
            © {new Date().getFullYear()} Vakans.uz. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  )
}


import "./globals.css";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav className="bg-white shadow-md py-4 px-6 w-full fixed top-0 z-50">
        <div className="text-2xl font-bold text-indigo-600 tracking-wide flex items-center justify-center">
          Face Tracking Application
        </div>
             </nav>
        </header>
        {children}
        <footer></footer>
      </body>
    </html>
  );
}

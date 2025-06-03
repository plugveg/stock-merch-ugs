import { Github, Globe, Instagram, Twitter } from "lucide-react";
import { useNavigate } from "react-router";

export default function NavBar({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md py-3 fixed top-0 z-10 w-full">
      <div className="container mx-auto px-3 flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-indigo-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          StockMerch by UGS
        </h1>
        <div className="flex flex-wrap gap-2 break-all justify-end">
          <a
            href="https://github.com/plugveg/stock-merch-ugs"
            className="text-gray-600 hover:text-indigo-600 transition-colors self-center"
            aria-label="GitHub Repository"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={24} />
          </a>
          <a
            href="https://twitter.com/UnitedGlowStick"
            className="text-gray-600 hover:text-indigo-600 transition-colors self-center"
            aria-label="Twitter Profile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter size={24} />
          </a>
          <a
            href="https://www.instagram.com/united_glowstick/"
            className="text-gray-600 hover:text-indigo-600 transition-colors self-center"
            aria-label="Instagram Profile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={24} />
          </a>
          <a
            href="https://www.helloasso.com/associations/united-glowstick"
            className="text-gray-600 hover:text-indigo-600 transition-colors self-center"
            aria-label="PlugVeg Website"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe size={24} />
          </a>
          {children}
        </div>
      </div>
      {/* <NavigationMenu className="mt-2 justify-self-center">
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link to="/">
              <NavigationMenuLink className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                Page d'accueil
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/products">
              <NavigationMenuLink className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                Produits
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/dashboards">
              <NavigationMenuLink className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                Tableaux de bord
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu> */}
    </nav>
  );
}

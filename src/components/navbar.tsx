import { Github } from "lucide-react";
import { useNavigate } from "react-router";

export default function NavBar({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-indigo-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          StockMerch by UGS
        </h1>
        <div className="flex flex-wrap gap-4 break-all">
          <a
            href="https://github.com/plugveg/stock-merch-ugs"
            className="text-gray-600 hover:text-indigo-600 transition-colors self-center"
            aria-label="GitHub Repository"
          >
            <Github size={24} />
          </a>
          {children}
        </div>
      </div>
    </nav>
  );
}

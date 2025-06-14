import { useCurrentUser } from "./hooks/useCurrentUser";
import { Button } from "./components/ui/button";
import NavBar from "./components/navbar";
import Footer from "./components/footer";
import { UserButton } from "@clerk/clerk-react";
import { RoleBadge } from "./components/role-badge";
import { Link } from "react-router";

export default function Dashboards() {
  const { userInConvex } = useCurrentUser();

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 to-purple-100 flex flex-col">
      <NavBar>
        <UserButton aria-label="User menu" />
        {/* Badge rôle */}
        {userInConvex?.role && <RoleBadge role={userInConvex.role} />}
        {/* Texte identifiant */}
        <span className="content-center">
          Connecté en tant que {userInConvex?.nickname ?? userInConvex?.email}
        </span>
      </NavBar>
      <main className="flex-1 p-4 md:p-8 content-center h-full">
        <Content />
      </main>
      <Footer />
    </div>
  );
}

function Content() {
  const { userInConvex } = useCurrentUser();
  const isAdmin =
    userInConvex?.role === "Administrator" ||
    userInConvex?.role === "Board of directors";

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center ">
        <h1 className="text-3xl font-bold text-gray-700 mb-2">
          Bienvenue sur les dashboards,{" "}
          {userInConvex?.nickname ?? userInConvex?.email}!
        </h1>
        <p className="text-lg text-gray-500">
          Sélectionnez un tableau de bord ci-dessous pour commencer.
        </p>
        <div className="mt-6 mb-8 flex justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="inline-block bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Link to="/dashboards/user" className="content-center">
              Dashboard Utilisateur
            </Link>
          </Button>

          {isAdmin && (
            <Button
              size="lg"
              asChild
              className="inline-block bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Link to="/dashboards/admin" className="content-center">
                Dashboard Administrateur
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

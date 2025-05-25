import { useCurrentUser } from "./hooks/useCurrentUser";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/navbar";
import Footer from "./components/footer";
import { Link } from "react-router";

function App() {
  const { isLoading, isAuthenticated, userInConvex } = useCurrentUser();
  return (
    <main>
      {isLoading ? (
        <AuthLoading>
          <div className="min-h-screen bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-2xl font-semibold text-indigo-600">
                Chargement...
              </p>
            </div>
          </div>
        </AuthLoading>
      ) : isAuthenticated ? (
        <Authenticated>
          <Content userInConvex={userInConvex} />
        </Authenticated>
      ) : (
        <Unauthenticated>
          <SignIn />
        </Unauthenticated>
      )}
    </main>
  );
}

function SignIn() {
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 to-purple-100 flex flex-col">
      <NavBar />
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <p className="text-xl text-gray-700 mb-6 text-center">
          Veuillez vous connecter pour accéder aux fonctionnalités de
          l'application ! Authentification faite avec Clerk et Convex.
        </p>
        <SignInButton mode="modal">
          <Button
            size="lg"
            className="inline-block bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            Se connecter
          </Button>
        </SignInButton>
      </div>
      <Footer />
    </div>
  );
}

function Content({
  userInConvex,
}: {
  // We can also use the useUser hook from Clerk to get the user information,
  // but here we are using the useCurrentUser hook from our Convex database.
  userInConvex: ReturnType<typeof useCurrentUser>["userInConvex"];
}) {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-indigo-100 to-purple-100">
      <NavBar>
        <UserButton aria-label="User menu" />
        Connecté en tant que {userInConvex?.nickname ?? userInConvex?.email}
      </NavBar>

      <main className="container mx-auto px-4 py-8 flex-grow my-[56px]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Bienvenue sur notre plateforme de gestion de produits pour UGS, les
            associations et les particuliers !
          </h1>

          <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Options disponibles
            </h2>
            <ul className="list-disc list-inside text-left space-y-2">
              <li>
                <Link to="/" className="text-indigo-600 underline">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-indigo-600 underline">
                  Voir vos produits
                </Link>
              </li>
              <li>
                Pour modifier votre profil, rendez-vous dans la section en
                cliquant sur votre image de profil.
              </li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;

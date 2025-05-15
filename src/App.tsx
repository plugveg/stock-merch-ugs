import { useState } from "react";
import { Github } from "lucide-react";
import { useTasks } from "./hooks/useTasks";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
      <nav className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">
            StockMerch by UGS
          </h1>
          <div className="flex gap-4">
            <a
              href="https://github.com/plugveg/stock-merch-ugs"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Github size={24} />
            </a>
          </div>
        </div>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
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

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">Built by UGS with ❤️</p>
        </div>
      </footer>
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
  const [count, setCount] = useState(0);
  const { tasks, isLoading, showSkeleton, error } = useTasks();
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 to-purple-100">
      <nav className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">
            StockMerch by UGS
          </h1>
          <div className="flex gap-4">
            <a
              href="https://github.com/plugveg/stock-merch-ugs"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Github size={24} />
            </a>
            <UserButton aria-label="User menu" />
            Connecté en tant que {userInConvex?.nickname ?? userInConvex?.email}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-8">
            Welcome to Our Platform
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Experience the power of modern web development with Vite, React, and
            Tailwind CSS.
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-6xl font-bold text-indigo-600 mb-4">
              {count}
            </div>
            <Button
              size="lg"
              onClick={() => setCount((count) => count + 1)}
              className="bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors h-12"
            >
              Increment Counter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Feature One
              </h3>
              <p className="text-gray-600">
                Built with the latest technologies to ensure the best
                development experience.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Feature Two
              </h3>
              <p className="text-gray-600">
                Optimized for performance and styled with the powerful Tailwind
                CSS framework.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Feature Three
              </h3>
              <p className="text-gray-600">
                Seamlessly integrates with Convex for real-time data fetching
                and state management.
              </p>
              <div>
                <strong className="block mb-2">Tasks from Convex:</strong>
                {showSkeleton && (
                  <ul className="space-y-2 mt-2 justify-items-center">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="bg-gray-300 h-4 w-3/4" />
                    ))}
                  </ul>
                )}

                {error && (
                  <p className="text-red-500 mt-2">Error: {error.message}</p>
                )}

                {!isLoading && !error && (
                  <ul className="list-disc list-inside text-gray-600 mt-2">
                    {tasks.map((task) => (
                      <li key={task._id} className="mb-2">
                        {task.text} -{" "}
                        {task.isCompleted ? "Completed" : "Pending"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">Built by UGS with ❤️</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

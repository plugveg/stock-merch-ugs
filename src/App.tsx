import { useState } from "react";
import { Github, Twitter } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function App() {
  const [count, setCount] = useState(0);
  const tasks = useQuery(api.tasks.get);

  return (
    <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-indigo-100 tw-to-purple-100">
      <nav className="tw-bg-white tw-shadow-md tw-py-4">
        <div className="tw-container tw-mx-auto tw-px-4 tw-flex tw-justify-between tw-items-center">
          <h1 className="tw-text-2xl tw-font-bold tw-text-indigo-600">
            StockMerchUGS
          </h1>
          <div className="tw-flex tw-gap-4">
            <a
              href="https://github.com/plugveg/stock-merch-ugs"
              className="tw-text-gray-600 hover:tw-text-indigo-600 tw-transition-colors"
            >
              <Github size={24} />
            </a>
          </div>
        </div>
      </nav>

      <main className="tw-container tw-mx-auto tw-px-4 tw-py-16">
        <div className="tw-max-w-3xl tw-mx-auto tw-text-center">
          <h2 className="tw-text-5xl tw-font-bold tw-text-gray-800 tw-mb-8">
            Welcome to Our Platform
          </h2>
          <p className="tw-text-xl tw-text-gray-600 tw-mb-12">
            Experience the power of modern web development with Vite, React, and
            Tailwind CSS.
          </p>

          <div className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-p-8 tw-mb-8">
            <div className="tw-text-6xl tw-font-bold tw-text-indigo-600 tw-mb-4">
              {count}
            </div>
            <button
              onClick={() => setCount((count) => count + 1)}
              className="tw-bg-indigo-600 tw-text-white tw-px-6 tw-py-3 tw-rounded-full tw-font-semibold hover:tw-bg-indigo-700 tw-transition-colors"
            >
              Increment Counter
            </button>
          </div>

          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8">
            <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
              <h3 className="tw-text-xl tw-font-semibold tw-text-gray-800 tw-mb-4">
                Feature One
              </h3>
              <p className="tw-text-gray-600">
                Built with the latest technologies to ensure the best
                development experience.
              </p>
            </div>
            <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
              <h3 className="tw-text-xl tw-font-semibold tw-text-gray-800 tw-mb-4">
                Feature Two
              </h3>
              <p className="tw-text-gray-600">
                Optimized for performance and styled with the powerful Tailwind
                CSS framework.
              </p>
            </div>
            <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
              <h3 className="tw-text-xl tw-font-semibold tw-text-gray-800 tw-mb-4">
                Feature Three
              </h3>
              <p className="tw-text-gray-600">
                Seamlessly integrates with Convex for real-time data fetching
                and state management.
              </p>
              <p>
                <strong>Tasks from Convex:</strong>
                <ul className="tw-list-disc tw-list-inside tw-text-gray-600">
                  {tasks?.map((task) => (
                    <li key={task._id} className="tw-mb-2">
                      {task.text} - {task.isCompleted ? "Completed" : "Pending"}
                    </li>
                  ))}
                </ul>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="tw-bg-gray-800 tw-text-white tw-py-8 tw-mt-16">
        <div className="tw-container tw-mx-auto tw-px-4 tw-text-center">
          <p className="tw-text-gray-400">
            Built with ❤️ using React and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

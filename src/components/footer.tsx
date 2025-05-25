export default function Footer({ children }: { children?: React.ReactNode }) {
  return (
    <footer className="bg-gray-800 text-white py-4 fixed bottom-0 w-full">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-400">
          Développé par UGS & Thomas 'Setsuma' Siest
        </p>
      </div>
      <div className="container mx-auto px-4 text-center">{children}</div>
    </footer>
  );
}

import { Menu } from "lucide-react";

export default function MobileNavToggle({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`fixed top-4 left-4 z-20 p-2 rounded-md bg-white shadow-md lg:hidden ${
        isOpen ? 'hidden' : 'block'
      }`}
      aria-label="Open navigation menu"
    >
      <Menu className="w-5 h-5 text-gray-600" />
    </button>
  );
}
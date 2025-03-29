import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-black via-zinc-900 to-black border-t border-zinc-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">
            © 2025 AI-Chemy™. All Rights Reserved.
          </span>
          <div className="flex items-center space-x-4">
            <p
              className="text-zinc-500 hover:text-purple-400 transition-colors duration-300"
            >
              Privacy Policy
            </p>
            <p
              className="text-zinc-500 hover:text-purple-400 transition-colors duration-300"
            >
              Terms of Service
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

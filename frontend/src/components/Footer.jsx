import React from 'react';

export default function Footer() {
  return (
    <footer className="py-8 bg-gray-900 text-gray-400 text-center">
      <p>© 빅데이터 28 / Team EOD.</p>
      <div className="mt-4 flex justify-center space-x-4">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-200"
        >
          Facebook
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-200"
        >
          Twitter
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-200"
        >
          Instagram
        </a>
      </div>
    </footer>
  );
}

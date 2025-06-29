import React from 'react';

interface BoltBadgeProps {
  className?: string;
}

export function BoltBadge({ className = '' }: BoltBadgeProps) {
  return (
    <a
      href="https://bolt.new"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path
          d="M13 3L4 14h7l-1 8 9-11h-7l1-8z"
          fill="currentColor"
        />
      </svg>
      <span>Built with Bolt.new</span>
    </a>
  );
}
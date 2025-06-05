import Link from "next/link";

export function A({ children, className = "", href, ...props }: { children: React.ReactNode; className?: string; href: string }) {
  const linkStyle = `border-b group text-gray-600 border-gray-300 transition-[border-color] hover:border-gray-600 dark:text-white dark:border-gray-500 dark:hover:border-white ${className}`;

  const isExternal = href.startsWith('http');

  if (href[0] === "#") {
    return (
      <a
        href={href}
        className={linkStyle}
        {...props}
      >
        {children}
      </a>
    );
  } else if (isExternal) {
    return (
      <a
        href={href}
        className={linkStyle}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="inline-block h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
            clipRule="evenodd"
          ></path>
        </svg>
      </a>
    );
  } else {
    return (
      <Link
        href={href}
        className={linkStyle}
        {...props}
      >
        {children}
      </Link>
    );
  }
}

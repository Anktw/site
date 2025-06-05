import { A } from "./mdx/a";

export function Footer() {
    return (
        <footer className="p-6 pt-3 pb-6 flex text-xs text-center mt-3 dark:text-gray-400 text-gray-500 max-w-2xl mx-auto px-4 sm:px-6">
            <div className="grow text-left">
                Hire me (
                <A href="/contact"> Contact</A>
                )
            </div>
            <div>
                <a target="_blank" href="https://github.com/anktw/site">
                    <span className="inline-flex items-center underline group">Source Code
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
                    </svg></span>
                </a>
            </div>
        </footer>
    );
}
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

const webpages = [
    "Projects",
    "Resume",
    "Writings",
    "About",
    "Contact",
].map((name) => ({
    name,
    path: `/${name.toLowerCase()}`,
}));

const Header = () => {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [prevScrollPos, setPrevScrollPos] = useState(0)
    const [visible, setVisible] = useState(true)

    const handleScroll = () => {
        const currentScrollPos = window.pageYOffset;
        setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
        setPrevScrollPos(currentScrollPos);
    };
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [prevScrollPos]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenuOnScroll = () => {
        if (window.innerWidth < 768 && isOpen) {
            setIsOpen(false);
        }
    };

    const closeMenuOnResize = () => {
        if (window.innerWidth >= 768 && isOpen) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", closeMenuOnScroll);
        window.addEventListener("resize", closeMenuOnResize);

        return () => {
            window.removeEventListener("scroll", closeMenuOnScroll);
            window.removeEventListener("resize", closeMenuOnResize);
        };
    }, [isOpen]);

    return (
        <header
            className={`sticky top-0 z-50 bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800 transition-transform duration-500 ${visible ? "translate-y-0" : "-translate-y-full"
                }`}
        >
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-16">
                    <Link
                        href="/"
                        className="font-medium text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        Ankit Tiwari
                    </Link>

                    <div className="flex items-center space-x-6">
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-6">
                            {webpages.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className={cn(
                                        "text-sm transition-colors hover:text-gray-900 dark:hover:text-gray-100",
                                        pathname === item.path ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400",
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                        <div className="hidden md:flex">
                            <ThemeToggle />
                        </div>


                        {/* Burger Menu Button */}
                        <button
                            className="relative w-8 h-8 md:hidden z-50 animate-fadeInRight justify-center align-middle cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                toggleMenu();
                            }}
                            aria-label="Menu"
                        >
                            <span
                                className={`absolute h-0.5 w-6 bg-foreground transform transition-all duration-300 ease-in-out ${isOpen ? "rotate-45" : "-translate-y-2"
                                    }`}
                            ></span>
                            <span
                                className={`absolute h-0.5 w-6 bg-foreground transform transition-all duration-300 ease-in-out ${isOpen ? "opacity-0" : "opacity-100"
                                    }`}
                            ></span>
                            <span
                                className={`absolute h-0.5 w-6 bg-foreground transform transition-all duration-300 ease-in-out ${isOpen ? "-rotate-45" : "translate-y-2"
                                    }`}
                            ></span>
                        </button>
                    </div>
                </div>
            </div>            {/* Mobile Navigation */}
            <div
                className={`fixed top right-0 h-screen w-1/2 md:w-64 z-50 transform transition-transform duration-300 ease-in-out dark:bg-black bg-white border-2 md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Close button */}
                <button
                    className="absolute top-4 right-4 z-50 focus:outline-none cursor-pointer"
                    onClick={toggleMenu}
                >
                    <span className="sr-only">Close menu</span>
                </button>

                {/* Menu Links */}
                <nav className="flex flex-col items-center mt-20 px-8 space-y-4">
                    {webpages.map((item) => (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={cn(
                                "block px-4 py-3 rounded-lg text-base font-medium transition-colors",
                                pathname === item.path
                                    ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100",
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <ThemeToggle />

                </nav>
            </div >
        </header >
    )
}

export default Header
"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { borel } from "@/lib/fonts";
import { DoorOpen, LogIn, Sun, Moon, Menu, X } from "lucide-react";
import { navs } from "@/lib/constants";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { setTheme, theme } = useTheme();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile based on screen width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleSignIn = async () => {
    signIn("google");
  };

  const handleSignOut = async () => {
    signOut();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden md:flex justify-between items-center p-7 px-10">
        <button className="text-2xl font-semibold flex">
          <Link
            href={"/"}
            className={`flex gap-2 ${borel.className} items-center font-bold`}
          >
            <Image
              src="/logo.svg"
              width={30}
              height={30}
              className={theme === "light" ? "invert" : ""}
              alt="logo"
            />
            <span className="translate-y-2">Mail.io</span>
          </Link>
        </button>
        <div className="flex gap-1 lg:gap-12 text-lg items-center">
          {status !== "authenticated"
            ? navs
                .filter((nav) => nav.auth === false)
                .map((nav, i) => (
                  <div
                    key={i}
                    className={`px-4 py-2 rounded-xl ${pathname === nav.link ? "bg-contrast text-anti-contrast" : ""}`}
                  >
                    <Link href={nav.link}>{nav.title}</Link>
                  </div>
                ))
            : navs.map((nav, i) => (
                <div
                  key={i}
                  className={`px-4 py-2 rounded-xl ${pathname === nav.link ? "bg-contrast text-anti-contrast" : ""}`}
                >
                  <Link href={nav.link}>{nav.title}</Link>
                </div>
              ))}
        </div>
        <div className="flex justify-center items-center gap-5">
          <button
            className="p-2 bg-contrast text-anti-contrast rounded-full"
            onClick={() =>
              setTheme((prev) => (prev == "light" ? "dark" : "light"))
            }
          >
            {theme === "light" ? <Sun /> : <Moon />}
          </button>
          {status === "authenticated" && (
            <button>
              <Image
                src={`${session?.user?.image}`}
                alt="profile"
                height={50}
                width={50}
                className="rounded-full size-[40px]"
              />
            </button>
          )}
          {status === "authenticated" ? (
            <button
              className="flex gap-2 bg-contrast text-anti-contrast px-4 py-2 rounded-xl font-semibold"
              onClick={handleSignOut}
            >
              Sign Out
              <DoorOpen />
            </button>
          ) : (
            <button
              className="flex gap-2 bg-contrast text-anti-contrast px-4 py-2 rounded-xl font-semibold"
              onClick={handleSignIn}
            >
              Sign In
              <LogIn />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden flex justify-between items-center p-4">
        <button className="text-xl font-semibold flex">
          <Link
            href={"/"}
            className={`flex gap-2 ${borel.className} items-center font-bold`}
          >
            <Image
              src="/logo.svg"
              width={24}
              height={24}
              className={theme === "light" ? "invert" : ""}
              alt="logo"
            />
            <span className="translate-y-1">Mail.io</span>
          </Link>
        </button>
        <button
          onClick={toggleMenu}
          className="p-2 bg-contrast text-anti-contrast rounded-full"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background z-50 flex flex-col">
          <div className="flex justify-between items-center p-4">
            <button className="text-xl font-semibold flex">
              <Link
                href={"/"}
                className={`flex gap-2 ${borel.className} items-center font-bold`}
                onClick={closeMenu}
              >
                <Image
                  src="/logo.svg"
                  width={24}
                  height={24}
                  className={theme === "light" ? "invert" : ""}
                  alt="logo"
                />
                <span className="translate-y-1">Mail.io</span>
              </Link>
            </button>
            <button
              onClick={closeMenu}
              className="p-2 bg-contrast text-anti-contrast rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 pt-10">
            {status !== "authenticated"
              ? navs
                  .filter((nav) => nav.auth === false)
                  .map((nav, i) => (
                    <div
                      key={i}
                      className={`px-4 py-2 w-4/5 text-center rounded-xl ${pathname === nav.link ? "bg-contrast text-anti-contrast" : ""}`}
                    >
                      <Link href={nav.link} onClick={closeMenu}>
                        {nav.title}
                      </Link>
                    </div>
                  ))
              : navs.map((nav, i) => (
                  <div
                    key={i}
                    className={`px-4 py-2 w-4/5 text-center rounded-xl ${pathname === nav.link ? "bg-contrast text-anti-contrast" : ""}`}
                  >
                    <Link href={nav.link} onClick={closeMenu}>
                      {nav.title}
                    </Link>
                  </div>
                ))}
          </div>

          <div className="flex flex-col items-center gap-5 mt-10">
            <button
              className="p-3 bg-contrast text-anti-contrast rounded-full"
              onClick={() => {
                setTheme((prev) => (prev == "light" ? "dark" : "light"));
              }}
            >
              {theme === "light" ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            {status === "authenticated" && (
              <div className="flex flex-col items-center gap-3">
                <Image
                  src={`${session?.user?.image}`}
                  alt="profile"
                  height={60}
                  width={60}
                  className="rounded-full"
                />
              </div>
            )}

            {status === "authenticated" ? (
              <button
                className="flex gap-2 bg-contrast text-anti-contrast px-6 py-3 rounded-xl font-semibold"
                onClick={() => {
                  handleSignOut();
                  closeMenu();
                }}
              >
                Sign Out
                <DoorOpen />
              </button>
            ) : (
              <button
                className="flex gap-2 bg-contrast text-anti-contrast px-6 py-3 rounded-xl font-semibold"
                onClick={() => {
                  handleSignIn();
                  closeMenu();
                }}
              >
                Sign In
                <LogIn />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

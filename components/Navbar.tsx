"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { borel } from "@/lib/fonts";
import { DoorOpen, LogIn, Sun, Moon } from "lucide-react";
import { navs } from "@/lib/constants";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { setTheme, theme } = useTheme();
  const [name, setName] = useState("");
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleSignIn = async () => {
    signIn("google");
  };

  const handleSignOut = async () => {
    signOut();
  };

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  return (
    <div className="flex justify-between items-center p-7 px-10">
      <button className="text-2xl font-semibold flex">
        <Link
          href={"/"}
          className={`flex gap-2 ${borel.className} items-center font-bold`}
        >
          <Image src="/logo.svg" width={30} height={30} className={theme === "light" ? "invert" : ""} alt="logo" />
          <span className="translate-y-2">Mail.io</span>
        </Link>
      </button>
      <div className="flex gap-12 text-lg items-center">
        {
          (status !== "authenticated") ? 
            navs.filter((nav) => nav.auth === false).map((nav, i) => (
              <div key={i} className={`px-4 py-2 rounded-xl ${pathname === nav.link ? "bg-contrast text-anti-contrast" : ""}`}>
                <Link href={nav.link}>{nav.title}</Link>
              </div>
            )) : 
            navs.map((nav, i) => (
              <div key={i} className={`px-4 py-2 rounded-xl ${pathname === nav.link ? "bg-contrast text-anti-contrast" : ""}`}>
                <Link href={nav.link}>{nav.title}</Link>
              </div>
            ))
        }
      </div>
      <div className="flex justify-center items-center gap-5">
        <button className="p-2 bg-contrast text-anti-contrast rounded-full" onClick={() => setTheme((prev) => prev == "light" ? "dark" : "light")}>
          {
            theme === "light" ?
            <Sun /> :
            <Moon />
          }
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
  );
};
export default Navbar;

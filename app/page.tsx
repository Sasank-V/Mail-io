"use client";

import { cards, features } from "@/lib/constants";
import { borel } from "@/lib/fonts";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

const Home = () => {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const authRequired = searchParams.get("auth") === "required";

  useEffect(() => {
    if (authRequired) {
      toast.error("You need to sign in to access that page!");
    }
  }, [authRequired]);

  return (
    <div className="px-8 w-[100vw] h-fit flex flex-col gap-10 items-center pb-10">
      <div className="w-full h-[87vh] rounded-3xl overflow-hidden relative">
        <Image
          src="/logo.svg"
          className={`inset-0 absolute -z-9 w-full h-full blur-xl opacity-60 ${theme === "light" ? "invert" : ""}`}
          alt="Sdf"
          width={100}
          height={100}
        />
        <div className="flex flex-col justify-center -translate-y-10 h-full items-center text-center gap-5">
          <div className="text-[125px] font-semibold mt-14">
            The AI Mail Box
          </div>
          <div className={`text-2xl `}>
            Built to make you extraordinarily productive, <br /> Mail.io is the
            best way to manage mails and mark calendars
          </div>
          <button className="bg-contrast text-anti-contrast px-5 py-3 rounded-lg">
            Get Started
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-10 w-full h-fit">
        {features.map((feature, i) => (
          <div
            className="w-full h-fit p-10 mt-10 flex flex-col gap-10"
            key={feature.title + i}
          >
            <div className="flex flex-col justify-start items-center text-center gap-5">
              <div className="text-[40px]">{feature.title}</div>
              <div>{feature.subtitle}</div>
            </div>
            <div className="relative overflow-hidden w-full h-[85vh] rounded-[30px] flex justify-center items-center over">
              <Image
                src="/gradient.png"
                className="inset-0 absolute -z-10 w-full h-full blur-2xl"
                alt="Sdf"
                width={100}
                height={100}
              />
              <div className="w-[90%] rounded-xl overflow-hidden">
                {
                  feature.type === "video" ?
                  <video
                  src={feature.src}
                  className=""
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  controlsList="nodownload nofullscreen noremoteplayback"
                  /> :
                  <Image src={feature.src} height={1000} width={1000} alt={feature.title} className="w-full h-full bg-red-300" />
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col text-left w-full gap-10">
        <div className="flex flex-col w-full h-full text-left ml-10">
          <div className="text-[40px]">Features</div>
          <div>Things that sets up apart from a Standard Mail App</div>
        </div>
        <div className="flex w-full h-full gap-10">
          {cards.map((card, i) => (
            <div
              className="h-[60vh] w-full border-[1px] border-secondary rounded-2xl bg-anti-contrast p-10"
              key={card.title + i}
            >
              <div className="text-[40px]">{card.title}</div>
              <div>{card.subtitle}</div>
            </div>
          ))}
        </div>

        <div className="flex text-left w-full gap-10 h-[60vh] mt-20">
          <div className="flex flex-col h-full w-full items-start gap-4">
            <div className="text-[120px] font-semibold">
              Try <span className={`${borel.className}`}>Mail.io</span> Now
            </div>
            <button className="bg-contrast text-anti-contrast px-10 py-3 text-2xl rounded-xl">
              Get Started
            </button>
          </div>
          <div className="">
            <Image
              src="/logo.svg"
              className={`inset-0 -z-10 w-full h-full -translate-y-20 ${theme === "light" ? "invert" : ""}`}
              alt="Sdf"
              width={100}
              height={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;

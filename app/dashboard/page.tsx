"use client";

import Image from "next/image";
import { Mail, MailOpen, Star, Trash, Send, Archive } from "lucide-react";
import { useTheme } from "next-themes";

const Dashboard = () => {
  const { theme } = useTheme();

  const emailStats = [
    { title: "Total Emails", count: 1250, icon: Mail },
    { title: "Unread Mails", count: 18, icon: MailOpen },
    { title: "Starred", count: 42, icon: Star },
    { title: "Trash", count: 8, icon: Trash },
    { title: "Sent", count: 386, icon: Send },
    { title: "Archived", count: 129, icon: Archive },
  ];

  return (
    <div className="px-8 w-full min-h-screen flex flex-col gap-10 items-center pb-10 bg-gradient-to-br bg-background text-contrast">
      <div className="w-full pt-10">
        <h1 className="text-4xl font-semibold mb-2">Email Dashboard</h1>
        <p className="text-xl text-contrast">
          Welcome back! Here&apos;s your email overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {emailStats.map((stat, index) => (
          <div
            key={index}
            className="bg-secondary bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border-[1px] border-gray-500 transition-all duration-300 hover:shadow-lg hover:shadow-contrast/20 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">{stat.title}</h2>
              <stat.icon className="w-8 h-8 text-contrast" />
            </div>
            <p className="text-4xl font-bold text-contrast">{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="w-full mt-10">
        <h2 className="text-3xl font-semibold mb-6">Recent Activity</h2>
        <div className="bg-secondary bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-500 last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-contrast flex items-center justify-center">
                    <Mail className="w-5 h-5 text-anti-contrast" />
                  </div>
                  <div>
                    <p className="font-medium">New message from John Doe</p>
                    <p className="text-sm text-contrast">2 minutes ago</p>
                  </div>
                </div>
                <button className="text-contrast hover:text-purple-400 transition-colors">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex text-left w-full gap-10 h-[40vh] mt-20">
        <div className="flex flex-col h-full w-full items-start gap-4">
          <div className="text-5xl md:text-7xl font-semibold">
            Manage Your Inbox
          </div>
          <p className="text-xl text-contrast-secondary mb-4">
            Stay organized and boost your productivity with Mail.io
          </p>
          <button className="bg-contrast text-anti-contrast px-8 py-3 text-xl rounded-xl hover:bg-contrast/70 transition-colors">
            Compose New Email
          </button>
        </div>
        <div className="">
          <Image
            src="/logo.svg"
            className={`inset-0 ${
              theme === "dark" ? "invert-0" : "invert"
            } -z-10 w-full h-full -translate-y-20`}
            alt="Sdf"
            width={100}
            height={100}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

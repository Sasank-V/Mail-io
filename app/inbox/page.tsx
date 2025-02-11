"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  RefreshCw,
  Trash2,
  CircleArrowLeft,
  CircleArrowRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/utils/formatDate";
import { toast } from "react-toastify";
import NewCategoryModal from "@/components/NewCategoryModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import SyncPrompt from "@/components/EmptyEmails";
import { IEmail, ICategory, IAttachment } from "@/lib/types";
import EmailView from "@/components/EmailView";

export default function Inbox() {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const { data: session, status } = useSession();

  const [emails, setEmails] = useState<IEmail[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);

  const [isMailSelected, setIsMailSelected] = useState<boolean>(false);
  const [selectedMail, setSelectedMail] = useState<Partial<IEmail>>({});
  const [isNewCategoryModalOpen, setIsCategoryModalOpen] =
    useState<boolean>(false);
  const [hoveredEmailId, setHoveredEmailId] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [didAttachmentsLoad, setDidAttachmentsLoad] = useState<boolean>(false);

  const currentPage = useRef<number>(0);
  const pageTokenArray = useRef<string[]>([""]);

  const [isAddingToCalendar, setIsAddingToCalendar] = useState<boolean>(false);

  const handleAddToCalendar = async (email: IEmail) => {
    setIsAddingToCalendar(true);
    try {
      const res = await fetch(
        `/api/calendar/add?user_id=${session?.user.id}&message_id=${email.message_id}`,
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        toast.error("Server Error adding to calendar");
      } else {
        toast.success(res.message!);
      }
    } catch (error) {
      toast.error("Error adding to calendar");
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  const getEmails = async () => {
    if (status !== "authenticated" || !session?.user?.id) return;

    setIsSyncing(true);
    try {
      let url = "/api/email/all";
      url = url + `?user_id=${session.user.id}`;
      url = url + `&page_token=${pageTokenArray.current[currentPage.current]}`;

      const res = await fetch(url, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch emails");
      }

      const data = await res.json();

      const mergedEmails = [];

      for (const msg of data.messages) {
        mergedEmails.push({
          ...msg,
          headers: msg.headers[0],
        });
      }

      setEmails(mergedEmails);

      if (pageTokenArray.current.length > currentPage.current) {
        const newPageTokenArray = pageTokenArray.current;
        newPageTokenArray[currentPage.current + 1] = data.next_page_token;
        pageTokenArray.current = newPageTokenArray;
      } else {
        pageTokenArray.current = [
          ...pageTokenArray.current,
          data.next_page_token,
        ];
      }

      toast.success(`${data.messages.length} emails retrieved.`);
    } catch (error) {
      toast.error("There was an error syncing your emails. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddCategory = async (newCategory: {
    name: string;
    description: string;
  }) => {
    if (status !== "authenticated" || !session?.user?.id) return;

    try {
      const res = await fetch(`/api/category/update`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          user_id: session?.user?.id,
          categories: [...categories, newCategory],
        }),
      });

      if (!res.ok) {
        toast.error("Update Categories Failed");
      }

      setCategories([...categories, newCategory]);
      setIsCategoryModalOpen(false);
    } catch (error) {
      toast.error("Error updating Categories");
    }
  };

  const handleRemoveCategory = async (name: string) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!isConfirmed) return;

    const newCategories = categories.filter(
      (category) => category.name !== name
    );

    try {
      const res = await fetch(`/api/category/update`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          user_id: session?.user?.id,
          categories: newCategories,
        }),
      });

      if (!res.ok) {
        toast.error("Delete Categories Failed");
      }

      setCategories(newCategories);
    } catch (error) {
      toast.error("Error deleting Categories");
    }
  };

  const handlePrevPage = async () => {
    currentPage.current = currentPage.current - 1;
    getEmails();
  };

  const handleNextPage = async () => {
    currentPage.current = currentPage.current + 1;
    getEmails();
  };

  useEffect(() => {
    const getCategories = async () => {
      if (status !== "authenticated" || !session?.user?.id) return;

      try {
        const res = await fetch(
          `/api/category/get?user_id=${session?.user?.id}`,
          {
            method: "GET",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await res.json();

        if (data) {
          setCategories([...data.categories]);
        }
      } catch (error) {
        toast.error("Error getting categories");
      }
    };

    getCategories();
  }, [session, status]);

  const filteredEmails = emails.filter(
    (email) =>
      (selectedCategory === "All" || email.category === selectedCategory) &&
      (email.headers.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.headers.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.snippet.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleMailPopup = async (email: IEmail) => {
    setSelectedMail(email);
    setIsMailSelected(true);

    const attachments = [];

    try {
      for (const attachment of email?.attachments) {
        const res = await fetch(
          `/api/attachment/get?user_id=${session?.user.id}&message_id=${email.message_id}&attachment_id=${attachment.attachmentId}&filename=${attachment.filename}`,
          {
            method: "GET",
          }
        );

        const { filePath: filePath } = await res.json();

        attachments.push({
          filename: attachment.filename,
          url: filePath,
        });
      }
    } catch (error) {
      toast.error("Error loading attachments");
    } finally {
      setDidAttachmentsLoad(true);
    }
    setAttachments(attachments);
  };

  return (
    <div className="px-8 w-full h-[88vh] flex flex-col gap-10 items-center pb-10 bg-background">
      <div className="w-full pt-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-semibold mb-2">Email Inbox</h1>
        </div>
        <Button
          onClick={getEmails}
          disabled={isSyncing || status !== "authenticated"}
          className="flex items-center gap-2 bg-contrast"
        >
          <RefreshCw className="h-4 w-4" />
          {isSyncing ? "Syncing..." : "Sync Emails"}
        </Button>
      </div>

      <div className="w-full flex gap-8">
        <Card className="w-64 h-[calc(94vh-200px)] bg-background">
          <CardContent className="p-4">
            {/* <Button className="w-full mb-4 bg-contrast" variant="default">
              Compose
            </Button> */}
            <ScrollArea className="h-[calc(100%-60px)]">
              <button
                className={`w-full ${selectedCategory === "All" ? "bg-contrast/15" : ""} justify-start mb-2 relative group flex items-center p-3 hover:bg-contrast/15 rounded-md text-sm`}
                onClick={() => setSelectedCategory("All")}
              >
                All
              </button>
              <div className="h-[220px] overflow-auto mb-5">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`w-full ${selectedCategory === category.name ? "bg-contrast/15" : ""} justify-start mb-2 relative group flex items-center p-3 hover:bg-contrast/15 rounded-md text-sm`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}

                    {hoveredIndex === index && (
                      <Trash2
                        className="absolute right-2 top-2 text-gray-500 translate-y-1 hover:text-red-500 cursor-pointer transition-all"
                        size={20}
                        onClick={() => handleRemoveCategory(category.name)}
                      />
                    )}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setIsCategoryModalOpen((prev) => !prev)}
                className="w-full justify-start mb-2 bg-background border-dashed border-2 border-contrast/60 text-contrast hover: hover:bg-contrast/15"
              >
                Add Category
              </Button>

              {isNewCategoryModalOpen && (
                <NewCategoryModal handleAddCategory={handleAddCategory} />
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[calc(94vh-200px)] w-full overflow-hidden bg-background">
          <CardContent className="p-4 w-full h-[90%]">
            <div className="flex items-center space-x-2 mb-4 w-full">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-contrast/40"
              />
              <div className="flex">
                <button
                  onClick={handlePrevPage}
                  disabled={
                    currentPage.current === 0 ||
                    emails.length === 0 ||
                    isSyncing
                  }
                  className={
                    currentPage.current === 0 || isSyncing ? "opacity-50" : ""
                  }
                >
                  <CircleArrowLeft />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={emails.length === 0 || isSyncing}
                  className={
                    emails.length === 0 || isSyncing ? "opacity-50" : ""
                  }
                >
                  <CircleArrowRight />
                </button>
              </div>
            </div>
            {emails.length === 0 && isSyncing === false ? (
              <SyncPrompt />
            ) : (
              <>
                {isSyncing ? (
                  <LoadingSpinner />
                ) : (
                  <div className="w-full h-full overflow-scroll">
                    {filteredEmails.map((email) => (
                      <div
                        key={email.message_id}
                        onClick={() => handleMailPopup(email)}
                        onMouseEnter={() => setHoveredEmailId(email.message_id)}
                        onMouseLeave={() => setHoveredEmailId(null)}
                        className="relative flex items-center space-x-4 p-4 hover:bg-contrast/15 w-full rounded-lg cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-contrast flex items-center justify-center text-primary-foreground font-semibold">
                          {email.headers.from
                            .slice(6)
                            .replaceAll('"', "")
                            .replaceAll("'", "")
                            .charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {email.headers.from}
                          </p>
                          <p className="text-sm font-medium truncate">
                            {email.headers.subject}
                          </p>
                          <p className="text-sm text-contrast/50 truncate">
                            {email.snippet}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {formatDate(email.headers.date)}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {email.category}
                          </Badge>
                        </div>

                        {email.category === "Events" &&
                          hoveredEmailId === email.message_id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCalendar(email);
                              }}
                              disabled={isAddingToCalendar === true}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-contrast text-anti-contrast font-bold px-3 py-3 rounded-md text-md shadow-md hover:bg-contrast-secondary transition-all"
                            >
                              {isAddingToCalendar
                                ? "Adding to Calendar..."
                                : "Add to Calendar"}
                            </button>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      {isMailSelected && (
        <EmailView
          email={selectedMail}
          setDidAttachmentsLoad={setDidAttachmentsLoad}
          didAttachmentsLoad={didAttachmentsLoad}
          attachments={attachments}
          setAttachments={setAttachments}
          setIsMailSelected={setIsMailSelected}
        />
      )}
    </div>
  );
}

"use client"

import { IAttachment, IEmail } from "@/lib/types";
import { Paperclip, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

function EmailView({
  email,
  setIsMailSelected,
  attachments,
  setAttachments,
  didAttachmentsLoad,
  setDidAttachmentsLoad
}: {
  email: Partial<IEmail>;
  setIsMailSelected: (val: boolean) => void;
  attachments: IAttachment[];
  setAttachments: (val: IAttachment[]) => void;
  didAttachmentsLoad: boolean;
  setDidAttachmentsLoad: (val: boolean) => void
}) {

  const { data: session, status } = useSession();

  const handleClose = async () => {
    console.log(didAttachmentsLoad);
    if (didAttachmentsLoad === false) return;

    try {
      for (const attachment of attachments) {
        const res = await fetch(`/api/attachment/clear?user_id=${session?.user.id}&filepath=${attachment.url}`);

        if (!res.ok) {
          console.log("Error in fetch: clearing file");
        }

        console.log(res);
        setAttachments([]);
      }
    } catch (error) {
      console.log("Error deleting the file");
    } finally {
      console.log("Files deleted sucessfully");
      setDidAttachmentsLoad(false);
    }

    setIsMailSelected(false);
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [setIsMailSelected]);

  return (
    <div className="absolute flex justify-center items-center top-0 left-0 w-full h-full bg-contrast/10 backdrop-blur-[3px]" onClick={handleBackdropClick}>
      <button
        className="absolute top-5 right-5 bg-background rounded-full overflow-hidden"
        onClick={handleClose}
      >
        <X className="p-2.5 size-[45px] hover:bg-contrast/15" />
      </button>
      <div className="w-3/5 max-h-[90%] h-full rounded-2xl bg-background shadow-md relative overflow-y-hidden">
        <div className="bg-[#3f3f3f] absolute text-white w-full rounded-b-none flex gap-3 items-center z-20">
          <div className="h-full border-r-black border-r-4 p-5 pr-3">
            From:{" "}
          </div>
          <div className="p-5">{email.headers?.from}</div>
        </div>
        <div className="p-10 py-[100px] h-full overflow-y-auto">
        {email.bodyHTML !== "" ? (
          <div
            className=""
            dangerouslySetInnerHTML={{ __html: email.bodyHTML! }}
          />
        ) : (
          <div className="">{email.snippet}</div>
        )}
        </div>
        
        <div className="bg-[#3f3f3f] absolute text-white bottom-0 w-full rounded-t-none flex gap-3 items-center">
        {
          attachments.length === 0 ? <div className="p-4">Attachments are Loading...</div> :
            <div className="p-4 w-full">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments ({attachments.length})
              </h3>
              <div className="w-full overflow-x-auto">
                <div className="flex flex-nowrap gap-4 w-max">
                {attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={"/"+attachment.filename}
                    download={attachment.filename}
                    className="items-center flex shrink-0 gap-2 p-3 rounded-lg bg-contrast/10 hover:bg-contrast/20 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span>{attachment.filename}</span>
                  </a>
                ))}
                </div>
              </div>
            </div>
        }
        </div>
      </div>
    </div>
  );
}
export default EmailView;

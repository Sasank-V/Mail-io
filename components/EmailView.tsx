import { IEmail } from "@/lib/types";
import { X } from "lucide-react";

function EmailView({
  email,
  setIsMailSelected,
}: {
  email: IEmail;
  setIsMailSelected: (val: boolean) => void;
}) {
  return (
    <div className="absolute flex justify-center items-center top-0 left-0 w-full h-full bg-contrast/10 backdrop-blur-[3px]">
      <button
        className="p-2 absolute top-5 right-5 bg-background rounded-full"
        onClick={() => setIsMailSelected(false)}
      >
        <X className="size-[35px]" />
      </button>
      <div className="w-3/5 max-h-[75%] overflow-y-auto rounded-[40px] bg-background p-7">
        <div className="bg-secondary rounded-[20px] flex gap-3 items-center">
          <div className="h-full p-3 border-r-background border-r-4">
            From:{" "}
          </div>
          <div className="p-3">{email.headers.from}</div>
        </div>
        {email.bodyHTML !== "" ? (
          <div
            className=""
            dangerouslySetInnerHTML={{ __html: email.bodyHTML }}
          />
        ) : (
          <div className="p-5 mt-10">{email.snippet}</div>
        )}

        {}
      </div>
    </div>
  );
}
export default EmailView;

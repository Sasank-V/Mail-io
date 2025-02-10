import { IEmail } from "@/lib/types";
import { X } from "lucide-react";

function EmailView({
  email,
  setIsMailSelected,
}: {
  email: Partial<IEmail>;
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
      <div className="w-3/5 max-h-[75%] h-full rounded-2xl bg-background relative overflow-hidden">
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
          <div className="h-full border-r-black border-r-4 p-5 pr-3">
            From:{" "}
          </div>
          <div className="p-5">{email.headers?.from}</div>
        </div>
      </div>
    </div>
  );
}
export default EmailView;

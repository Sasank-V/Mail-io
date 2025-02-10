import { useState } from "react";

interface INewCategoryProps {
  handleAddCategory: (val: { name: string; description: string }) => void;
}

const NewCategoryModal = ({ handleAddCategory }: INewCategoryProps) => {
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");

  const addCategory = () => {
    console.log({ name, description: desc });
    if (name !== "" && desc !== "") {
      handleAddCategory({ name, description: desc });
    }
  };

  return (
    <div className="w-full h-full top-0 left-0 flex flex-col justify-center items-center gap-2">
      <input
        type="text"
        onChange={(e) => setName(e.target.value)}
        className="bg-secondary p-2 outline-0 rounded-md"
        placeholder="Name"
      />
      <input
        type="text"
        onChange={(e) => setDesc(e.target.value)}
        className="bg-secondary p-2 outline-0 rounded-md"
        placeholder="Description"
      />
      <button
        onClick={addCategory}
        className="bg-contrast text-anti-contrast w-full p-2 rounded-md hover:bg-contrast/90"
      >
        Add
      </button>
    </div>
  );
};
export default NewCategoryModal;

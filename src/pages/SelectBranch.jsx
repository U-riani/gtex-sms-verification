import { branches } from "../data/branches";

const SelectBranch = () => {
  return (
    <div className="">
      <div className="min-h-screen flex flex-col justify-center  items-center gap-5">
        {branches &&
          branches.map((el, i) => {
            return (
              <button className="bg-slate-500 px-3 py-2 rounded cursor-pointer hover:bg-slate-700 hover:text-stone-300">
                {el.name}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default SelectBranch;

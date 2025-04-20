import { ToastProps } from "../../types/index";

export const ToastError = ({ body }: ToastProps) => {
  return (
    <div
      className="bg-red-500 text-white tracking-wide flex items-center w-max max-w-sm p-3 rounded-xl shadow-red-200"
      role="alert"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-[18px] shrink-0 fill-white inline mr-3"
        viewBox="0 0 32 32"
      >
        <path
          d="M16 1a15 15 0 1 0 15 15A15 15 0 0 0 16 1zm6.36 20L21 22.36l-5-4.95-4.95 4.95L9.64 21l4.95-5-4.95-4.95 1.41-1.41L16 14.59l5-4.95 1.41 1.41-5 4.95z"
          data-original="#ea2d3f"
        />
      </svg>

      <span className="block sm:inline text-sm mr-3">{body}</span>
    </div>
  );
};

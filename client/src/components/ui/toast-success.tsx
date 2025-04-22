import type { ToastProps } from "../../types/index";

export const ToastSuccess = ({ body }: ToastProps) => {
  return (
    <div
      className="bg-green-500 rounded-sm text-white tracking-wide flex items-center w-max max-w-sm p-3 shadow-md shadow-green-200"
      role="alert"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-[18px] shrink-0 fill-white inline mr-3"
        viewBox="0 0 512 512"
      >
        <ellipse
          cx="256"
          cy="256"
          fill="#fff"
          data-original="#fff"
          rx="256"
          ry="255.832"
        />
        <path
          className="fill-green-500"
          d="m235.472 392.08-121.04-94.296 34.416-44.168 74.328 57.904 122.672-177.016 46.032 31.888z"
          data-original="#ffffff"
        />
      </svg>
      <span className="block sm:inline text-sm mr-3">{body}</span>
    </div>
  );
};

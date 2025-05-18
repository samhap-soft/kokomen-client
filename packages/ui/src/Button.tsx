import { cva } from "class-variance-authority";

const ButtonVariants = cva(
  `
  flex items-center justify-center 
  bg-gray-950 text-white
  rounded-sm text-base font-medium
  `,
  {
    variants: {
      variant: {
        default: "shadow-none",
        grey: "bg-gray-150 text-gray-950",
        red: "bg-red-600",
      },
      size: {
        default: "px-2 py-1",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg",
        xl: "px-8 py-4 text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export const Button = () => {
  return (
    <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
      Buttonwqwrqw
    </button>
  );
};

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const TypewriterEffectSmooth = ({
  words,
  className,
}: {
  words: { text: string; className?: string }[];
  className?: string;
}) => {
  const renderWords = () => (
    <motion.div
      className="flex flex-wrap gap-2 justify-center lg:justify-start md:justify-start" 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2,
          },
        },
      }}
    >
      {words.map((word, idx) => (
        <motion.div
          key={idx}
          className={cn(
            "inline-block text-black",
            word.className
          )}
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            delay: idx * 0.2,
          }}
        >
          {word.text}
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <div
      className={cn(
        "flex justify-center items-center my-6",
        "w-full h-full",
        "sm:text-left",
        className
      )}
    >
      {renderWords()}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      ></motion.span>
    </div>
  );
};

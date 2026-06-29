import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

function Typewriter({
    text,
    speed = 50,
    initialDelay = 0,
    waitTime = 2000,
    deleteSpeed = 30,
    loop = true,
    className = "",
    showCursor = true,
    cursorChar = "|",
    cursorClassName = "ml-1",
}) {
    const texts = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

    const [displayText, setDisplayText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    useEffect(() => {
        let timeout;
        const currentText = texts[currentTextIndex] ?? "";

        if (isDeleting) {
            if (displayText === "") {
                setIsDeleting(false);

                if (currentTextIndex === texts.length - 1 && !loop) {
                    return;
                }

                setCurrentTextIndex((prev) => (prev + 1) % texts.length);
                setCurrentIndex(0);
            } else {
                timeout = setTimeout(() => {
                    setDisplayText((prev) => prev.slice(0, -1));
                }, deleteSpeed);
            }
        } else if (currentIndex < currentText.length) {
            timeout = setTimeout(() => {
                setDisplayText((prev) => prev + currentText[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, currentIndex === 0 ? initialDelay : speed);
        } else if (texts.length > 1 && loop) {
            timeout = setTimeout(() => {
                setIsDeleting(true);
            }, waitTime);
        }

        return () => clearTimeout(timeout);
    }, [
        currentIndex,
        displayText,
        isDeleting,
        speed,
        deleteSpeed,
        waitTime,
        texts,
        currentTextIndex,
        loop,
        initialDelay,
    ]);

    return (
        <span className={`inline whitespace-pre-wrap tracking-tight ${className}`}>
            <span>{displayText}</span>
            {showCursor && (
                <motion.span
                    className={cursorClassName}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        transition: {
                            duration: 0.01,
                            repeat: Infinity,
                            repeatDelay: 0.4,
                            repeatType: "reverse",
                        },
                    }}
                >
                    {cursorChar}
                </motion.span>
            )}
        </span>
    );
}

export default Typewriter;
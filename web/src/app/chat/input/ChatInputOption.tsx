import React, { useState, useRef, useEffect } from "react";
import { IconType } from "react-icons";
import { DefaultDropdownElement } from "../../../components/Dropdown";
import { Popover } from "../../../components/popover/Popover";
import { IconProps } from "@/components/icons/icons";

interface ChatInputOptionProps {
  name: string;
  Icon: ({ size, className }: IconProps) => JSX.Element;
  onClick?: () => void;
  size?: number;
  tooltipContent?: React.ReactNode;
  options?: { name: string; value: number; onClick?: () => void }[];
  flexPriority?: "shrink" | "stiff" | "second";
}

export const ChatInputOption: React.FC<ChatInputOptionProps> = ({
  name,
  Icon,
  // icon: Icon,
  size = 16,
  options,
  flexPriority,
  tooltipContent,
}) => {
  const [isDropupVisible, setDropupVisible] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as Node)
      ) {
        setIsTooltipVisible(false);
        setDropupVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dropdownContent = options ? (
    <div className="border rounded-lg flex flex-col bg-background overflow-y-auto overscroll-contain">
      {options.map((option) => (
        <DefaultDropdownElement
          key={option.value}
          name={option.name}
          onSelect={() => {
            if (option.onClick) {
              option.onClick();
              setDropupVisible(false);
            }
          }}
          isSelected={false}
        />
      ))}
    </div>
  ) : null;

  const optionContent = (
    <div
      className={`
        relative 
        cursor-pointer 
        flex 
        items-center 
        space-x-2 
        text-neutral-700
        hover:bg-hover
        hover:text-emphasis
        p-1.5
        rounded-md
        ${flexPriority === "shrink" && "flex-shrink-[10000] flex-grow-0 flex-basis-auto min-w-[30px] whitespace-nowrap overflow-hidden"}
        ${flexPriority === "second" && "flex-shrink flex-basis-0 min-w-[30px] whitespace-nowrap overflow-hidden"}
        ${flexPriority === "stiff" && "flex-none whitespace-nowrap overflow-hidden"}
      `}
      title={name}
    >
      <Icon size={size} className="flex-none" />
      <span className="text-sm break-all line-clamp-1">{name}</span>
      {isTooltipVisible && tooltipContent && (
        <div
          className="absolute z-10 p-2 text-sm text-white bg-black rounded shadow-lg"
          style={{
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "0.5rem",
            whiteSpace: "nowrap",
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );

  return <div ref={componentRef}>{optionContent}</div>;
};

export const ChatInputOptionOld: React.FC<ChatInputOptionProps> = ({
  name,
  Icon: Icon,
  onClick,
  size = 16,
  options,
  flexPriority,
  tooltipContent,
}) => {
  const [isDropupVisible, setDropupVisible] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as Node)
      ) {
        setIsTooltipVisible(false);
        setDropupVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tooltipContent) {
      setIsTooltipVisible(!isTooltipVisible);
    }
    if (options) {
      setDropupVisible(!isDropupVisible);
    }
    if (onClick) {
      onClick();
    }
  };

  const dropdownContent = options ? (
    <div className="border rounded-lg flex flex-col bg-background overflow-y-auto overscroll-contain">
      {options.map((option) => (
        <DefaultDropdownElement
          key={option.value}
          name={option.name}
          onSelect={() => {
            if (option.onClick) {
              option.onClick();
              setDropupVisible(false);
            }
          }}
          isSelected={false}
        />
      ))}
    </div>
  ) : null;

  const optionContent = (
    <div
      className={`
        relative 
        cursor-pointer 
        flex 
        items-center 
        space-x-2 
        text-neutral-700
        hover:bg-hover
        hover:text-emphasis
        p-1.5
        rounded-md
        ${flexPriority === "shrink" && "flex-shrink-[10000] flex-grow-0 flex-basis-auto min-w-[30px] whitespace-nowrap overflow-hidden"}
        ${flexPriority === "second" && "flex-shrink flex-basis-0 min-w-[30px] whitespace-nowrap overflow-hidden"}
        ${flexPriority === "stiff" && "flex-none whitespace-nowrap overflow-hidden"}
      `}
      onClick={handleClick}
      title={name}
    >
      <Icon size={size} className="flex-none" />
      <span className="text-sm break-all line-clamp-1">{name}</span>
      {isTooltipVisible && tooltipContent && (
        <div
          className="absolute z-10 p-2 text-sm text-white bg-black rounded shadow-lg"
          style={{
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "0.5rem",
            whiteSpace: "nowrap",
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );

  if (!dropdownContent) {
    return <div ref={componentRef}>{optionContent}</div>;
  }

  return (
    <Popover
      open={isDropupVisible}
      onOpenChange={setDropupVisible}
      content={optionContent}
      popover={dropdownContent}
      side="top"
      align="start"
      sideOffset={5}
    />
  );
};

export default ChatInputOption;

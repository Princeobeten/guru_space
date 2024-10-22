"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true, 
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      // classNames={{
      //   ...classNames,
      //   nav_button: "text-navy text-xs hover:bg-gray-100", // Styling for navigation buttons
      // }}
      components={{
        // // Custom left navigation icon
        // IconLeft: ({ ...props }) => <ChevronLeft {...props} />,
        // // Custom right navigation icon
        // IconRight: ({ ...props }) => <ChevronRight {...props} />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };

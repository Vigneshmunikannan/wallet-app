import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import React from 'react';
import clsx from 'clsx';

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50" />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={clsx(
        "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
        "w-full max-w-lg rounded-lg bg-white p-6 shadow-lg",
        "z-50",
        "focus:outline-none",
        className
      )}
      {...props}
    />
  </AlertDialogPrimitive.Portal>
));
AlertDialogContent.displayName = "AlertDialogContent";

export const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx("mb-4 text-center sm:text-left", className)}
    {...props}
  />
);

export const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx(
      "mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);

export const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={clsx("text-lg font-semibold text-gray-900", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

export const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={clsx("text-sm text-gray-500", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

export const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={clsx(
      "inline-flex justify-center rounded-md px-4 py-2",
      "bg-blue-600 text-white hover:bg-blue-700",
      "text-sm font-semibold",
      className
    )}
    {...props}
  />
));
AlertDialogAction.displayName = "AlertDialogAction";

export const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={clsx(
      "inline-flex justify-center rounded-md px-4 py-2",
      "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
      "text-sm font-semibold",
      className
    )}
    {...props}
  />
));
AlertDialogCancel.displayName = "AlertDialogCancel";
import React from "react";
import clsx from "clsx";

export const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className="w-full overflow-x-auto">
    <table className={clsx("w-full border-collapse", className)}>{children}</table>
  </div>
);

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-100 border-b">{children}</thead>
);

export const TableHead = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th className={clsx("px-6 py-4 text-left text-sm font-semibold text-gray-900", className)}>
    {children}
  </th>
);

export const TableRow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tr className={clsx("border-b border-gray-200 hover:bg-gray-50", className)}>{children}</tr>
);

export const TableCell = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <td className={clsx("px-6 py-4 text-sm text-gray-500", className)}>{children}</td>
);

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
);
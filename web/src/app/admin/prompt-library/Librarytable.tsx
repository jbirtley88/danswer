"use client";

import { EditIcon, TrashIcon } from "@/components/icons/icons";
import { PopupSpec } from "@/components/admin/connectors/Popup";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@tremor/react";
import { FilterDropdown } from "@/components/search/filtering/FilterDropdown";
import { FiTag } from "react-icons/fi";
import { PageSelector } from "@/components/PageSelector";
import { InputPrompt } from "../assistants/interfaces";

const CategoryBubble = ({
  name,
  onDelete,
}: {
  name: string;
  onDelete?: () => void;
}) => (
  <span
    className={`
        inline-block
        px-2
        py-1
        mr-1
        mb-1
        text-xs
        font-semibold
        text-emphasis
        bg-hover
        rounded-full
        items-center
        w-fit
        ${onDelete ? "cursor-pointer" : ""}
      `}
    onClick={onDelete}
  >
    {name}
    {onDelete && (
      <button
        className="ml-1 text-subtle hover:text-emphasis"
        aria-label="Remove category"
      >
        &times;
      </button>
    )}
  </span>
);

const NUM_RESULTS_PER_PAGE = 10;

export const PromptLibraryTable = ({
  promptLibrary,
  refresh,
  setPopup,
  handleEdit,
}: {
  promptLibrary: InputPrompt[];
  refresh: () => void;
  setPopup: (popup: PopupSpec | null) => void;
  handleEdit: (promptId: number) => void;
}) => {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  const columns = [
    { name: "ID", key: "id" },
    { name: "Prompt", key: "prompt" },
    { name: "Content", key: "content" },
    { name: "Status", key: "status" },
    { name: "Public", key: "public" },
    { name: "", key: "actions" },
  ];

  const filteredPromptLibrary = promptLibrary.filter((item) => {
    const cleanedQuery = query.toLowerCase();
    const searchMatch =
      item.prompt.toLowerCase().includes(cleanedQuery) ||
      item.content.toLowerCase().includes(cleanedQuery);
    const statusMatch =
      selectedStatus.length === 0 ||
      (selectedStatus.includes("Active") && item.active) ||
      (selectedStatus.includes("Inactive") && !item.active);

    return searchMatch && statusMatch;
  });

  const totalPages = Math.ceil(
    filteredPromptLibrary.length / NUM_RESULTS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * NUM_RESULTS_PER_PAGE;
  const endIndex = startIndex + NUM_RESULTS_PER_PAGE;
  const paginatedPromptLibrary = filteredPromptLibrary.slice(
    startIndex,
    endIndex
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/input_prompt/${id}`, {
      method: "DELETE",
    });
    refresh();
  };

  const handleStatusSelect = (status: string) => {
    setSelectedStatus((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      }
      return [...prev, status];
    });
  };

  return (
    <div className="justify-center py-2">
      <div className="flex items-center w-full border-2 border-border rounded-lg px-4 py-2 focus-within:border-accent">
        <MagnifyingGlass />
        <input
          className="flex-grow ml-2 bg-transparent outline-none placeholder-subtle"
          placeholder="Find prompts..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCurrentPage(1);
          }}
        />
      </div>
      <div className="my-4 border-b border-border">
        <FilterDropdown
          options={[
            { key: "Active", display: "Active" },
            { key: "Inactive", display: "Inactive" },
          ]}
          selected={selectedStatus}
          handleSelect={(option) => handleStatusSelect(option.key)}
          icon={<FiTag size={16} />}
          defaultDisplay="All Statuses"
        />
        <div className="flex flex-wrap pb-4 mt-3">
          {selectedStatus.map((status) => (
            <CategoryBubble
              key={status}
              name={status}
              onDelete={() => handleStatusSelect(status)}
            />
          ))}
        </div>
      </div>
      <div className="mx-auto">
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableHeaderCell key={column.key}>
                  {column.name}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPromptLibrary.length > 0 ? (
              paginatedPromptLibrary.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.prompt}</TableCell>
                  <TableCell>{item.content}</TableCell>
                  <TableCell>{item.active ? "Active" : "Inactive"}</TableCell>
                  <TableCell>{item.is_public ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <button onClick={() => handleDelete(item.id)}>
                      <TrashIcon size={20} />
                    </button>
                  </TableCell>
                  <TableCell>
                    <button onClick={() => handleEdit(item.id)}>
                      <EditIcon size={12} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>No matching prompts found...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {paginatedPromptLibrary.length > 0 && (
          <div className="mt-4 flex justify-center">
            <PageSelector
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              shouldScroll={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

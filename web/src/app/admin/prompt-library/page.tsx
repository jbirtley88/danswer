"use client";

import { AdminPageTitle } from "@/components/admin/Title";
import {
  BookstackIcon,
  ClipboardIcon,
  EditIcon,
  TrashIcon,
} from "@/components/icons/icons";
import { PopupSpec, usePopup } from "@/components/admin/connectors/Popup";
import { useStandardAnswers, useStandardAnswerCategories } from "./hooks";
import { ThreeDotsLoader } from "@/components/Loading";
import { ErrorCallout } from "@/components/ErrorCallout";
import { Button, Divider, Text } from "@tremor/react";
import Link from "next/link";
import { StandardAnswer, StandardAnswerCategory } from "@/lib/types";
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { deleteStandardAnswer } from "./lib";
import { FilterDropdown } from "@/components/search/filtering/FilterDropdown";
import { FiTag } from "react-icons/fi";
import { SelectedBubble } from "@/components/search/filtering/Filters";
import { PageSelector } from "@/components/PageSelector";
import { FeedbackModal } from "@/app/chat/modal/FeedbackModal";
import AddPromptModal from "./PromptModal";

const NUM_RESULTS_PER_PAGE = 10;

type Displayable = JSX.Element | string;

const RowTemplate = ({
  id,
  entries,
}: {
  id: number;
  entries: [Displayable, Displayable, Displayable, Displayable, Displayable];
}) => {
  return (
    <TableRow key={id}>
      <TableCell className="w-1/24">{entries[0]}</TableCell>
      <TableCell className="w-2/12">{entries[1]}</TableCell>
      <TableCell className="w-2/12">{entries[2]}</TableCell>
      <TableCell className="w-7/12 overflow-auto">{entries[3]}</TableCell>
      <TableCell className="w-1/24">{entries[4]}</TableCell>
    </TableRow>
  );
};

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

const PromptLibraryTableRow = ({
  promptLibrary,
  handleDelete,
}: {
  promptLibrary: StandardAnswer;
  handleDelete: (id: number) => void;
}) => {
  return (
    <RowTemplate
      id={promptLibrary.id}
      entries={[
        <Link
          key={`edit-${promptLibrary.id}`}
          href={`/admin/standard-answer/${promptLibrary.id}`}
        >
          <EditIcon />
        </Link>,
        <div key={`categories-${promptLibrary.id}`}>
          {promptLibrary.categories.map((category) => (
            <CategoryBubble key={category.id} name={category.name} />
          ))}
        </div>,
        promptLibrary.keyword,
        <ReactMarkdown
          key={`answer-${promptLibrary.id}`}
          className="prose"
          remarkPlugins={[remarkGfm]}
        >
          {promptLibrary.answer}
        </ReactMarkdown>,
        <div
          key={`delete-${promptLibrary.id}`}
          className="cursor-pointer"
          onClick={() => handleDelete(promptLibrary.id)}
        >
          <TrashIcon />
        </div>,
      ]}
    />
  );
};

const PromptLibraryTable = ({
  promptLibrary,
  promptLibraryCategories,
  refresh,
  setPopup,
}: {
  promptLibrary: StandardAnswer[];
  promptLibraryCategories: StandardAnswerCategory[];
  refresh: () => void;
  setPopup: (popup: PopupSpec | null) => void;
}) => {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<
    StandardAnswerCategory[]
  >([]);
  const columns = [
    { name: "", key: "edit" },
    { name: "Categories", key: "category" },
    { name: "Keyword/Phrase", key: "keyword" },
    { name: "Answer", key: "answer" },
    { name: "", key: "delete" },
  ];

  const filteredPromptLibrary = promptLibrary.filter((promptLibrary) => {
    const { answer, id, categories, ...fieldsToSearch } = promptLibrary;
    const cleanedQuery = query.toLowerCase();
    const searchMatch = Object.values(fieldsToSearch).some((value) => {
      return value.toLowerCase().includes(cleanedQuery);
    });
    const categoryMatch =
      selectedCategories.length == 0 ||
      selectedCategories.some((category) =>
        categories.map((c) => c.id).includes(category.id)
      );
    return searchMatch && categoryMatch;
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
    const response = await deleteStandardAnswer(id);
    if (response.ok) {
      setPopup({
        message: `Standard answer ${id} deleted`,
        type: "success",
      });
    } else {
      const errorMsg = await response.text();
      setPopup({
        message: `Failed to delete standard answer - ${errorMsg}`,
        type: "error",
      });
    }
    refresh();
  };

  const handleCategorySelect = (category: StandardAnswerCategory) => {
    setSelectedCategories((prev: StandardAnswerCategory[]) => {
      const prevCategoryIds = prev.map((category) => category.id);
      if (prevCategoryIds.includes(category.id)) {
        return prev.filter((c) => c.id !== category.id);
      }
      return [...prev, category];
    });
  };

  return (
    <div className="justify-center py-2">
      <div className="flex items-center w-full border-2 border-border rounded-lg px-4 py-2 focus-within:border-accent">
        <MagnifyingGlass />
        <textarea
          autoFocus
          className="flex-grow ml-2 h-6 bg-transparent outline-none placeholder-subtle overflow-hidden whitespace-normal resize-none"
          role="textarea"
          aria-multiline
          placeholder="Find standard answers by keyword/phrase..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCurrentPage(1);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
            }
          }}
          suppressContentEditableWarning={true}
        />
      </div>
      <div className="my-4 border-b border-border">
        <FilterDropdown
          options={promptLibraryCategories.map((category) => {
            return {
              key: category.name,
              display: category.name,
            };
          })}
          selected={selectedCategories.map((category) => category.name)}
          handleSelect={(option) => {
            handleCategorySelect(
              promptLibraryCategories.find(
                (category) => category.name === option.key
              )!
            );
          }}
          icon={
            <div className="my-auto mr-2 w-[16px] h-[16px]">
              <FiTag size={16} />
            </div>
          }
          defaultDisplay="All Categories"
        />
        <div className="flex flex-wrap pb-4 mt-3">
          {selectedCategories.map((category) => (
            <CategoryBubble
              key={category.id}
              name={category.name}
              onDelete={() => handleCategorySelect(category)}
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
                <PromptLibraryTableRow
                  key={item.id}
                  promptLibrary={item}
                  handleDelete={handleDelete}
                />
              ))
            ) : (
              <RowTemplate id={0} entries={["", "", "", "", ""]} />
            )}
          </TableBody>
        </Table>
        {paginatedPromptLibrary.length === 0 && (
          <div className="flex justify-center">
            <Text>No matching standard answers found...</Text>
          </div>
        )}
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
export interface CreateInputPromptRequest {
  prompt: string;
  content: string;
  is_public: boolean;
}

const Main = () => {
  const { popup, setPopup } = usePopup();
  const [newPrompt, setNewPrompt] = useState(false);

  const {
    data: promptLibrary,
    error: promptLibraryError,
    isLoading: promptLibraryIsLoading,
  } = useStandardAnswers();

  const {
    data: promptLibraryCategories,
    error: promptLibraryCategoriesError,
    isLoading: promptLibraryCategoriesIsLoading,
  } = useStandardAnswerCategories();

  interface InputPromptSnapshot {
    id: number;
    prompt: string;
    content: string;
    is_public: boolean;
  }

  const createInputPrompt = async (
    promptData: CreateInputPromptRequest
  ): Promise<InputPromptSnapshot> => {
    const response = await fetch("/api/input_prompt/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promptData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create input prompt");
    }

    return response.json();
  };

  if (promptLibraryIsLoading || promptLibraryCategoriesIsLoading) {
    return <ThreeDotsLoader />;
  }

  if (promptLibraryError || !promptLibrary) {
    return (
      <ErrorCallout
        errorTitle="Error loading standard answers"
        errorMsg={
          promptLibraryError.info?.message ||
          promptLibraryError.message.info?.detail
        }
      />
    );
  }

  if (promptLibraryCategoriesError || !promptLibraryCategories) {
    return (
      <ErrorCallout
        errorTitle="Error loading standard answer categories"
        errorMsg={
          promptLibraryCategoriesError.info?.message ||
          promptLibraryCategoriesError.message.info?.detail
        }
      />
    );
  }

  return (
    <div className="mb-8">
      {popup}
      {newPrompt && (
        <AddPromptModal
          onSubmit={createInputPrompt}
          onClose={() => setNewPrompt(false)}
        />
      )}

      <Text className="mb-2">
        Here you can manage the prompts that you can access with the <i>`/`</i>{" "}
        shortcut!
      </Text>
      {promptLibrary.length == 0 && (
        <Text className="mb-2">Add your first prompt below!</Text>
      )}
      <div className="mb-2"></div>

      <Button
        onClick={() => setNewPrompt(true)}
        className="my-auto"
        color="green"
        size="xs"
      >
        New Prompt
      </Button>

      <Divider />

      {/* <div>
        <Standard
          sta={promptLibrary}
          promptLibraryCategories={promptLibraryCategories}
          refresh={refreshPromptLibrary}
          setPopup={setPopup}
        />
      </div> */}
    </div>
  );
};

const Page = () => {
  return (
    <div className="container mx-auto">
      <AdminPageTitle
        icon={<BookstackIcon size={32} />}
        title="Prompt Library"
      />
      <Main />
    </div>
  );
};

export default Page;

"use client";

import { AdminPageTitle } from "@/components/admin/Title";
import { BookstackIcon } from "@/components/icons/icons";
import { usePopup } from "@/components/admin/connectors/Popup";
import { ThreeDotsLoader } from "@/components/Loading";
import { ErrorCallout } from "@/components/ErrorCallout";
import { Button, Divider, Text } from "@tremor/react";
import { useState } from "react";
import AddPromptModal from "./modals/AddPromptModal";
import EditPromptModal from "./modals/EditPromptModa";
import { useInputPrompts } from "./hooks";
import { PromptLibraryTable } from "./Librarytable";

export interface CreateInputPromptRequest {
  prompt: string;
  content: string;
  is_public: boolean;
}

const Main = () => {
  const { popup, setPopup } = usePopup();
  const [newPrompt, setNewPrompt] = useState(false);
  const [newPromptId, setNewPromptId] = useState<number | null>(null);

  const {
    data: promptLibrary,
    error: promptLibraryError,
    isLoading: promptLibraryIsLoading,
    refreshInputPrompts: refreshPrompts,
  } = useInputPrompts();

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
    refreshPrompts();

    return response.json();
  };

  if (promptLibraryIsLoading) {
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

  if (promptLibraryError) {
    return (
      <ErrorCallout
        errorTitle="Error loading standard answer categories"
        errorMsg={promptLibraryError.info?.message}
      />
    );
  }

  const handleEdit = (promptId: number) => {
    setNewPromptId(promptId);
  };

  return (
    <div className="mb-8">
      {popup}

      {newPrompt && (
        <AddPromptModal
          onSubmit={createInputPrompt}
          onClose={() => setNewPrompt(false)}
        />
      )}

      {newPromptId && (
        <EditPromptModal
          promptId={newPromptId}
          onSubmit={createInputPrompt}
          onClose={() => setNewPromptId(null)}
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

      <div>
        <PromptLibraryTable
          promptLibrary={promptLibrary}
          setPopup={setPopup}
          refresh={refreshPrompts}
          handleEdit={handleEdit}
        />
      </div>
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

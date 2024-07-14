import React, { useState } from "react";

import { ModalWrapper } from "@/app/chat/modal/ModalWrapper";

import { Button, Select, SelectItem, Textarea, TextInput } from "@tremor/react";
import { BooleanFormField } from "@/components/admin/connectors/Field";
import { CreateInputPromptRequest } from "./page";

interface AddPromptModalProps {
  onClose: () => void;
  onSubmit: (promptData: CreateInputPromptRequest) => void;
}

const AddPromptModal: React.FC<AddPromptModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [saveIn, setSaveIn] = useState("Only you");

  const handleSubmit = () => {
    console.log("SUBMITTING");
    onSubmit({ prompt: title, content: prompt, is_public: false });
    // onClose();
  };

  return (
    <ModalWrapper onClose={onClose} modalClassName="max-w-xl">
      <>
        <h2 className="text-2xl text-emphasis font-bold mb-3 flex items-center">
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
            <path d="M7 17h10v-2H7v2zm0-4h10v-2H7v2zm0-4h7V7H7v2z" />
          </svg>
          Add prompt
        </h2>
        <p className="hover:underline text-sm mb-2 cursor-pointer">
          Read docs for more info
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <TextInput
              id="title"
              placeholder="Title (e.g. 'Draft email')"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-1">
              Prompt
            </label>
            <Textarea
              id="prompt"
              placeholder="Enter a prompt (e.g. 'Write a professional-sounding email about the following content')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button className="w-full" onClick={handleSubmit}>
            Add prompt
          </Button>
        </div>
      </>
    </ModalWrapper>
  );
};

export default AddPromptModal;

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useSWR from "swr";
import { ModalWrapper } from "@/app/chat/modal/ModalWrapper";
import { Button, Textarea, TextInput } from "@tremor/react";
import { useInputPrompt } from "../hooks";
import { updateInputPrompt } from "../lib";

interface PromptData {
  id: number;
  prompt: string;
  content: string;
  is_public: boolean;
}

interface EditPromptModalProps {
  onClose: () => void;
  onSubmit: (promptData: PromptData) => void;
  promptId: number;
}

const EditPromptSchema = Yup.object().shape({
  prompt: Yup.string().required("Title is required"),
  content: Yup.string().required("Content is required"),
  is_public: Yup.boolean(),
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const EditPromptModal: React.FC<EditPromptModalProps> = ({
  onClose,
  onSubmit,
  promptId,
}) => {
  const { data: promptData, error } = useInputPrompt(promptId);

  if (error) return <div>Failed to load prompt data</div>;
  if (!promptData) return <div>Loading...</div>;

  return (
    <ModalWrapper onClose={onClose} modalClassName="max-w-xl">
      <Formik
        initialValues={{
          prompt: promptData.prompt,
          content: promptData.content,
          is_public: promptData.is_public,
        }}
        validationSchema={EditPromptSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const response = await fetch(`/api/input_prompt/${promptId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(values),
            });

            if (!response.ok) {
              throw new Error("Failed to update prompt");
            }

            const updatedPrompt = await response.json();
            onSubmit(updatedPrompt);
            setSubmitting(false);
            onClose();
          } catch (err) {
            console.error("Failed to update prompt", err);
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <h2 className="text-2xl text-emphasis font-bold mb-3 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              Edit prompt
            </h2>
            <p className="hover:underline text-sm mb-2 cursor-pointer">
              Read docs for more info
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="prompt"
                  className="block text-sm font-medium mb-1"
                >
                  Title
                </label>
                <Field
                  as={TextInput}
                  id="prompt"
                  name="prompt"
                  placeholder="Title (e.g. 'Draft email')"
                />
                <ErrorMessage
                  name="prompt"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium mb-1"
                >
                  Content
                </label>
                <Field
                  as={Textarea}
                  id="content"
                  name="content"
                  placeholder="Enter prompt content (e.g. 'Write a professional-sounding email about the following content')"
                  rows={4}
                />
                <ErrorMessage
                  name="content"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <Field type="checkbox" name="is_public" className="mr-2" />
                  Make this prompt public
                </label>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isSubmitting ||
                  (values.prompt === promptData.prompt &&
                    values.content === promptData.content &&
                    values.is_public === promptData.is_public)
                }
              >
                {isSubmitting ? "Updating..." : "Update prompt"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </ModalWrapper>
  );
};

export default EditPromptModal;

import useSWR from "swr";

export interface InputPrompt {
  id: number;
  prompt: string;
  content: string;
  is_public: boolean;
}

export interface CreateInputPromptRequest {
  prompt: string;
  content: string;
  is_public: boolean;
}

const buildRequestBodyFromInputPromptCreationRequest = (
  request: CreateInputPromptRequest
) => {
  return JSON.stringify({
    prompt: request.prompt,
    content: request.content,
    is_public: request.is_public,
  });
};

export const createInputPrompt = async (
  request: CreateInputPromptRequest
): Promise<InputPrompt> => {
  const response = await fetch("/api/input_prompt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: buildRequestBodyFromInputPromptCreationRequest(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to create input prompt");
  }

  return response.json();
};

export const updateInputPrompt = async (
  id: number,
  request: CreateInputPromptRequest
): Promise<InputPrompt> => {
  const response = await fetch(`/api/input_prompt/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: buildRequestBodyFromInputPromptCreationRequest(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to update input prompt");
  }

  return response.json();
};

export const deleteInputPrompt = async (id: number): Promise<void> => {
  const response = await fetch(`/api/input_prompt/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to delete input prompt");
  }
};

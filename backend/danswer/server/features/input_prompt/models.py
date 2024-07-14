from uuid import UUID

from pydantic import BaseModel

from danswer.db.models import InputPrompt
from danswer.utils.logger import setup_logger

logger = setup_logger()


class CreateInputPromptRequest(BaseModel):
    prompt: str
    content: str


class UpdateInputPromptRequest(BaseModel):
    prompt: str
    content: str


class InputPromptResponse(BaseModel):
    id: int
    prompt: str
    content: str


class InputPromptListResponse(BaseModel):
    input_prompts: list[InputPromptResponse]


class InputPromptSnapshot(BaseModel):
    id: int
    prompt: str
    content: str
    active: bool
    user_id: UUID | None

    @classmethod
    def from_model(
        cls, input_prompt: InputPrompt, allow_deleted: bool = False
    ) -> "InputPromptSnapshot":
        if not input_prompt.active:
            error_msg = f"InputPrompt with ID {input_prompt.id} has been deleted"
            if not allow_deleted:
                raise ValueError(error_msg)
            else:
                logger.warning(error_msg)

        return InputPromptSnapshot(
            id=input_prompt.id,
            prompt=input_prompt.prompt,
            content=input_prompt.content,
            active=input_prompt.active,
            user_id=input_prompt.user_id,
        )

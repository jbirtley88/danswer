from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from danswer.db.models import InputPrompt
from danswer.db.models import User
from danswer.utils.logger import setup_logger

logger = setup_logger()


def check_prompt_validity(prompt: str) -> bool:
    """Check if a prompt is valid (not too long)."""
    if len(prompt) > 1000:  # Adjust this limit as needed
        logger.error(f"Prompt '{prompt[:50]}...' is too long, cannot be used")
        return False
    return True


def insert_input_prompt(
    prompt: str, content: str, is_public: bool, user: User | None, db_session: Session
) -> InputPrompt:
    if not check_prompt_validity(prompt):
        raise ValueError(f"Invalid prompt: {prompt}")

    input_prompt = InputPrompt(
        prompt=prompt,
        content=content,
        active=True,
        is_public=is_public if user is not None else True,
        user_id=user.id if user is not None else None,
    )
    db_session.add(input_prompt)
    db_session.commit()

    return input_prompt


def update_input_prompt(
    input_prompt_id: int,
    prompt: str,
    content: str,
    is_public: bool,
    db_session: Session,
) -> InputPrompt:
    input_prompt = db_session.scalar(
        select(InputPrompt).where(InputPrompt.id == input_prompt_id)
    )
    if input_prompt is None:
        raise ValueError(f"No input prompt with id {input_prompt_id}")

    if not check_prompt_validity(prompt):
        raise ValueError(f"Invalid prompt: {prompt}")

    input_prompt.prompt = prompt
    input_prompt.content = content
    input_prompt.is_public = is_public

    db_session.commit()

    return input_prompt


def remove_input_prompt(input_prompt_id: int, db_session: Session) -> None:
    input_prompt = db_session.scalar(
        select(InputPrompt).where(InputPrompt.id == input_prompt_id)
    )
    if input_prompt is None:
        raise ValueError(f"No input prompt with id {input_prompt_id}")

    input_prompt.active = False
    db_session.commit()


def fetch_input_prompts_by_user(
    user_id: UUID, db_session: Session
) -> list[InputPrompt]:
    return db_session.scalars(
        select(InputPrompt).where(
            InputPrompt.user_id == user_id, InputPrompt.active is True
        )
    ).all()


def fetch_public_input_prompts(db_session: Session) -> list[InputPrompt]:
    return db_session.scalars(
        select(InputPrompt).where(
            InputPrompt.is_public is True, InputPrompt.active is True
        )
    ).all()

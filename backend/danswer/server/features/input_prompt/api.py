from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from danswer.auth.users import current_admin_user
from danswer.auth.users import current_user
from danswer.db.engine import get_session
from danswer.db.input_prompt import fetch_input_prompts_by_user
from danswer.db.input_prompt import fetch_public_input_prompts
from danswer.db.input_prompt import insert_input_prompt
from danswer.db.input_prompt import remove_input_prompt
from danswer.db.input_prompt import update_input_prompt
from danswer.db.models import User
from danswer.server.features.input_prompt.models import CreateInputPromptRequest
from danswer.server.features.input_prompt.models import InputPromptSnapshot
from danswer.server.features.input_prompt.models import UpdateInputPromptRequest
from danswer.utils.logger import setup_logger

logger = setup_logger()

# router = APIRouter(prefix="/secondary-index")
# logger = setup_logger()
basic_router = APIRouter(prefix="/input_prompt")
admin_router = APIRouter(prefix="/admin/input_prompt")


@basic_router.get("")
def list_input_prompts_admin(
    _: User | None = Depends(current_admin_user),
    db_session: Session = Depends(get_session),
) -> list[InputPromptSnapshot]:
    public_prompts = fetch_public_input_prompts(db_session)
    print(public_prompts)
    return [InputPromptSnapshot.from_model(prompt) for prompt in public_prompts]


@basic_router.post("/create")
def create_input_prompt(
    create_input_prompt_request: CreateInputPromptRequest,
    user: User | None = Depends(current_user),
    db_session: Session = Depends(get_session),
) -> InputPromptSnapshot:
    input_prompt = insert_input_prompt(
        prompt=create_input_prompt_request.prompt,
        content=create_input_prompt_request.content,
        is_public=create_input_prompt_request.is_public,
        user=user,
        db_session=db_session,
    )
    return InputPromptSnapshot.from_model(input_prompt)


@basic_router.patch("/{input_prompt_id}")
def update_input_prompt_endpoint(
    input_prompt_id: int,
    update_input_prompt_request: UpdateInputPromptRequest,
    user: User | None = Depends(current_user),
    db_session: Session = Depends(get_session),
) -> InputPromptSnapshot:
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        updated_input_prompt = update_input_prompt(
            input_prompt_id=input_prompt_id,
            prompt=update_input_prompt_request.prompt,
            content=update_input_prompt_request.content,
            is_public=update_input_prompt_request.is_public,
            db_session=db_session,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return InputPromptSnapshot.from_model(updated_input_prompt)


@basic_router.delete("/{input_prompt_id}")
def delete_input_prompt(
    input_prompt_id: int,
    user: User | None = Depends(current_user),
    db_session: Session = Depends(get_session),
) -> None:
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        remove_input_prompt(input_prompt_id, db_session)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@basic_router.get("")
def list_input_prompts(
    user: User | None = Depends(current_user),
    db_session: Session = Depends(get_session),
) -> list[InputPromptSnapshot]:
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")

    user_prompts = fetch_input_prompts_by_user(user.id, db_session)
    return [InputPromptSnapshot.from_model(prompt) for prompt in user_prompts]


# @basic_router.get("/public")
# def list_public_input_prompts(
#     db_session: Session = Depends(get_session),
# ) -> list[InputPromptSnapshot]:
#     public_prompts = fetch_public_input_prompts(db_session)
#     return [InputPromptSnapshot.from_model(prompt) for prompt in public_prompts]

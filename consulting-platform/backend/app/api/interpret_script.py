from fastapi import APIRouter
from app.models.schemas import InterpretScriptRequest, InterpretScriptResponse
from app.agents.user_script_interpreter import interpret_user_script
from app.agents.form_schema_generator import generate_form_schema

router = APIRouter(prefix="/api", tags=["interpret"])


@router.post("/interpret-script", response_model=InterpretScriptResponse)
def interpret_script(request: InterpretScriptRequest):
    context = interpret_user_script(request.user_text)
    form_schema = generate_form_schema(context)
    return InterpretScriptResponse(
        success=True,
        interpreted_context=context,
        form_schema=form_schema,
    )

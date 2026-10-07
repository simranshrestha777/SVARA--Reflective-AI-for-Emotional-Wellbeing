from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    country: str | None = None
    region: str | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    country: str | None = None
    region: str | None = None
    is_admin: bool = False

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str

class ConversationCreate(BaseModel):
    title: str | None = None


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: int
    title: str | None
    messages: list[MessageResponse]

    class Config:
        from_attributes = True
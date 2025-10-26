from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from ..core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    set_token_cookie,
)
from ..core.supabase_client import supabase
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    name: Optional[str] = None
    email: str
    password: str

class UserInfo(BaseModel):
    id: str
    name: Optional[str] = None
    email: str
    role: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


@router.post("/register", response_model=Token)
async def register(user: UserCreate, response: Response):
    logger.debug(f"Register request: {user}")
    try:
        existing = supabase.table("users").select("email").eq("email", user.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = get_password_hash(user.password)
        user_data = {
            "name": user.name,
            "email": user.email,
            "hashed_password": hashed_password,
            "role": "member",
        }
        new_user = supabase.table("users").insert(user_data).execute()
        user_id = str(new_user.data[0]["id"])

        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user_id}, expires_delta=access_token_expires
        )

        set_token_cookie(response, access_token)
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error in register: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/login", response_model=Token)
async def login(user: UserCreate, response: Response):
    logger.debug(f"Login request: {user}")
    try:
        db_user = supabase.table("users").select("id, hashed_password").eq("email", user.email).execute()

        if not db_user.data or not verify_password(user.password, db_user.data[0]["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = str(db_user.data[0]["id"])
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user_id}, expires_delta=access_token_expires
        )

        set_token_cookie(response, access_token)
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error in login: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return JSONResponse(content={"detail": "Logged out successfully"})

@router.get("/me", response_model=UserInfo)
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "name": current_user.get("name"),
        "email": current_user["email"],
        "role": current_user.get("role"),
    }

@router.put("/me")
async def update_me(
    data: dict = Body(...), current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    updates = {}

    if "name" in data:
        updates["name"] = data["name"]
    if "email" in data:
        updates["email"] = data["email"]

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    res = supabase.table("users").update(updates).eq("id", user_id).execute()

    if not res.data or getattr(res, "error", None):
        raise HTTPException(status_code=400, detail="Failed to update user")

    updated_user = res.data[0]
    return {
        "id": updated_user["id"],
        "name": updated_user.get("name"),
        "email": updated_user["email"],
        "role": updated_user.get("role"),
    }

@router.post("/change-password")
async def change_password(request: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    user_data = supabase.table("users").select("hashed_password").eq("id", user_id).single().execute()

    if not getattr(user_data, "data", None) or getattr(user_data, "error", None):
        raise HTTPException(status_code=404, detail="User not found")

    hashed = user_data.data.get("hashed_password")
    if not verify_password(request.old_password, hashed):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    new_hashed = get_password_hash(request.new_password)

    res = supabase.table("users").update({"hashed_password": new_hashed}).eq("id", user_id).execute()

    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail="Failed to update password")

    return {"message": "Password updated successfully"}

@router.get("/users", summary="List all users (Admin only)")
async def list_all_users(current_user: dict = Depends(get_current_user)):
    # Check role
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    try:
        res = supabase.table("users").select("id, name, email").execute()
        users = res.data or []
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {e}")
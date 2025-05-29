from datetime import datetime, timedelta
from jose import jwt, JWTError
from pydantic import BaseModel
import pytz



# Retrieve values from environment variables
SECRET_KEY = "secretKey "
ALGORITHM = "alg"
ACCESS_TOKEN_EXPIRE_DAYS = expiryDate # Default to 10 days if not set

# Schema models for request/response validation
class TokenSchema(BaseModel):
    token_id: str

class UserSchema(BaseModel):
    username: str
    email: str
    password: str

class EidSchema(BaseModel):
    username: str
    email: str
    password: str

# For login schema
class LoginSchema(BaseModel):
    email: str
    password: str

# Create and decode JWT tokens
def create_access_token(data: str):
    # Get UTC time using pytz for correct timezone handling
    expire = datetime.now(pytz.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    token = jwt.encode({'key': data, 'exp': expire}, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_access_toke(token: str):
    try:
        # Decode the token and get payload
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return {"message": "invalid token"}

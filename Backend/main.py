from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from packet_capture_api import router as pcap_listen

# import from auth_utils
from auth_utility import UserSchema,TokenSchema,LoginSchema,EidSchema,create_access_token,decode_access_toke
# Import the models and database connection
from model import User_Detail
from database import engine, get_db
import model
from packet_capture import router as PCAPRouter
from get_alert_data import router as RESULT_ALERT_TABLE
from logs import router as logsData
from alert_trigerr_listen import router as ALERT_ROUTER
from statistic_api import router as STATISTIC_API
from fastapi.middleware.cors import CORSMiddleware

# Define the allowed origins (your Next.js frontend)
origins = [
    "http://localhost:3000",  # Frontend URL during development
]

# for password hashing
import bcrypt

def hashingPassword(password : str):
    salt = bcrypt.gensalt()
    # we encode password to byte because hashpy accept password on byte not str
    return bcrypt.hashpw(password.encode('utf-8'),salt).decode("utf-8")
# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows only the frontend URL to make requests
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Create all tables
model.Base.metadata.create_all(bind=engine)
@app.get("/UserDetail")
def UserDetail(user_email: str, db: Session = Depends(get_db)):
    user_detail = db.query(User_Detail).filter(User_Detail.email == user_email).first()

    if not user_detail:
        raise HTTPException(status_code=404, detail="User not found")

    # Return a more user-friendly response by serializing the SQLAlchemy object to a dictionary
    return {
        "message": "User found",
        "data": {
            "username": user_detail.username,
            "email": user_detail.email,
            "id": user_detail.id
        }
    }

@app.post("/register")
async def add_user(user: UserSchema, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User_Detail).filter(User_Detail.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password before storing
    hashed_password = hashingPassword(user.password)

    # Create new user record
    new_user = User_Detail(username=user.username, email=user.email, password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "username": new_user.username, "email": new_user.email}

@app.post("/login")
async def verifyUserDetail(user: LoginSchema, db: Session = Depends(get_db)):
    user_find = db.query(User_Detail).filter(User_Detail.email == user.email).first()
    
    # Check if user exists and password is correct
    if not user_find or not bcrypt.checkpw(user.password.encode('utf-8'), user_find.password.encode('utf-8')):
        raise HTTPException(status_code=400, detail="You are not registered or incorrect credentials")

    # Generate JWT Token
    access_token = create_access_token(user_find.email)  

    return {"message": "Successfully Logged In", "token": access_token}

# Protected route (token in body)
@app.post("/protected")
async def protected_route(token_data: TokenSchema):
    payload = decode_access_toke(token_data.token_id)
    return {payload.get("key")}


@app.post("/logs")
def logs(db :Session=Depends(get_db)):
    return {'data': "Hello world"}

@app.put("/EditProfile")
async def EditProfile(user: EidSchema, db: Session = Depends(get_db)):
    details = db.query(User_Detail).filter(User_Detail.email == user.email).first()
    
    if not details:
        raise HTTPException(status_code=404, detail="User not found")
    
    details.username = user.username
    details.email = user.email
    details.password = hashingPassword(user.password)

    db.commit()
    db.refresh(details)

    return {"success": True, "message": "Profile updated successfully", "data": {
        "username": details.username,
        "email": details.email
    }}


@app.post("/decodeAccessToken")
def DecodeToken(token :TokenSchema):
    data = decode_access_toke(token.token_id)
    return {"message" : data}


# scapy module
app.include_router(PCAPRouter)
app.include_router(pcap_listen)
app.include_router(ALERT_ROUTER)
app.include_router(RESULT_ALERT_TABLE)
app.include_router(STATISTIC_API)
app.include_router(logsData)
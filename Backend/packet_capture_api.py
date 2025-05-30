from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
import asyncio
import asyncpg
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
router = APIRouter()

# Store connected clients
clients = set()

# PostgreSQL listener background task
async def notify_listener():
    try:
        # Establish PostgreSQL connection (replace with your actual database connection string)
        conn = await asyncpg.connect("postgresql://postgres:pgadmin4@localhost:5432/Intrusion_Detection_System")
        await conn.add_listener("my_pcap_channelName", notify_callback)  # Listen to 'new_message' channel

        logger.info("Listening for PostgreSQL notifications on 'my_pcap_channelName' channel.")
        
        # Keep the listener alive indefinitely
        while True:
            await asyncio.sleep(3600)
    except Exception as e:
        logger.error(f"Error in notify_listener: {e}")

# Callback function to handle incoming notifications
def notify_callback(conn, pid, channel, payload):
    logger.info(f"Received notification: {payload}")
    # Push the notification payload to all connected clients
    for queue in clients:
        queue.put_nowait(payload)

# FastAPI startup event - start the background task
@router.on_event("startup")
async def startup():
    asyncio.create_task(notify_listener())

# FastAPI SSE endpoint to stream notifications to clients
@router.get("/stream")
async def message_stream():
    queue = asyncio.Queue()
    clients.add(queue)

    async def event_generator():
        try:
            while True:
                # Wait for new data (message) to be available in the queue
                data = await queue.get()
                # Send the data to the client in SSE format
                yield {"event": "message", "data": data}
        except asyncio.CancelledError:
            # Clean up when the connection is closed by the client
            clients.remove(queue)

    return EventSourceResponse(event_generator())

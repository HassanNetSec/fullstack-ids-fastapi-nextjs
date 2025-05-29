from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
import asyncio
import asyncpg
import logging
from typing import Set, AsyncGenerator, Dict, Any

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Store connected clients using weak references would be better in production
clients: Set[asyncio.Queue] = set()

async def notify_listener():
    conn = None
    try:
        # Establish PostgreSQL connection
        conn = await asyncpg.connect("postgresql://postgres:pgadmin4@localhost:5432/Intrusion_Detection_System")
        
        # Define callback inside the function to have access to 'clients'
        async def notify_callback(connection, pid, channel, payload):
            logger.info(f"Received notification on channel {channel}: {payload}")
            # Create a list of dead queues to clean up
            dead_queues = []
            
            for queue in clients:
                try:
                    queue.put_nowait(payload)
                except Exception as e:
                    logger.warning(f"Failed to send to client queue: {e}")
                    dead_queues.append(queue)
            
            # Clean up dead queues
            for dead_queue in dead_queues:
                clients.discard(dead_queue)

        await conn.add_listener("my_alert_channelName", notify_callback)
        logger.info("Listening for PostgreSQL notifications on 'my_alert_channelName' channel.")
        
        # Keep the connection alive
        while True:
            await asyncio.sleep(3600)  # Sleep for an hour
            
    except Exception as e:
        logger.error(f"Error in notify_listener: {e}")
        raise
    finally:
        if conn:
            await conn.close()

@router.on_event("startup")
async def startup():
    asyncio.create_task(notify_listener())

@router.get("/stream_alert")
async def message_stream() -> EventSourceResponse:
    queue: asyncio.Queue = asyncio.Queue(maxsize=10)  
    clients.add(queue)
    logger.info(f"New client connected. Total clients: {len(clients)}")

    async def event_generator() -> AsyncGenerator[Dict[str, Any], None]:
        try:
            while True:
                data = await queue.get()
                yield {
                    "event": "message",
                    "data": data,
                    "retry": 30000  # Tell client to retry after 30s if disconnected
                }
        except asyncio.CancelledError:
            logger.info("Client disconnected")
        finally:
            clients.discard(queue)
            logger.info(f"Client removed. Total clients: {len(clients)}")

    return EventSourceResponse(event_generator())
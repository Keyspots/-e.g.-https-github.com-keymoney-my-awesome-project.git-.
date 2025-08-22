from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any
import asyncio

# Import our models and analyzer
from models import (
    SEOAnalysisRequest, SEOAnalysisResponse, SEOAnalysisDB,
    ConsultationRequest, ConsultationResponse, ConsultationDB,
    TestimonialsResponse, Testimonial, ErrorResponse
)
from seo_analyzer import SEOAnalyzer

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="SEO Boost API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize SEO Analyzer
seo_analyzer = SEOAnalyzer()

# Rate limiting storage (in production, use Redis)
rate_limit_store: Dict[str, list] = {}

def get_client_ip(request: Request) -> str:
    """Get client IP address"""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host

def check_rate_limit(ip: str, limit: int = 3, window_hours: int = 1) -> bool:
    """Check if IP has exceeded rate limit"""
    now = datetime.utcnow()
    window_start = now - timedelta(hours=window_hours)
    
    if ip not in rate_limit_store:
        rate_limit_store[ip] = []
    
    # Remove old requests
    rate_limit_store[ip] = [
        timestamp for timestamp in rate_limit_store[ip] 
        if timestamp > window_start
    ]
    
    # Check if limit exceeded
    if len(rate_limit_store[ip]) >= limit:
        return False
    
    # Add current request
    rate_limit_store[ip].append(now)
    return True

# SEO Analysis Endpoints
@api_router.post("/seo/analyze", response_model=SEOAnalysisResponse)
async def analyze_seo(request_data: SEOAnalysisRequest, request: Request):
    """Analyze website SEO and return comprehensive report"""
    try:
        # Rate limiting
        client_ip = get_client_ip(request)
        if not check_rate_limit(client_ip):
            raise HTTPException(
                status_code=429, 
                detail="Rate limit exceeded. Maximum 3 analyses per hour."
            )
        
        # Perform SEO analysis
        result = await seo_analyzer.analyze_website(str(request_data.url))
        
        # Save to database
        analysis_db = SEOAnalysisDB(
            url=result.url,
            seoGrade=result.seoGrade.dict(),
            issues=[issue.dict() for issue in result.issues],
            recommendations=result.recommendations,
            ipAddress=client_ip
        )
        
        await db.seo_analyses.insert_one(analysis_db.dict())
        
        return SEOAnalysisResponse(success=True, data=result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"SEO Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")

# Contact/Consultation Endpoints
@api_router.post("/contact/consultation", response_model=ConsultationResponse)
async def submit_consultation_request(consultation: ConsultationRequest):
    """Handle free consultation form submissions"""
    try:
        # Save to database
        consultation_db = ConsultationDB(
            name=consultation.name,
            email=consultation.email,
            website=str(consultation.website) if consultation.website else None,
            message=consultation.message
        )
        
        await db.consultations.insert_one(consultation_db.dict())
        
        # In production, you would send an email notification here
        logging.info(f"New consultation request from {consultation.email}")
        
        return ConsultationResponse()
        
    except Exception as e:
        logging.error(f"Consultation submission error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit consultation request")

# Testimonials Endpoint
@api_router.get("/testimonials", response_model=TestimonialsResponse)
async def get_testimonials():
    """Get customer testimonials"""
    try:
        # For now, return static testimonials
        # In production, these would come from database
        testimonials = [
            Testimonial(
                name="Sarah Johnson",
                business="Local Bakery",
                rating=5,
                quote="Our website traffic increased 150% after they optimized our SEO. More customers are finding us online!"
            ),
            Testimonial(
                name="Mike Chen",
                business="Nonprofit Organization",
                rating=5,
                quote="As a nonprofit with limited budget, their affordable SEO services helped us reach more donors and volunteers."
            ),
            Testimonial(
                name="Lisa Rodriguez", 
                business="Consulting Firm",
                rating=5,
                quote="Professional, knowledgeable, and results-driven. Our Google rankings improved dramatically."
            )
        ]
        
        return TestimonialsResponse(data=testimonials)
        
    except Exception as e:
        logging.error(f"Testimonials fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch testimonials")

# Statistics Endpoint
@api_router.get("/stats")
async def get_stats():
    """Get website statistics"""
    try:
        # Get real stats from database
        total_analyses = await db.seo_analyses.count_documents({})
        total_consultations = await db.consultations.count_documents({})
        
        # Calculate some stats (in production, these would be more sophisticated)
        stats = [
            {"number": f"{total_analyses}+", "label": "Websites Analyzed"},
            {"number": "150%", "label": "Average Traffic Increase"},
            {"number": "98%", "label": "Client Satisfaction"},
            {"number": "30 Days", "label": "Average Time to Results"}
        ]
        
        return {"success": True, "data": stats}
        
    except Exception as e:
        logging.error(f"Stats fetch error: {str(e)}")
        return {
            "success": True, 
            "data": [
                {"number": "500+", "label": "Websites Optimized"},
                {"number": "150%", "label": "Average Traffic Increase"},
                {"number": "98%", "label": "Client Satisfaction"},
                {"number": "30 Days", "label": "Average Time to Results"}
            ]
        }

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Original hello world endpoint
@api_router.get("/")
async def root():
    return {"message": "SEO Boost API is running successfully!"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
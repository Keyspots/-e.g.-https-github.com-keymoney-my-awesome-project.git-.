from pydantic import BaseModel, Field, HttpUrl
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

# SEO Analysis Models
class SEOAnalysisRequest(BaseModel):
    url: HttpUrl

class SEOIssue(BaseModel):
    type: str = Field(..., description="Type: error, warning, info")
    category: str = Field(..., description="Category like Meta Tags, Performance, etc.")
    issue: str = Field(..., description="Brief issue description")
    impact: str = Field(..., description="Impact level: High, Medium, Low, Good")
    description: str = Field(..., description="Detailed description of the issue")

class SEOGrades(BaseModel):
    technical: int = Field(..., ge=0, le=100)
    content: int = Field(..., ge=0, le=100) 
    performance: int = Field(..., ge=0, le=100)
    mobile: int = Field(..., ge=0, le=100)
    security: int = Field(..., ge=0, le=100)

class SEOGrade(BaseModel):
    overall: int = Field(..., ge=0, le=100)
    grades: SEOGrades

class SEOAnalysisResult(BaseModel):
    url: str
    seoGrade: SEOGrade
    issues: List[SEOIssue]
    recommendations: List[str]
    analysisTime: datetime

class SEOAnalysisResponse(BaseModel):
    success: bool = True
    data: SEOAnalysisResult

# Contact Models  
class ConsultationRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., regex=r'^[^@]+@[^@]+\.[^@]+$')
    website: Optional[HttpUrl] = None
    message: str = Field(..., min_length=10, max_length=1000)

class ConsultationResponse(BaseModel):
    success: bool = True
    message: str = "Consultation request submitted successfully"

# Database Models
class SEOAnalysisDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    seoGrade: Dict[str, Any]
    issues: List[Dict[str, Any]]
    recommendations: List[str]
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    ipAddress: str

class ConsultationDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    website: Optional[str] = None
    message: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    status: str = "new"

# Testimonial Models
class Testimonial(BaseModel):
    name: str
    business: str
    rating: int = Field(..., ge=1, le=5)
    quote: str

class TestimonialsResponse(BaseModel):
    success: bool = True
    data: List[Testimonial]

# Error Response Model
class ErrorResponse(BaseModel):
    success: bool = False
    error: Dict[str, str]
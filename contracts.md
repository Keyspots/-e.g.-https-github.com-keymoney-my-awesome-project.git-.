# API Contracts for SEO Grading Service

## Overview
This document defines the API contracts for integrating the frontend SEO grading service with the backend. The frontend currently uses mock data in `mock.js` which will be replaced with real backend calls.

## Current Mock Data Structure

### Mock Data in `/app/frontend/src/mock.js`:
- `mockSEOData.seoGrade` - Overall and category-specific grades
- `mockSEOData.websiteAnalysis` - URL, issues, recommendations
- `mockSEOData.testimonials` - Customer testimonials  
- `mockSEOData.services` - Service packages
- `mockSEOData.stats` - Trust indicators
- `analyzeSEO(url)` - Simulates 2-second delay analysis

## Backend API Endpoints to Implement

### 1. POST `/api/seo/analyze`
**Purpose:** Analyze a website's SEO and return comprehensive grade report

**Request Body:**
```json
{
  "url": "https://example-business.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example-business.com",
    "seoGrade": {
      "overall": 78,
      "grades": {
        "technical": 85,
        "content": 72, 
        "performance": 81,
        "mobile": 76,
        "security": 90
      }
    },
    "issues": [
      {
        "type": "warning", // "error", "warning", "info"
        "category": "Meta Tags",
        "issue": "Missing meta description",
        "impact": "Medium", // "High", "Medium", "Low", "Good"
        "description": "Your page is missing a meta description..."
      }
    ],
    "recommendations": [
      "Add meta descriptions to all pages",
      "Optimize and compress images"
    ],
    "analysisTime": "2024-01-15T10:30:00Z"
  }
}
```

### 2. POST `/api/contact/consultation`  
**Purpose:** Handle free consultation form submissions

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "website": "https://example.com",
  "message": "Tell us about your business goals"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Consultation request submitted successfully"
}
```

### 3. GET `/api/testimonials`
**Purpose:** Get customer testimonials for display

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Sarah Johnson",
      "business": "Local Bakery", 
      "rating": 5,
      "quote": "Our website traffic increased 150%..."
    }
  ]
}
```

## Frontend Integration Changes

### Replace Mock Functions:
1. **Remove mock import** from `SEOLanding.js`
2. **Replace `analyzeSEO(url)`** with API call to `/api/seo/analyze`
3. **Add axios calls** for form submissions and data fetching
4. **Add proper error handling** for API failures
5. **Add loading states** with real backend delays

### Updated Frontend Code Structure:
```javascript
// Replace this mock call:
const result = await analyzeSEO(url);

// With this real API call:
const response = await axios.post(`${API}/seo/analyze`, { url });
const result = response.data.data;
```

## SEO Analysis Implementation Details

### Technical Analysis:
- Meta tags presence (title, description, keywords)
- Schema markup detection
- SSL certificate validation
- Mobile responsiveness check
- Page speed analysis (using external APIs like PageSpeed Insights)

### Content Analysis:  
- Keyword density
- Content length and quality
- Heading structure (H1, H2, etc.)
- Image alt text presence
- Internal/external linking

### Performance Metrics:
- Page load time
- Image optimization
- Minification status
- Caching headers

### Security Checks:
- HTTPS implementation  
- Security headers
- No mixed content warnings

## Database Schema

### SEO Analysis Results:
```javascript
{
  _id: ObjectId,
  url: String,
  seoGrade: {
    overall: Number,
    grades: {
      technical: Number,
      content: Number,
      performance: Number, 
      mobile: Number,
      security: Number
    }
  },
  issues: Array,
  recommendations: Array,
  createdAt: Date,
  ipAddress: String // For rate limiting
}
```

### Consultation Requests:
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  website: String,
  message: String,
  createdAt: Date,
  status: String // "new", "contacted", "converted"
}
```

## Error Handling

### API Error Responses:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "Please provide a valid website URL"
  }
}
```

### Frontend Error Handling:
- Invalid URL format
- Network connectivity issues  
- Website not accessible
- Rate limiting (max 3 analyses per IP per hour)
- Server errors

## Rate Limiting
- Implement rate limiting on SEO analysis endpoint
- Max 3 requests per IP address per hour
- Store in database for persistence

## External API Dependencies
- Google PageSpeed Insights API (for performance metrics)
- SSL Labs API (for security analysis)  
- Custom web scraping for meta tag analysis

## Security Considerations
- Validate and sanitize all URL inputs
- Implement CORS properly
- Rate limiting to prevent abuse
- Input validation for all form fields
- SQL injection prevention (using MongoDB)
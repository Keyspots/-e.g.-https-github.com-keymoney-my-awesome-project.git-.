#!/usr/bin/env python3
"""
Comprehensive Backend Testing for SEO Grading Service
Tests all API endpoints with various scenarios including edge cases
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from typing import Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat(),
            'response_data': response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}: {details}")
        
    async def test_health_endpoint(self):
        """Test health check endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/health") as response:
                data = await response.json()
                
                if response.status == 200 and data.get('status') == 'healthy':
                    self.log_test("Health Check", True, "Backend is healthy", data)
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
                    
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
    
    async def test_stats_endpoint(self):
        """Test statistics endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/stats") as response:
                data = await response.json()
                
                if response.status == 200 and data.get('success'):
                    stats_data = data.get('data', [])
                    if isinstance(stats_data, list) and len(stats_data) >= 4:
                        # Check if stats have proper structure
                        required_fields = ['number', 'label']
                        valid_stats = all(
                            all(field in stat for field in required_fields) 
                            for stat in stats_data
                        )
                        
                        if valid_stats:
                            self.log_test("Statistics API", True, f"Retrieved {len(stats_data)} stats", data)
                        else:
                            self.log_test("Statistics API", False, "Invalid stats structure", data)
                    else:
                        self.log_test("Statistics API", False, "Invalid stats data format", data)
                else:
                    self.log_test("Statistics API", False, f"API error: {data}")
                    
        except Exception as e:
            self.log_test("Statistics API", False, f"Request failed: {str(e)}")
    
    async def test_seo_analysis_valid_url(self):
        """Test SEO analysis with valid URL"""
        test_url = "https://example.com"
        payload = {"url": test_url}
        
        try:
            async with self.session.post(
                f"{API_BASE}/seo/analyze", 
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                data = await response.json()
                
                if response.status == 200 and data.get('success'):
                    analysis_data = data.get('data')
                    
                    # Validate response structure
                    required_fields = ['url', 'seoGrade', 'issues', 'recommendations', 'analysisTime']
                    if all(field in analysis_data for field in required_fields):
                        # Check SEO grade structure
                        seo_grade = analysis_data['seoGrade']
                        if 'overall' in seo_grade and 'grades' in seo_grade:
                            grades = seo_grade['grades']
                            grade_fields = ['technical', 'content', 'performance', 'mobile', 'security']
                            
                            if all(field in grades for field in grade_fields):
                                self.log_test("SEO Analysis - Valid URL", True, 
                                            f"Analysis completed for {test_url}, Overall grade: {seo_grade['overall']}", 
                                            analysis_data)
                            else:
                                self.log_test("SEO Analysis - Valid URL", False, "Missing grade fields", data)
                        else:
                            self.log_test("SEO Analysis - Valid URL", False, "Invalid SEO grade structure", data)
                    else:
                        self.log_test("SEO Analysis - Valid URL", False, "Missing required fields", data)
                else:
                    self.log_test("SEO Analysis - Valid URL", False, f"API error: {data}")
                    
        except Exception as e:
            self.log_test("SEO Analysis - Valid URL", False, f"Request failed: {str(e)}")
    
    async def test_seo_analysis_invalid_url(self):
        """Test SEO analysis with invalid URL"""
        invalid_urls = [
            "not-a-url",
            "http://",
            "invalid.url.format",
            ""
        ]
        
        for invalid_url in invalid_urls:
            payload = {"url": invalid_url}
            
            try:
                async with self.session.post(
                    f"{API_BASE}/seo/analyze", 
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    
                    if response.status == 422:  # Validation error
                        self.log_test(f"SEO Analysis - Invalid URL ({invalid_url})", True, 
                                    "Correctly rejected invalid URL")
                    elif response.status == 400:  # Bad request
                        data = await response.json()
                        self.log_test(f"SEO Analysis - Invalid URL ({invalid_url})", True, 
                                    f"Correctly rejected: {data.get('detail', 'Bad request')}")
                    else:
                        data = await response.json()
                        self.log_test(f"SEO Analysis - Invalid URL ({invalid_url})", False, 
                                    f"Unexpected response: {response.status} - {data}")
                        
            except Exception as e:
                self.log_test(f"SEO Analysis - Invalid URL ({invalid_url})", False, f"Request failed: {str(e)}")
    
    async def test_seo_analysis_unreachable_url(self):
        """Test SEO analysis with unreachable URL"""
        unreachable_url = "https://this-domain-definitely-does-not-exist-12345.com"
        payload = {"url": unreachable_url}
        
        try:
            async with self.session.post(
                f"{API_BASE}/seo/analyze", 
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                data = await response.json()
                
                # Should either return error analysis or HTTP error
                if response.status == 200:
                    analysis_data = data.get('data')
                    if analysis_data and analysis_data.get('seoGrade', {}).get('overall') == 0:
                        self.log_test("SEO Analysis - Unreachable URL", True, 
                                    "Correctly handled unreachable URL with error analysis")
                    else:
                        self.log_test("SEO Analysis - Unreachable URL", False, 
                                    "Should return error analysis for unreachable URL", data)
                elif response.status == 500:
                    self.log_test("SEO Analysis - Unreachable URL", True, 
                                "Correctly returned server error for unreachable URL")
                else:
                    self.log_test("SEO Analysis - Unreachable URL", False, 
                                f"Unexpected response: {response.status} - {data}")
                    
        except Exception as e:
            self.log_test("SEO Analysis - Unreachable URL", False, f"Request failed: {str(e)}")
    
    async def test_seo_rate_limiting(self):
        """Test SEO analysis rate limiting (3 requests per hour per IP)"""
        test_url = "https://httpbin.org/html"
        payload = {"url": test_url}
        
        # Make 4 requests quickly to test rate limiting
        for i in range(4):
            try:
                async with self.session.post(
                    f"{API_BASE}/seo/analyze", 
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    
                    if i < 3:  # First 3 should succeed
                        if response.status == 200:
                            self.log_test(f"Rate Limiting - Request {i+1}", True, "Request allowed")
                        else:
                            data = await response.json()
                            self.log_test(f"Rate Limiting - Request {i+1}", False, 
                                        f"Unexpected status: {response.status} - {data}")
                    else:  # 4th should be rate limited
                        if response.status == 429:
                            data = await response.json()
                            self.log_test("Rate Limiting - Exceeded Limit", True, 
                                        f"Correctly rate limited: {data.get('detail')}")
                        else:
                            data = await response.json()
                            self.log_test("Rate Limiting - Exceeded Limit", False, 
                                        f"Should be rate limited but got: {response.status} - {data}")
                            
            except Exception as e:
                self.log_test(f"Rate Limiting - Request {i+1}", False, f"Request failed: {str(e)}")
                
            # Small delay between requests
            await asyncio.sleep(0.1)
    
    async def test_consultation_form_valid(self):
        """Test consultation form with valid data"""
        valid_data = {
            "name": "John Smith",
            "email": "john.smith@example.com",
            "website": "https://example.com",
            "message": "I would like to improve my website's SEO performance and increase organic traffic."
        }
        
        try:
            async with self.session.post(
                f"{API_BASE}/contact/consultation", 
                json=valid_data,
                headers={'Content-Type': 'application/json'}
            ) as response:
                data = await response.json()
                
                if response.status == 200 and data.get('success'):
                    self.log_test("Consultation Form - Valid Data", True, 
                                f"Form submitted successfully: {data.get('message')}", data)
                else:
                    self.log_test("Consultation Form - Valid Data", False, 
                                f"Submission failed: {response.status} - {data}")
                    
        except Exception as e:
            self.log_test("Consultation Form - Valid Data", False, f"Request failed: {str(e)}")
    
    async def test_consultation_form_validation(self):
        """Test consultation form validation"""
        invalid_cases = [
            {
                "data": {"name": "", "email": "test@example.com", "message": "Test message"},
                "case": "Empty name"
            },
            {
                "data": {"name": "John", "email": "invalid-email", "message": "Test message"},
                "case": "Invalid email format"
            },
            {
                "data": {"name": "John", "email": "test@example.com", "message": "Short"},
                "case": "Message too short"
            },
            {
                "data": {"email": "test@example.com", "message": "Test message"},
                "case": "Missing name"
            },
            {
                "data": {"name": "John", "message": "Test message"},
                "case": "Missing email"
            },
            {
                "data": {"name": "John", "email": "test@example.com"},
                "case": "Missing message"
            }
        ]
        
        for case in invalid_cases:
            try:
                async with self.session.post(
                    f"{API_BASE}/contact/consultation", 
                    json=case["data"],
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    
                    if response.status == 422:  # Validation error
                        self.log_test(f"Consultation Validation - {case['case']}", True, 
                                    "Correctly rejected invalid data")
                    else:
                        data = await response.json()
                        self.log_test(f"Consultation Validation - {case['case']}", False, 
                                    f"Should reject invalid data but got: {response.status} - {data}")
                        
            except Exception as e:
                self.log_test(f"Consultation Validation - {case['case']}", False, f"Request failed: {str(e)}")
    
    async def test_testimonials_endpoint(self):
        """Test testimonials endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/testimonials") as response:
                data = await response.json()
                
                if response.status == 200 and data.get('success'):
                    testimonials = data.get('data', [])
                    if isinstance(testimonials, list) and len(testimonials) > 0:
                        # Check testimonial structure
                        required_fields = ['name', 'business', 'rating', 'quote']
                        valid_testimonials = all(
                            all(field in testimonial for field in required_fields) 
                            for testimonial in testimonials
                        )
                        
                        if valid_testimonials:
                            self.log_test("Testimonials API", True, 
                                        f"Retrieved {len(testimonials)} testimonials", data)
                        else:
                            self.log_test("Testimonials API", False, "Invalid testimonial structure", data)
                    else:
                        self.log_test("Testimonials API", False, "No testimonials returned", data)
                else:
                    self.log_test("Testimonials API", False, f"API error: {data}")
                    
        except Exception as e:
            self.log_test("Testimonials API", False, f"Request failed: {str(e)}")
    
    async def test_cors_functionality(self):
        """Test CORS headers"""
        try:
            async with self.session.options(f"{API_BASE}/health") as response:
                cors_headers = {
                    'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                    'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
                    'access-control-allow-headers': response.headers.get('access-control-allow-headers')
                }
                
                if cors_headers['access-control-allow-origin']:
                    self.log_test("CORS Functionality", True, 
                                f"CORS headers present: {cors_headers}")
                else:
                    self.log_test("CORS Functionality", False, 
                                "Missing CORS headers", cors_headers)
                    
        except Exception as e:
            self.log_test("CORS Functionality", False, f"Request failed: {str(e)}")
    
    async def test_api_prefix_routing(self):
        """Test that all endpoints require /api prefix"""
        endpoints_to_test = [
            "/health",
            "/stats", 
            "/testimonials"
        ]
        
        for endpoint in endpoints_to_test:
            # Test without /api prefix (should fail)
            try:
                async with self.session.get(f"{BACKEND_URL}{endpoint}") as response:
                    if response.status == 404:
                        self.log_test(f"API Prefix - {endpoint} without /api", True, 
                                    "Correctly requires /api prefix")
                    else:
                        self.log_test(f"API Prefix - {endpoint} without /api", False, 
                                    f"Should return 404 but got: {response.status}")
            except Exception as e:
                self.log_test(f"API Prefix - {endpoint} without /api", True, 
                            f"Correctly failed without /api prefix: {str(e)}")
    
    def print_summary(self):
        """Print test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "="*60)
        print("BACKEND TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\nFAILED TESTS:")
            print("-" * 40)
            for result in self.test_results:
                if not result['success']:
                    print(f"❌ {result['test']}: {result['details']}")
        
        print("\n" + "="*60)
        
        return {
            'total': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'success_rate': (passed_tests/total_tests)*100,
            'results': self.test_results
        }

async def run_all_tests():
    """Run all backend tests"""
    print("Starting comprehensive backend testing...")
    print(f"Testing backend at: {API_BASE}")
    print("="*60)
    
    async with BackendTester() as tester:
        # Basic connectivity tests
        await tester.test_health_endpoint()
        await tester.test_stats_endpoint()
        await tester.test_testimonials_endpoint()
        
        # SEO Analysis tests
        await tester.test_seo_analysis_valid_url()
        await tester.test_seo_analysis_invalid_url()
        await tester.test_seo_analysis_unreachable_url()
        await tester.test_seo_rate_limiting()
        
        # Consultation form tests
        await tester.test_consultation_form_valid()
        await tester.test_consultation_form_validation()
        
        # Infrastructure tests
        await tester.test_cors_functionality()
        await tester.test_api_prefix_routing()
        
        # Print summary
        summary = tester.print_summary()
        
        return summary

if __name__ == "__main__":
    # Run the tests
    summary = asyncio.run(run_all_tests())
    
    # Exit with appropriate code
    if summary['failed'] > 0:
        exit(1)
    else:
        exit(0)
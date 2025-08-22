import aiohttp
import asyncio
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
import validators
import re
import ssl
from typing import Dict, List, Tuple
from models import SEOIssue, SEOGrades, SEOGrade, SEOAnalysisResult
from datetime import datetime

class SEOAnalyzer:
    def __init__(self):
        self.timeout = aiohttp.ClientTimeout(total=30)
        
    async def analyze_website(self, url: str) -> SEOAnalysisResult:
        """Main method to analyze a website's SEO"""
        try:
            # Clean and validate URL
            clean_url = self._clean_url(url)
            
            # Fetch website content
            html_content, response_info = await self._fetch_website(clean_url)
            
            if not html_content:
                return self._create_error_result(clean_url, "Unable to fetch website content")
            
            # Parse HTML
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Run all analyses
            technical_score, technical_issues = self._analyze_technical_seo(soup, clean_url, response_info)
            content_score, content_issues = self._analyze_content_seo(soup)
            performance_score, performance_issues = self._analyze_performance(response_info, html_content)
            mobile_score, mobile_issues = self._analyze_mobile_friendliness(soup)
            security_score, security_issues = self._analyze_security(clean_url, response_info)
            
            # Combine all issues
            all_issues = technical_issues + content_issues + performance_issues + mobile_issues + security_issues
            
            # Calculate overall grade
            grades = SEOGrades(
                technical=technical_score,
                content=content_score,
                performance=performance_score,
                mobile=mobile_score,
                security=security_score
            )
            
            overall_score = int((technical_score + content_score + performance_score + mobile_score + security_score) / 5)
            
            seo_grade = SEOGrade(overall=overall_score, grades=grades)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(all_issues)
            
            return SEOAnalysisResult(
                url=clean_url,
                seoGrade=seo_grade,
                issues=all_issues,
                recommendations=recommendations,
                analysisTime=datetime.utcnow()
            )
            
        except Exception as e:
            return self._create_error_result(url, f"Analysis failed: {str(e)}")
    
    def _clean_url(self, url: str) -> str:
        """Clean and validate URL"""
        if not url.startswith(('http://', 'https://')):
            url = f"https://{url}"
        
        if not validators.url(url):
            raise ValueError("Invalid URL format")
        
        return url
    
    async def _fetch_website(self, url: str) -> Tuple[str, Dict]:
        """Fetch website content and response info"""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(url, allow_redirects=True) as response:
                    content = await response.text()
                    response_info = {
                        'status_code': response.status,
                        'headers': dict(response.headers),
                        'url': str(response.url),
                        'content_length': len(content),
                        'load_time': 0  # Would need more sophisticated timing
                    }
                    return content, response_info
        except Exception as e:
            return None, {'error': str(e)}
    
    def _analyze_technical_seo(self, soup: BeautifulSoup, url: str, response_info: Dict) -> Tuple[int, List[SEOIssue]]:
        """Analyze technical SEO factors"""
        issues = []
        score = 100
        
        # Check meta title
        title_tag = soup.find('title')
        if not title_tag or not title_tag.text.strip():
            issues.append(SEOIssue(
                type="error",
                category="Meta Tags",
                issue="Missing page title",
                impact="High",
                description="Your page is missing a title tag, which is crucial for search rankings."
            ))
            score -= 20
        elif len(title_tag.text.strip()) > 60:
            issues.append(SEOIssue(
                type="warning", 
                category="Meta Tags",
                issue="Title tag too long",
                impact="Medium",
                description="Your title tag is over 60 characters and may be truncated in search results."
            ))
            score -= 10
        
        # Check meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if not meta_desc or not meta_desc.get('content', '').strip():
            issues.append(SEOIssue(
                type="warning",
                category="Meta Tags", 
                issue="Missing meta description",
                impact="Medium",
                description="Your page is missing a meta description which helps search engines understand your content."
            ))
            score -= 15
        elif len(meta_desc.get('content', '')) > 160:
            issues.append(SEOIssue(
                type="warning",
                category="Meta Tags",
                issue="Meta description too long", 
                impact="Medium",
                description="Your meta description is over 160 characters and may be truncated."
            ))
            score -= 10
        
        # Check H1 tag
        h1_tags = soup.find_all('h1')
        if not h1_tags:
            issues.append(SEOIssue(
                type="error",
                category="Content Structure",
                issue="Missing H1 tag",
                impact="High", 
                description="Your page is missing an H1 tag, which is important for content structure."
            ))
            score -= 20
        elif len(h1_tags) > 1:
            issues.append(SEOIssue(
                type="warning",
                category="Content Structure",
                issue="Multiple H1 tags",
                impact="Medium",
                description="Your page has multiple H1 tags. Consider using only one H1 per page."
            ))
            score -= 10
        
        # Check images without alt text
        images = soup.find_all('img')
        images_without_alt = [img for img in images if not img.get('alt', '').strip()]
        if images_without_alt:
            issues.append(SEOIssue(
                type="warning",
                category="Images",
                issue="Images missing alt text",
                impact="Medium", 
                description=f"{len(images_without_alt)} images are missing alt text, which hurts accessibility and SEO."
            ))
            score -= min(15, len(images_without_alt) * 3)
        
        return max(score, 0), issues
    
    def _analyze_content_seo(self, soup: BeautifulSoup) -> Tuple[int, List[SEOIssue]]:
        """Analyze content quality and SEO"""
        issues = []
        score = 100
        
        # Get text content
        text_content = soup.get_text()
        word_count = len(text_content.split())
        
        # Check content length
        if word_count < 300:
            issues.append(SEOIssue(
                type="warning",
                category="Content",
                issue="Low content length",
                impact="Medium",
                description=f"Your page has only {word_count} words. Consider adding more valuable content."
            ))
            score -= 20
        
        # Check heading structure
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        if len(headings) < 2:
            issues.append(SEOIssue(
                type="warning",
                category="Content Structure", 
                issue="Poor heading structure",
                impact="Medium",
                description="Your page has few headings. Use H2, H3 tags to structure your content."
            ))
            score -= 15
        
        # Check for internal links
        internal_links = soup.find_all('a', href=True)
        if len(internal_links) < 3:
            issues.append(SEOIssue(
                type="info",
                category="Linking",
                issue="Limited internal linking", 
                impact="Low",
                description="Consider adding more internal links to improve site navigation and SEO."
            ))
            score -= 10
        
        return max(score, 0), issues
    
    def _analyze_performance(self, response_info: Dict, html_content: str) -> Tuple[int, List[SEOIssue]]:
        """Analyze performance factors"""
        issues = []
        score = 100
        
        # Check content size
        content_size = response_info.get('content_length', 0)
        if content_size > 500000:  # 500KB
            issues.append(SEOIssue(
                type="warning",
                category="Performance",
                issue="Large page size",
                impact="Medium",
                description="Your page is quite large which may slow down loading speed."
            ))
            score -= 20
        
        # Check for compression
        headers = response_info.get('headers', {})
        if 'content-encoding' not in headers:
            issues.append(SEOIssue(
                type="warning", 
                category="Performance",
                issue="No compression detected",
                impact="Medium",
                description="Enable Gzip compression to reduce page load times."
            ))
            score -= 15
        
        # Check for caching headers
        cache_headers = ['cache-control', 'expires', 'etag']
        if not any(header in headers for header in cache_headers):
            issues.append(SEOIssue(
                type="info",
                category="Performance",
                issue="Missing caching headers", 
                impact="Low",
                description="Add caching headers to improve page load times for returning visitors."
            ))
            score -= 10
        
        return max(score, 0), issues
    
    def _analyze_mobile_friendliness(self, soup: BeautifulSoup) -> Tuple[int, List[SEOIssue]]:
        """Analyze mobile friendliness"""
        issues = []
        score = 100
        
        # Check viewport meta tag
        viewport = soup.find('meta', attrs={'name': 'viewport'})
        if not viewport:
            issues.append(SEOIssue(
                type="error",
                category="Mobile",
                issue="Missing viewport meta tag",
                impact="High",
                description="Your page is missing a viewport meta tag, essential for mobile responsiveness."
            ))
            score -= 30
        
        # Check for responsive design indicators
        styles = soup.find_all('style')
        links = soup.find_all('link', rel='stylesheet')
        
        has_media_queries = False
        for style in styles:
            if style.string and '@media' in style.string:
                has_media_queries = True
                break
        
        if not has_media_queries:
            issues.append(SEOIssue(
                type="warning",
                category="Mobile", 
                issue="No responsive design detected",
                impact="Medium",
                description="Your site may not be optimized for mobile devices."
            ))
            score -= 20
        
        return max(score, 0), issues
    
    def _analyze_security(self, url: str, response_info: Dict) -> Tuple[int, List[SEOIssue]]:
        """Analyze security factors"""
        issues = []
        score = 100
        
        # Check HTTPS
        if not url.startswith('https://'):
            issues.append(SEOIssue(
                type="error",
                category="Security",
                issue="Not using HTTPS",
                impact="High",
                description="Your website is not using HTTPS, which is required for security and SEO."
            ))
            score -= 40
        
        # Check security headers
        headers = response_info.get('headers', {})
        security_headers = {
            'strict-transport-security': 'Missing HSTS header',
            'x-frame-options': 'Missing X-Frame-Options header',
            'x-content-type-options': 'Missing X-Content-Type-Options header'
        }
        
        missing_headers = []
        for header, message in security_headers.items():
            if header not in headers:
                missing_headers.append(message)
        
        if missing_headers:
            issues.append(SEOIssue(
                type="info",
                category="Security",
                issue="Missing security headers",
                impact="Low", 
                description="Consider adding security headers to improve website security."
            ))
            score -= len(missing_headers) * 5
        
        return max(score, 0), issues
    
    def _generate_recommendations(self, issues: List[SEOIssue]) -> List[str]:
        """Generate actionable recommendations based on issues"""
        recommendations = []
        
        # Group issues by category
        issue_categories = {}
        for issue in issues:
            if issue.category not in issue_categories:
                issue_categories[issue.category] = []
            issue_categories[issue.category].append(issue)
        
        # Generate recommendations based on categories
        if 'Meta Tags' in issue_categories:
            recommendations.append("Optimize your meta titles and descriptions for better search visibility")
        
        if 'Performance' in issue_categories:
            recommendations.append("Improve page loading speed by optimizing images and enabling compression")
        
        if 'Content Structure' in issue_categories:
            recommendations.append("Improve content structure with proper heading hierarchy and more content")
        
        if 'Mobile' in issue_categories:
            recommendations.append("Ensure your website is fully responsive and mobile-friendly")
        
        if 'Security' in issue_categories:
            recommendations.append("Implement HTTPS and security headers to build user trust")
        
        if 'Images' in issue_categories:
            recommendations.append("Add descriptive alt text to all images for better accessibility")
        
        if 'Linking' in issue_categories:
            recommendations.append("Improve internal linking structure to help users and search engines navigate")
        
        # Add general recommendations if fewer than 3
        if len(recommendations) < 3:
            general_recs = [
                "Create high-quality, valuable content for your target audience",
                "Build quality backlinks from reputable websites in your industry", 
                "Regularly update your website with fresh, relevant content",
                "Optimize for local search if you serve a specific geographic area"
            ]
            recommendations.extend(general_recs[:3-len(recommendations)])
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    def _create_error_result(self, url: str, error_message: str) -> SEOAnalysisResult:
        """Create an error result when analysis fails"""
        return SEOAnalysisResult(
            url=url,
            seoGrade=SEOGrade(
                overall=0,
                grades=SEOGrades(
                    technical=0, content=0, performance=0, mobile=0, security=0
                )
            ),
            issues=[SEOIssue(
                type="error",
                category="Analysis",
                issue="Analysis failed",
                impact="High", 
                description=error_message
            )],
            recommendations=["Please check your website URL and try again"],
            analysisTime=datetime.utcnow()
        )
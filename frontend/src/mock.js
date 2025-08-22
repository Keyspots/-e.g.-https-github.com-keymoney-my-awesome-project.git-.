// Mock data for SEO grading service

export const mockSEOData = {
  // Sample SEO analysis results
  seoGrade: {
    overall: 78,
    grades: {
      technical: 85,
      content: 72,
      performance: 81,
      mobile: 76,
      security: 90
    }
  },
  
  // Mock website analysis
  websiteAnalysis: {
    url: "https://example-business.com",
    title: "Example Small Business",
    issues: [
      {
        type: "warning",
        category: "Meta Tags",
        issue: "Missing meta description",
        impact: "Medium",
        description: "Your page is missing a meta description which helps search engines understand your content."
      },
      {
        type: "error", 
        category: "Performance",
        issue: "Large image files",
        impact: "High",
        description: "Several images are over 500KB which slows down your page loading speed."
      },
      {
        type: "warning",
        category: "Content",
        issue: "Low keyword density",
        impact: "Medium", 
        description: "Your main keywords appear less frequently than recommended."
      },
      {
        type: "info",
        category: "Mobile",
        issue: "Mobile-friendly design",
        impact: "Good",
        description: "Your website is mobile responsive - great job!"
      }
    ],
    recommendations: [
      "Add meta descriptions to all pages",
      "Optimize and compress images",
      "Improve internal linking structure",
      "Add schema markup for better visibility"
    ]
  },

  // Mock testimonials
  testimonials: [
    {
      name: "Sarah Johnson", 
      business: "Local Bakery",
      rating: 5,
      quote: "Our website traffic increased 150% after they optimized our SEO. More customers are finding us online!"
    },
    {
      name: "Mike Chen",
      business: "Nonprofit Organization", 
      rating: 5,
      quote: "As a nonprofit with limited budget, their affordable SEO services helped us reach more donors and volunteers."
    },
    {
      name: "Lisa Rodriguez",
      business: "Consulting Firm",
      rating: 5,
      quote: "Professional, knowledgeable, and results-driven. Our Google rankings improved dramatically."
    }
  ],

  // Mock service packages
  services: [
    {
      name: "SEO Audit",
      price: "Free",
      description: "Comprehensive analysis of your website's SEO performance",
      features: [
        "Technical SEO analysis",
        "Content optimization review", 
        "Performance audit",
        "Mobile-friendliness check",
        "Detailed recommendations report"
      ],
      cta: "Get Free Audit"
    },
    {
      name: "Small Business Package", 
      price: "$299/month",
      description: "Perfect for local businesses and startups",
      features: [
        "Monthly SEO optimization",
        "Local SEO setup",
        "Google My Business optimization", 
        "5 pages optimized",
        "Monthly progress reports",
        "Basic competitor analysis"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Nonprofit Special",
      price: "$199/month", 
      description: "Special pricing for nonprofit organizations",
      features: [
        "SEO optimization",
        "Donation page optimization",
        "Event page SEO",
        "3 pages optimized", 
        "Quarterly reports",
        "Volunteer recruitment SEO"
      ],
      cta: "Apply Now"
    }
  ],

  // Mock stats
  stats: [
    { number: "500+", label: "Websites Optimized" },
    { number: "150%", label: "Average Traffic Increase" }, 
    { number: "98%", label: "Client Satisfaction" },
    { number: "30 Days", label: "Average Time to Results" }
  ]
};

// Simulate SEO analysis with delay
export const analyzeSEO = async (url) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock different grades based on URL for demo
      const baseGrade = 65 + Math.floor(Math.random() * 30);
      const analysis = {
        ...mockSEOData.websiteAnalysis,
        url: url,
        seoGrade: {
          overall: baseGrade,
          grades: {
            technical: baseGrade + Math.floor(Math.random() * 20 - 10),
            content: baseGrade + Math.floor(Math.random() * 20 - 10), 
            performance: baseGrade + Math.floor(Math.random() * 20 - 10),
            mobile: baseGrade + Math.floor(Math.random() * 20 - 10),
            security: baseGrade + Math.floor(Math.random() * 20 - 10)
          }
        }
      };
      resolve(analysis);
    }, 2000); // 2 second delay to simulate real analysis
  });
};
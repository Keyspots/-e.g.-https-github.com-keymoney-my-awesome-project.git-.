import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, AlertTriangle, XCircle, Star, Users, TrendingUp, Shield, Smartphone, Gauge, ArrowRight, Globe, Mail, Phone } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SEOLanding = () => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([
    { number: "500+", label: "Websites Optimized" },
    { number: "150%", label: "Average Traffic Increase" }, 
    { number: "98%", label: "Client Satisfaction" },
    { number: "30 Days", label: "Average Time to Results" }
  ]);
  const [testimonials] = useState([
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
  ]);

  // Fetch stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/stats`);
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Keep default stats if API fails
      }
    };
    
    fetchStats();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API}/seo/analyze`, { url });
      
      if (response.data.success) {
        setAnalysis(response.data.data);
        setShowResults(true);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      
      if (error.response?.status === 429) {
        setError('Rate limit exceeded. Please try again in an hour.');
      } else if (error.response?.status === 400) {
        setError('Please enter a valid website URL.');
      } else {
        setError('Analysis failed. Please check your URL and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const consultationData = {
      name: formData.get('name'),
      email: formData.get('email'),
      website: formData.get('website'),
      message: formData.get('message')
    };
    
    try {
      const response = await axios.post(`${API}/contact/consultation`, consultationData);
      
      if (response.data.success) {
        alert('Thank you! We\'ll contact you within 24 hours.');
        e.target.reset();
      }
    } catch (error) {
      console.error('Consultation submission failed:', error);
      alert('Failed to submit. Please try again or contact us directly.');
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 80) return 'var(--accent-primary)';
    if (grade >= 60) return '#FFA500';
    return '#FF6B6B';
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'info': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="container py-6 border-b border-gray-800">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Search className="w-8 h-8" style={{color: 'var(--accent-primary)'}} />
            <span className="h2 text-white">SEOBoost</span>
          </div>
          <div className="hidden md:flex gap-6">
            <a href="#features" className="btn-ghost">Features</a>
            <a href="#pricing" className="btn-ghost">Pricing</a>
            <a href="#contact" className="btn-ghost">Contact</a>
            <a href="#contact" className="btn-primary">Get Started</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="display-md mb-6">
            Get Your <span style={{color: 'var(--accent-primary)'}}>Free SEO Grade</span><br />
            Boost Your Website Traffic Today
          </h1>
          <p className="body-lg mb-12 max-w-2xl mx-auto">
            Discover exactly what's holding your website back from ranking higher on Google. 
            Get a comprehensive SEO analysis and actionable recommendations in under 60 seconds.
          </p>

          {/* URL Input Form */}
          <div className="max-w-md mx-auto mb-12">
            <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4">
              <input
                type="url"
                placeholder="Enter your website URL (e.g., https://yourbusiness.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input-field flex-1"
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary whitespace-nowrap"
              >
                {loading ? 'Analyzing...' : 'Analyze Now'}
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>
            </form>
            <p className="body-sm mt-2">
              ✓ 100% Free • ✓ No Registration Required • ✓ Instant Results
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="h2" style={{color: 'var(--accent-primary)'}}>{stat.number}</div>
                <div className="body-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {error && (
            <div className="max-w-md mx-auto mt-6 p-4 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* SEO Results Section */}
      {showResults && analysis && (
        <section className="container py-16 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="h1 mb-4">Your SEO Grade Report</h2>
              <p className="body-lg">Analysis for: <span className="text-white">{analysis.url}</span></p>
            </div>

            {/* Overall Grade */}
            <div className="feature-card text-center mb-8 glow-effect">
              <div className="mb-4">
                <div 
                  className="text-6xl font-bold mb-2" 
                  style={{color: getGradeColor(analysis.seoGrade.overall)}}
                >
                  {analysis.seoGrade.overall}
                </div>
                <div className="h3">Overall SEO Grade</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                {Object.entries(analysis.seoGrade.grades).map(([category, grade]) => (
                  <div key={category} className="text-center">
                    <div 
                      className="h3 mb-1" 
                      style={{color: getGradeColor(grade)}}
                    >
                      {grade}
                    </div>
                    <div className="body-sm capitalize">{category}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues Found */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="feature-card">
                <h3 className="h3 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
                  Issues Found
                </h3>
                <div className="space-y-4">
                  {analysis.issues.map((issue, index) => (
                    <div key={index} className="flex gap-3 p-4 bg-gray-800 rounded-lg">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <div className="font-semibold text-white">{issue.issue}</div>
                        <div className="body-sm">{issue.description}</div>
                        <div className="body-sm mt-1">
                          Impact: <span className="text-orange-400">{issue.impact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="feature-card">
                <h3 className="h3 mb-6 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
                  Recommendations
                </h3>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex gap-3 p-4 bg-gray-800 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="body-md">{rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA after results */}
            <div className="feature-card text-center">
              <h3 className="h2 mb-4">Ready to Fix These Issues?</h3>
              <p className="body-lg mb-6">
                Don't let SEO problems hurt your business. Our experts can implement all these 
                fixes and more to boost your rankings and traffic.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#contact" className="btn-primary">
                  Get Professional Help
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
                <a href="#pricing" className="btn-secondary">View Our Packages</a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="container py-20">
        <div className="text-center mb-16">
          <h2 className="display-sm mb-6">Why Small Businesses Choose Us</h2>
          <p className="body-lg max-w-2xl mx-auto">
            We specialize in affordable, results-driven SEO for small businesses and nonprofits. 
            No complicated jargon, just real growth.
          </p>
        </div>

        <div className="card-grid-3">
          <div className="feature-card hover-lift">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" 
                 style={{backgroundColor: 'var(--accent-bg)'}}>
              <TrendingUp className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
            </div>
            <h3 className="h3 mb-4">Boost Local Rankings</h3>
            <p className="body-md">
              Get found by local customers searching for your services. We optimize your Google My Business 
              and local search presence to drive foot traffic and calls.
            </p>
          </div>

          <div className="feature-card hover-lift">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" 
                 style={{backgroundColor: 'var(--accent-bg)'}}>
              <Gauge className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
            </div>
            <h3 className="h3 mb-4">Faster Website Speed</h3>
            <p className="body-md">
              Slow websites lose customers. We optimize your site speed to improve user experience 
              and search rankings, leading to more conversions.
            </p>
          </div>

          <div className="feature-card hover-lift">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" 
                 style={{backgroundColor: 'var(--accent-bg)'}}>
              <Smartphone className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
            </div>
            <h3 className="h3 mb-4">Mobile-First Optimization</h3>
            <p className="body-md">
              Most customers browse on mobile. We ensure your website looks perfect and loads 
              fast on all devices to maximize your mobile traffic.
            </p>
          </div>

          <div className="feature-card hover-lift">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" 
                 style={{backgroundColor: 'var(--accent-bg)'}}>
              <Shield className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
            </div>
            <h3 className="h3 mb-4">Security & Trust</h3>
            <p className="body-md">
              Build customer confidence with proper security measures. We implement SSL certificates, 
              secure hosting, and trust signals that search engines love.
            </p>
          </div>

          <div className="feature-card hover-lift">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" 
                 style={{backgroundColor: 'var(--accent-bg)'}}>
              <Users className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
            </div>
            <h3 className="h3 mb-4">Content That Converts</h3>
            <p className="body-md">
              We create and optimize content that speaks to your customers' needs while ranking 
              high on Google, driving both traffic and sales.
            </p>
          </div>

          <div className="feature-card hover-lift">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" 
                 style={{backgroundColor: 'var(--accent-bg)'}}>
              <Globe className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
            </div>
            <h3 className="h3 mb-4">Affordable Packages</h3>
            <p className="body-md">
              Professional SEO shouldn't break the bank. Our packages are designed specifically 
              for small business budgets with maximum ROI.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="display-sm mb-6">Success Stories</h2>
          <p className="body-lg">See how we've helped businesses like yours grow online</p>
        </div>

        <div className="card-grid-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="feature-card">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" style={{color: 'var(--accent-primary)'}} />
                ))}
              </div>
              <blockquote className="body-md mb-6 italic">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="body-sm">{testimonial.business}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-20">
        <div className="text-center mb-16">
          <h2 className="display-sm mb-6">Simple, Transparent Pricing</h2>
          <p className="body-lg">Choose the perfect plan for your business size and goals</p>
        </div>

        <div className="card-grid-3 max-w-5xl mx-auto">
          {[
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
          ].map((service, index) => (
            <div key={index} className={`feature-card text-center ${service.popular ? 'glow-effect' : ''}`}>
              {service.popular && (
                <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
                     style={{backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)'}}>
                  Most Popular
                </div>
              )}
              <h3 className="h3 mb-2">{service.name}</h3>
              <div className="h1 mb-2" style={{color: 'var(--accent-primary)'}}>{service.price}</div>
              <p className="body-md mb-6">{service.description}</p>
              
              <ul className="text-left space-y-3 mb-8">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3 body-md">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{color: 'var(--accent-primary)'}} />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <a href="#contact" className={service.popular ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                {service.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="display-sm mb-6">Ready to Grow Your Business?</h2>
            <p className="body-lg">
              Get started with a free SEO consultation. We'll analyze your website and create 
              a custom growth plan for your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="feature-card">
              <h3 className="h3 mb-6">Get Your Free Consultation</h3>
              <form className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="input-field"
                    required 
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="input-field"
                    required 
                  />
                </div>
                <div>
                  <input 
                    type="url" 
                    placeholder="Website URL" 
                    className="input-field"
                    required 
                  />
                </div>
                <div>
                  <textarea 
                    placeholder="Tell us about your business and goals" 
                    rows="4" 
                    className="input-field resize-none"
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary w-full">
                  Get Free Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="h3 mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" style={{color: 'var(--accent-primary)'}} />
                    <span className="body-md">hello@seoboost.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" style={{color: 'var(--accent-primary)'}} />
                    <span className="body-md">(555) 123-4567</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="h4 mb-4">Why Choose SEOBoost?</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 body-md">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{color: 'var(--accent-primary)'}} />
                    Specialized in small business & nonprofit SEO
                  </li>
                  <li className="flex items-center gap-3 body-md">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{color: 'var(--accent-primary)'}} />
                    Transparent reporting and no long-term contracts
                  </li>
                  <li className="flex items-center gap-3 body-md">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{color: 'var(--accent-primary)'}} />
                    Proven track record of increasing website traffic
                  </li>
                  <li className="flex items-center gap-3 body-md">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{color: 'var(--accent-primary)'}} />
                    Affordable pricing designed for smaller budgets
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Search className="w-8 h-8" style={{color: 'var(--accent-primary)'}} />
              <span className="h3 text-white">SEOBoost</span>
            </div>
            <p className="body-md mb-6">
              Helping small businesses and nonprofits grow their online presence with 
              affordable, results-driven SEO services.
            </p>
            <div className="flex gap-3">
              <a href="#" className="footer-social-link">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="footer-social-link">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="footer-social-link">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="h4 mb-6">Services</h4>
            <ul className="space-y-3">
              <li><a href="#" className="body-md hover:text-white transition-colors">SEO Audit</a></li>
              <li><a href="#" className="body-md hover:text-white transition-colors">Local SEO</a></li>
              <li><a href="#" className="body-md hover:text-white transition-colors">Content Marketing</a></li>
              <li><a href="#" className="body-md hover:text-white transition-colors">Website Optimization</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="h4 mb-6">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="body-md hover:text-white transition-colors">SEO Guide</a></li>
              <li><a href="#" className="body-md hover:text-white transition-colors">Case Studies</a></li>
              <li><a href="#" className="body-md hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="body-md hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="h4 mb-6">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="body-md hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="body-md hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="body-md hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="body-md hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="body-sm">
            © 2024 SEOBoost. All rights reserved. Helping businesses grow online since 2020.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SEOLanding;
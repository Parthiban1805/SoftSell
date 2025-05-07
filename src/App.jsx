
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  FaUpload, 
  FaCalculator, 
  FaMoneyBillWave, 
  FaShieldAlt, 
  FaBolt, 
  FaSearch, 
  FaHeadset, 
  FaMoon, 
  FaSun, 
  FaTimes, 
  FaComments,
  FaPaperPlane,
  FaSpinner,
  FaArrowRight,
  FaCheck
} from 'react-icons/fa';

const LLAMA_API_KEY = "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";
const LLAMA_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const SYSTEM_PROMPT = `
You are a helpful assistant for SoftSell, a company that helps businesses sell their unused software licenses.
Only answer questions related to SoftSell's services, software license selling process, and general inquiries about the website.
If asked about topics unrelated to SoftSell or software license selling, politely redirect the conversation back to how you can help with software license selling.
Key information about SoftSell:
- SoftSell helps companies sell unused software licenses securely and easily
- The process involves uploading license information, getting a valuation, and receiving payment
- Payment is processed within 2 business days via bank transfer, PayPal, or crypto
- SoftSell accepts enterprise software licenses, design tools, development environments, CRM solutions, and most major business applications
- All transactions are secure with bank-level encryption
- SoftSell offers 24/7 customer support
`;

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'IT Director',
    company: 'TechFlow Inc.',
    text: 'SoftSell helped us recover over $45,000 from unused enterprise licenses. The process was secure and seamless!'
  },
  {
    id: 2,
    name: 'Michael Chang',
    role: 'CTO',
    company: 'Databridge Solutions',
    text: 'We were skeptical at first, but SoftSell\'s transparent valuation process and quick payments won us over. Highly recommend!'
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    role: 'Operations Manager',
    company: 'Vertex Systems',
    text: 'Converting our unused licenses into capital helped fund our new IT initiatives. SoftSell made it incredibly easy.'
  }
];

// Framer Motion variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const slideIn = {
  hidden: { x: 20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: 'Hi there! How can I help you with selling your software licenses today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    licenseType: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const chatEndRef = useRef(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    document.documentElement.classList.toggle('dark', savedMode);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const queryLlamaAPI = async (userMessage) => {
    setIsLoading(true);
    
    try {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatMessages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: "user", content: userMessage }
      ];
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLAMA_API_KEY}`
        },
        body: JSON.stringify({
          model: LLAMA_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 800
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error querying Llama API:', error);
      return "I'm having trouble connecting to our system right now. Please try again later or contact us at hello@softsell.com for assistance.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) errors.email = 'Please enter a valid email';
    if (!formData.company.trim()) errors.company = 'Company is required';
    if (!formData.licenseType) errors.licenseType = 'Please select a license type';
    if (!formData.message.trim()) errors.message = 'Message is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Form submitted:', formData);
      setFormSubmitted(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        licenseType: '',
        message: ''
      });
      
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setChatInput('');
    
    const botResponse = await queryLlamaAPI(userMessage);
    
    // Add bot response
    setChatMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Helmet>
        <title>SoftSell | Turn Unused Software Licenses Into Cash</title>
        <meta name="description" content="SoftSell helps businesses sell their unused software licenses securely and easily. Get instant valuations and quick payments for enterprise software licenses." />
        <meta name="keywords" content="software licenses, sell licenses, software resale, enterprise software, license valuation" />
        <meta property="og:title" content="SoftSell | Turn Unused Software Licenses Into Cash" />
        <meta property="og:description" content="Convert unused software licenses into immediate revenue with SoftSell's secure and transparent platform." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://softsell.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SoftSell | Turn Unused Software Licenses Into Cash" />
        <meta name="twitter:description" content="Convert unused software licenses into immediate revenue with SoftSell's secure and transparent platform." />
        <link rel="canonical" href="https://softsell.com" />
      </Helmet>
      
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">SS</span>
            </div>
            <h1 className="text-xl font-bold">SoftSell</h1>
          </motion.div>
          
          <div className="hidden md:flex space-x-8">
            {['how-it-works', 'why-choose-us', 'testimonials', 'contact'].map((section) => (
              <motion.button
                key={section}
                onClick={() => scrollToSection(section)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </motion.button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle dark mode"
            >
              {darkMode ? 
                <FaSun className="text-yellow-400" /> : 
                <FaMoon className="text-gray-600" />
              }
            </motion.button>
            
            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setIsNavOpen(!isNavOpen)}
              aria-label="Toggle navigation menu"
            >
              <div className="w-6 flex flex-col gap-1.5">
                <span className={`block h-0.5 bg-current transform transition-transform duration-300 ${isNavOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block h-0.5 bg-current transition-opacity duration-300 ${isNavOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block h-0.5 bg-current transform transition-transform duration-300 ${isNavOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </motion.button>
          </div>
        </nav>
        
        {/* Mobile navigation menu */}
        <AnimatePresence>
          {isNavOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white dark:bg-gray-800 shadow-md overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                {['how-it-works', 'why-choose-us', 'testimonials', 'contact'].map((section) => (
                  <motion.button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="text-left py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                    whileTap={{ scale: 0.98 }}
                  >
                    {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
     <section className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-900 text-white py-24 relative overflow-hidden">
  {/* Subtle background pattern */}
  <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
  
  {/* Decorative circles */}
  <div className="absolute top-20 -left-16 w-64 h-64 bg-blue-400 dark:bg-blue-800 rounded-full opacity-10 blur-3xl"></div>
  <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400 dark:bg-indigo-800 rounded-full opacity-10 blur-3xl"></div>
  
  <div className="container mx-auto px-4 max-w-6xl relative z-10">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {/* Content section */}
      <div className="space-y-6">
        <div className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-2">
          Reclaim Value From Unused Assets
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Turn Unused Software Into <span className="text-blue-100 dark:text-blue-200">Instant Cash</span>
        </h1>
        <p className="text-xl opacity-90 font-light">SoftSell helps you sell unused software licenses securely and easily.</p>
        
        {/* Stats */}
        <div className="flex flex-wrap gap-8 mt-4 mb-8">
          <div>
            <div className="text-2xl font-bold text-blue-100 dark:text-blue-200">$4.2M+</div>
            <div className="text-sm opacity-80">Recovered Value</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-100 dark:text-blue-200">12,000+</div>
            <div className="text-sm opacity-80">Licenses Sold</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-100 dark:text-blue-200">98%</div>
            <div className="text-sm opacity-80">Satisfaction Rate</div>
          </div>
        </div>
        
        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4">
          <button className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 py-3 px-8 rounded-lg font-medium shadow-md flex items-center gap-2 group transition-all duration-200">
            Sell My Licenses
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <button className="bg-transparent border border-white/30 hover:bg-white/10 py-3 px-8 rounded-lg font-medium flex items-center gap-2 transition-all duration-200">
            How It Works
          </button>
        </div>
      </div>
      
      {/* Card section */}
      <div className="relative">
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400 dark:bg-yellow-500 rounded-lg opacity-20 blur-2xl"></div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-400 dark:bg-purple-600 rounded-lg opacity-20 blur-2xl"></div>
        
        <div className="bg-white/95 dark:bg-gray-800/95 p-8 rounded-2xl shadow-xl relative backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
          <div className="absolute -top-3 -right-3 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 text-xs font-bold py-1 px-3 rounded-full">
            Instant Quote
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700/60 p-4 rounded-xl mb-6">
            <div className="h-4 w-3/4 bg-blue-200 dark:bg-blue-700/60 rounded mb-3"></div>
            <div className="h-4 w-1/2 bg-blue-200 dark:bg-blue-700/60 rounded"></div>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-600 dark:text-green-300 text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-3 w-48 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
          
          <button className="h-12 w-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 rounded-lg flex items-center justify-center text-white font-medium gap-2 transition-all duration-200 shadow-md hover:shadow-lg">
            Get Valuation
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          
          {/* Trust indicators */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">Trusted by organizations worldwide</p>
            <div className="flex justify-between items-center opacity-70">
              <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-5 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-5 w-14 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-5 w-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  {/* Improved bottom divider */}
  <div className="absolute -bottom-12 left-20 right-0 h-24 bg-gray-50 dark:bg-gray-800 -skew-y-3"></div>
  </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <div className="h-1 w-24 bg-blue-500 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto">Our streamlined process makes it easy to convert your unused licenses into cash in just three simple steps.</p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Step 1 */}
            <motion.div 
              className="group"
              variants={fadeIn}
            >
              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaUpload />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">1. Upload License</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center flex-grow">Securely upload your license information using our encrypted portal. We support most major software vendors.</p>
              </div>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              className="group"
              variants={fadeIn}
            >
              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaCalculator />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">2. Get Valuation</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center flex-grow">Receive a competitive market-based valuation for your unused licenses with a detailed breakdown of pricing factors.</p>
              </div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              className="group"
              variants={fadeIn}
            >
              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaMoneyBillWave />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">3. Get Paid</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center flex-grow">Accept the offer and receive payment within 2 business days via bank transfer, PayPal, or cryptocurrency.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-choose-us" className="py-24 bg-gray-50 dark:bg-gray-900 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <div className="h-1 w-24 bg-blue-500 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto">SoftSell is the leading platform for businesses looking to recover value from their unused software investments.</p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Feature 1 */}
            <motion.div variants={slideIn}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col items-center">
                <div className="h-14 w-14 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-xl mb-5">
                  <FaShieldAlt />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-center">Secure Transactions</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm">Bank-level encryption and secure transfer protocols for all license transfers.</p>
              </div>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div variants={slideIn}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col items-center">
                <div className="h-14 w-14 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl mb-5">
                  <FaBolt />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-center">Fast Payouts</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm">Get paid within 2 business days of acceptance with multiple payment options.</p>
              </div>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div variants={slideIn}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col items-center">
                <div className="h-14 w-14 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl mb-5">
                  <FaSearch />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-center">Transparent Valuation</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm">Clear breakdown of license valuation factors with market-based pricing.</p>
              </div>
            </motion.div>
            
            {/* Feature 4 */}
            <motion.div variants={slideIn}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col items-center">
                <div className="h-14 w-14 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400 text-xl mb-5">
                  <FaHeadset />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-center">24/7 Support</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm">Expert assistance available around the clock via chat, email, or phone.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <div className="h-1 w-24 bg-blue-500 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto">Companies of all sizes trust SoftSell to handle their software license sales.</p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {testimonials.map((testimonial) => (
              <motion.div 
                key={testimonial.id}
                variants={fadeIn}
                className="relative"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="bg-gray-50 dark:bg-gray-700 p-6 md:p-8 rounded-xl shadow-sm h-full">
                  <div className="absolute -top-4 -left-4 text-5xl text-blue-200 dark:text-blue-800 opacity-50">"</div>
                  <div className="mb-6">
                    <p className="text-gray-700 dark:text-gray-300 relative z-10">{testimonial.text}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.split(' ').map(name => name[0]).join('')}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
          <section id="contact" className="py-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div 
        className="container mx-auto px-4 max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Get in Touch
        </motion.h2>
        
        <motion.p 
          className="text-center text-gray-600 dark:text-gray-300 mb-16 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          Have questions about selling your licenses? Our team is ready to help you maximize your returns.
        </motion.p>
        
        <AnimatePresence mode="wait">
          {formSubmitted ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-6 py-5 rounded-xl shadow-sm mb-4"
              role="alert"
            >
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <strong className="font-semibold block">Message sent successfully!</strong>
                  <span className="text-sm mt-1 opacity-90">Thank you for reaching out. We'll get back to you within 24 hours.</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormSubmitted(false)}
                className="mt-4 w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Send another message
              </motion.button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      formErrors.name 
                        ? 'border-red-400 dark:border-red-500 ring-1 ring-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                    placeholder="John Doe"
                    aria-describedby={formErrors.name ? "name-error" : undefined}
                  />
                  {formErrors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-500" role="alert">{formErrors.name}</p>
                  )}
                </div>
                
                {/* Email Field */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      formErrors.email 
                        ? 'border-red-400 dark:border-red-500 ring-1 ring-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                    placeholder="john@example.com"
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                  />
                  {formErrors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">{formErrors.email}</p>
                  )}
                </div>
                
                {/* Company Field */}
                <div className="space-y-1">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Acme Inc."
                  />
                </div>
                
                {/* License Type Field */}
                <div className="space-y-1">
                  <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    License Type <span className="text-red-500">*</span>
                  </label>
                  <motion.select
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    id="licenseType"
                    name="licenseType"
                    value={formData.licenseType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      formErrors.licenseType 
                        ? 'border-red-400 dark:border-red-500 ring-1 ring-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                    aria-describedby={formErrors.licenseType ? "licenseType-error" : undefined}
                  >
                    <option value="">Select license type</option>
                    <option value="enterprise">Enterprise Software</option>
                    <option value="design">Design Tools</option>
                    <option value="development">Development Environments</option>
                    <option value="crm">CRM Solutions</option>
                    <option value="other">Other</option>
                  </motion.select>
                  {formErrors.licenseType && (
                    <p id="licenseType-error" className="mt-1 text-sm text-red-500" role="alert">{formErrors.licenseType}</p>
                  )}
                </div>
              </div>
              
              {/* Message Field */}
              <div className="mt-6 space-y-1">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message <span className="text-red-500">*</span>
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    formErrors.message 
                      ? 'border-red-400 dark:border-red-500 ring-1 ring-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                  placeholder="Tell us about the licenses you'd like to sell..."
                  aria-describedby={formErrors.message ? "message-error" : undefined}
                ></motion.textarea>
                {formErrors.message && (
                  <p id="message-error" className="mt-1 text-sm text-red-500" role="alert">{formErrors.message}</p>
                )}
              </div>
              
              {/* Submit Button */}
              <div className="mt-8">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Send Message</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </section>


      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">SS</span>
                </div>
                <h3 className="text-xl font-bold">SoftSell</h3>
              </div>
              <p className="text-gray-400">Turn unused software into instant cash.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#how-it-works" className="hover:text-blue-400">How It Works</a></li>
                <li><a href="#why-choose-us" className="hover:text-blue-400">Why Choose Us</a></li>
                <li><a href="#testimonials" className="hover:text-blue-400">Testimonials</a></li>
                <li><a href="#contact" className="hover:text-blue-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <p className="text-gray-400">hello@softsell.com</p>
              <p className="text-gray-400">1-800-SOFT-SELL</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} SoftSell. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <div className={`fixed bottom-6 right-6 z-50 flex flex-col ${isChatOpen ? 'h-96' : 'h-auto'} transition-all duration-300`}>
        {isChatOpen && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-80 md:w-96 overflow-hidden flex flex-col">
            <div className="bg-blue-600 dark:bg-blue-700 text-white p-4 flex justify-between items-center">
              <h4 className="font-medium">SoftSell Support</h4>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:bg-blue-700 dark:hover:bg-blue-800 p-1 rounded"
                aria-label="Close chat"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`mb-4 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`px-4 py-2 rounded-lg max-w-xs ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <FaSpinner className="animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                disabled={isLoading || !chatInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg flex items-center justify-center"
              >
                {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              </button>
            </form>
          </div>
        )}
        
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
            aria-label="Open chat"
          >
            <FaComments />
          </button>
        )}
      </div>
    </div>
  );
    };
    export default App;
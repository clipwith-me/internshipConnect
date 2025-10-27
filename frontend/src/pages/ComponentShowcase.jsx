// frontend/src/pages/ComponentShowcase.jsx
import { useState } from 'react';
import { Mail, Plus, Trash2, Download } from 'lucide-react';
import { Button, Input, Card, Modal, Badge } from '../components';

/**
 * 🎓 LEARNING: Component Showcase
 * 
 * This page demonstrates all UI components in action.
 * Use this to:
 * - Test components visually
 * - Reference usage examples
 * - Ensure consistency
 * - Debug styling issues
 */

const ComponentShowcase = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Component Showcase
          </h1>
          <p className="text-lg text-neutral-600">
            Microsoft-style UI components for InternshipConnect
          </p>
        </div>
        
        {/* Sections */}
        <div className="space-y-12">
          
          {/* ==================== BUTTONS ==================== */}
          <Section title="Buttons" description="Different button variants and sizes">
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">Variants</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="success">Success</Button>
                </div>
              </div>
              
              {/* Sizes */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">Sizes</h4>
                <div className="flex items-center flex-wrap gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              
              {/* With Icons */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">With Icons</h4>
                <div className="flex flex-wrap gap-3">
                  <Button icon={<Plus size={18} />}>Add Item</Button>
                  <Button variant="danger" icon={<Trash2 size={18} />}>Delete</Button>
                  <Button variant="secondary" icon={<Download size={18} />} iconPosition="right">
                    Download
                  </Button>
                </div>
              </div>
              
              {/* States */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">States</h4>
                <div className="flex flex-wrap gap-3">
                  <Button loading onClick={handleLoadingTest}>
                    {loading ? 'Loading...' : 'Click to Load'}
                  </Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
              
              {/* Full Width */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">Full Width</h4>
                <Button fullWidth>Full Width Button</Button>
              </div>
            </div>
          </Section>
          
          {/* ==================== INPUTS ==================== */}
          <Section title="Inputs" description="Form inputs with validation">
            <div className="space-y-6 max-w-md">
              {/* Basic Input */}
              <Input
                id="name"
                label="Full Name"
                placeholder="Enter your name"
                helperText="This will be displayed on your profile"
                required
              />
              
              {/* Email Input with Icon */}
              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                icon={<Mail size={18} />}
                required
              />
              
              {/* Password Input */}
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="Enter password"
                helperText="Must be at least 8 characters"
                required
              />
              
              {/* Input with Error */}
              <Input
                id="username-error"
                label="Username"
                value="john"
                error="Username must be at least 4 characters"
              />
              
              {/* Input with Success */}
              <Input
                id="username-success"
                label="Username"
                value="johndoe123"
                success="Username is available!"
              />
              
              {/* Textarea */}
              <Input
                id="bio"
                type="textarea"
                label="Bio"
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={500}
                showCount
                helperText="This will appear on your profile"
              />
              
              {/* Controlled Input */}
              <Input
                id="controlled"
                label="Controlled Input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText={`You typed: ${inputValue}`}
              />
            </div>
          </Section>
          
          {/* ==================== BADGES ==================== */}
          <Section title="Badges" description="Status indicators and tags">
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge>Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="neutral">Neutral</Badge>
                </div>
              </div>
              
              {/* With Dots */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">With Status Dots</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success" dot>Active</Badge>
                  <Badge variant="warning" dot>Pending</Badge>
                  <Badge variant="error" dot>Closed</Badge>
                </div>
              </div>
              
              {/* Sizes */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">Sizes</h4>
                <div className="flex items-center flex-wrap gap-2">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>
              
              {/* Removable (Skills Example) */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">Removable Tags</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge onRemove={() => alert('Removed!')}>JavaScript</Badge>
                  <Badge onRemove={() => alert('Removed!')}>React</Badge>
                  <Badge onRemove={() => alert('Removed!')}>Node.js</Badge>
                  <Badge onRemove={() => alert('Removed!')}>MongoDB</Badge>
                </div>
              </div>
            </div>
          </Section>
          
          {/* ==================== CARDS ==================== */}
          <Section title="Cards" description="Container components">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Simple Card */}
              <Card>
                <Card.Header>
                  <Card.Title>Simple Card</Card.Title>
                </Card.Header>
                <Card.Body>
                  <p className="text-neutral-600">
                    This is a basic card with header and body. Perfect for displaying content.
                  </p>
                </Card.Body>
              </Card>
              
              {/* Card with Footer */}
              <Card>
                <Card.Header>
                  <div>
                    <Card.Title>Software Engineer Intern</Card.Title>
                    <Card.Description>Google • Remote</Card.Description>
                  </div>
                  <Badge>Featured</Badge>
                </Card.Header>
                <Card.Body>
                  <p className="text-neutral-600">
                    Join our team to work on cutting-edge AI projects...
                  </p>
                </Card.Body>
                <Card.Footer>
                  <span className="text-sm text-neutral-500">Posted 2 days ago</span>
                  <Button size="sm">Apply Now</Button>
                </Card.Footer>
              </Card>
              
              {/* Clickable Card */}
              <Card 
                clickable 
                hover
                onClick={() => alert('Card clicked!')}
              >
                <Card.Header>
                  <Card.Title>Clickable Card</Card.Title>
                </Card.Header>
                <Card.Body>
                  <p className="text-neutral-600">
                    This card is clickable with hover effects.
                  </p>
                </Card.Body>
              </Card>
              
              {/* Card with High Elevation */}
              <Card elevation="lg">
                <Card.Header>
                  <Card.Title>High Elevation</Card.Title>
                </Card.Header>
                <Card.Body>
                  <p className="text-neutral-600">
                    This card has a higher shadow elevation.
                  </p>
                </Card.Body>
              </Card>
            </div>
          </Section>
          
          {/* ==================== MODALS ==================== */}
          <Section title="Modals" description="Dialog and popup components">
            <div className="space-y-4">
              <Button onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
              
              <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                size="md"
              >
                <Modal.Header>
                  <Modal.Title>Example Modal</Modal.Title>
                  <Modal.Description>
                    This is a modal dialog with header, body, and footer
                  </Modal.Description>
                </Modal.Header>
                <Modal.Body>
                  <p className="text-neutral-600 mb-4">
                    This is the modal body content. You can put forms, text, images, or any other content here.
                  </p>
                  <Input
                    id="modal-input"
                    label="Example Input"
                    placeholder="Type something..."
                  />
                </Modal.Body>
                <Modal.Footer>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)}>
                    Confirm
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          </Section>
          
          {/* ==================== TYPOGRAPHY ==================== */}
          <Section title="Typography" description="Text styles and hierarchy">
            <div className="space-y-4">
              <div>
                <h1 className="text-5xl font-bold text-neutral-900 mb-2">Heading 1</h1>
                <code className="text-xs text-neutral-500">text-5xl font-bold</code>
              </div>
              
              <div>
                <h2 className="text-4xl font-bold text-neutral-900 mb-2">Heading 2</h2>
                <code className="text-xs text-neutral-500">text-4xl font-bold</code>
              </div>
              
              <div>
                <h3 className="text-3xl font-semibold text-neutral-900 mb-2">Heading 3</h3>
                <code className="text-xs text-neutral-500">text-3xl font-semibold</code>
              </div>
              
              <div>
                <h4 className="text-2xl font-semibold text-neutral-900 mb-2">Heading 4</h4>
                <code className="text-xs text-neutral-500">text-2xl font-semibold</code>
              </div>
              
              <div>
                <p className="text-lg text-neutral-700 mb-2">
                  Large body text - Perfect for introductions and important content.
                </p>
                <code className="text-xs text-neutral-500">text-lg text-neutral-700</code>
              </div>
              
              <div>
                <p className="text-base text-neutral-600 mb-2">
                  Regular body text - The default size for most content.
                </p>
                <code className="text-xs text-neutral-500">text-base text-neutral-600</code>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500 mb-2">
                  Small text - Good for captions and helper text.
                </p>
                <code className="text-xs text-neutral-500">text-sm text-neutral-500</code>
              </div>
            </div>
          </Section>
          
          {/* ==================== COLORS ==================== */}
          <Section title="Colors" description="Color palette">
            <div className="space-y-6">
              <ColorPalette 
                title="Primary (Blue)" 
                colors={[
                  { name: 'primary-50', class: 'bg-primary-50' },
                  { name: 'primary-100', class: 'bg-primary-100' },
                  { name: 'primary-500', class: 'bg-primary-500' },
                  { name: 'primary-600', class: 'bg-primary-600' },
                  { name: 'primary-700', class: 'bg-primary-700' },
                ]}
              />
              
              <ColorPalette 
                title="Success (Green)" 
                colors={[
                  { name: 'success-50', class: 'bg-success-50' },
                  { name: 'success-100', class: 'bg-success-100' },
                  { name: 'success-500', class: 'bg-success-500' },
                  { name: 'success-600', class: 'bg-success-600' },
                  { name: 'success-700', class: 'bg-success-700' },
                ]}
              />
              
              <ColorPalette 
                title="Error (Red)" 
                colors={[
                  { name: 'error-50', class: 'bg-error-50' },
                  { name: 'error-100', class: 'bg-error-100' },
                  { name: 'error-500', class: 'bg-error-500' },
                  { name: 'error-600', class: 'bg-error-600' },
                  { name: 'error-700', class: 'bg-error-700' },
                ]}
              />
              
              <ColorPalette 
                title="Neutral (Gray)" 
                colors={[
                  { name: 'neutral-50', class: 'bg-neutral-50' },
                  { name: 'neutral-100', class: 'bg-neutral-100' },
                  { name: 'neutral-200', class: 'bg-neutral-200' },
                  { name: 'neutral-500', class: 'bg-neutral-500' },
                  { name: 'neutral-700', class: 'bg-neutral-700' },
                  { name: 'neutral-900', class: 'bg-neutral-900' },
                ]}
              />
            </div>
          </Section>
          
          {/* ==================== SHADOWS ==================== */}
          <Section title="Shadows" description="Elevation levels">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="font-medium mb-2">Shadow SM</p>
                <code className="text-xs text-neutral-500">shadow-sm</code>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-base">
                <p className="font-medium mb-2">Shadow Base</p>
                <code className="text-xs text-neutral-500">shadow-base</code>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="font-medium mb-2">Shadow MD</p>
                <code className="text-xs text-neutral-500">shadow-md</code>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="font-medium mb-2">Shadow LG</p>
                <code className="text-xs text-neutral-500">shadow-lg</code>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <p className="font-medium mb-2">Shadow XL</p>
                <code className="text-xs text-neutral-500">shadow-xl</code>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-2xl">
                <p className="font-medium mb-2">Shadow 2XL</p>
                <code className="text-xs text-neutral-500">shadow-2xl</code>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const Section = ({ title, description, children }) => (
  <div className="bg-white rounded-lg shadow-base p-8">
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-neutral-900 mb-1">{title}</h2>
      <p className="text-neutral-600">{description}</p>
    </div>
    {children}
  </div>
);

const ColorPalette = ({ title, colors }) => (
  <div>
    <h4 className="text-sm font-semibold text-neutral-700 mb-3">{title}</h4>
    <div className="flex gap-2">
      {colors.map((color) => (
        <div key={color.name} className="flex-1">
          <div className={`${color.class} h-20 rounded-md mb-2`} />
          <code className="text-xs text-neutral-500">{color.name}</code>
        </div>
      ))}
    </div>
  </div>
);

export default ComponentShowcase;

/**
 * 🎓 HOW TO USE THIS SHOWCASE:
 * 
 * 1. Add to your routes:
 *    <Route path="/showcase" element={<ComponentShowcase />} />
 * 
 * 2. Visit http://localhost:5173/showcase
 * 
 * 3. Test each component interactively
 * 
 * 4. Reference this page when building new features
 */
// frontend/src/components/InterviewPrepGuide.jsx

import { useState, useEffect } from 'react';
import { Crown, Calendar, CheckSquare, Lightbulb, MessageCircle, Building2, AlertCircle } from 'lucide-react';
import { premiumAPI } from '../services/api';
import { Card, Button, Badge } from './index';

const InterviewPrepGuide = ({ internshipId }) => {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchGuide();
  }, [internshipId]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await premiumAPI.getInterviewGuide(internshipId);
      if (response.data.success) {
        setGuide(response.data.data);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setUpgradeRequired(true);
        setError('Premium feature - Upgrade required');
      } else {
        setError('Failed to load interview guide');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-3">Preparing your interview guide...</span>
        </div>
      </Card>
    );
  }

  if (upgradeRequired) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-primary-50 to-purple-50">
        <Crown className="w-16 h-16 text-primary-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Premium Feature</h3>
        <p className="text-neutral-600 mb-6">
          Get personalized interview preparation guides for each internship.
        </p>
        <Button variant="primary" onClick={() => window.location.href = '/dashboard/pricing'}>
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Premium
        </Button>
      </Card>
    );
  }

  if (error || !guide) {
    return (
      <Card className="p-6">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'prep', label: 'Preparation', icon: CheckSquare },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'tips', label: 'Tips', icon: Lightbulb }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary-500 to-purple-600 text-white">
        <h2 className="text-2xl font-bold mb-2">Interview Preparation Guide</h2>
        <p className="opacity-90">{guide.overview.role} at {guide.overview.company}</p>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Position Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-600">Role</p>
                <p className="font-medium">{guide.overview.role}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Company</p>
                <p className="font-medium">{guide.overview.company}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Industry</p>
                <p className="font-medium">{guide.overview.industry}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Level</p>
                <p className="font-medium">{guide.overview.level}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'prep' && (
        <div className="space-y-6">
          {/* Technical Prep */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Badge variant="primary" className="mr-2">Technical</Badge>
              Skills to Review
            </h3>
            <div className="space-y-4">
              {guide.preparation.technical.map((item, idx) => (
                <div key={idx} className="border-l-4 border-l-blue-500 pl-4">
                  <p className="font-semibold text-neutral-900">{item.skill}</p>
                  <p className="text-sm text-neutral-600 my-2">{item.focus}</p>
                  <ul className="text-sm space-y-1">
                    {item.resources.map((resource, i) => (
                      <li key={i} className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-primary-500 mr-2 mt-0.5" />
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          {/* Behavioral Questions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Badge variant="warning" className="mr-2">Behavioral</Badge>
              Common Questions
            </h3>
            <div className="space-y-4">
              {guide.preparation.behavioral.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:bg-neutral-50">
                  <p className="font-semibold text-neutral-900 mb-2">{item.question}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge size="sm" variant="info">{item.framework}</Badge>
                    <span className="text-neutral-600">{item.tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Questions to Ask */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-primary-500" />
              Questions to Ask Interviewer
            </h3>
            <ul className="space-y-2">
              {guide.preparation.questions.map((q, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span className="text-neutral-700">{q}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {Object.entries(guide.timeline).map(([key, tasks]) => (
            <Card key={key} className="p-6">
              <h3 className="text-lg font-semibold mb-4 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <ul className="space-y-3">
                {tasks.map((task, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckSquare className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">{task}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="space-y-4">
          {guide.tips.map((tip, idx) => (
            <Card key={idx} className="p-6 border-l-4 border-l-primary-500">
              <div className="flex items-start">
                <Lightbulb className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                <div>
                  <Badge variant="primary" size="sm" className="mb-2">{tip.category}</Badge>
                  <p className="font-semibold text-neutral-900 mb-1">{tip.tip}</p>
                  <p className="text-sm text-neutral-600">{tip.why}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 text-center">
        <h4 className="font-semibold text-neutral-900 mb-2">Ready to Ace Your Interview?</h4>
        <p className="text-sm text-neutral-600 mb-4">
          Follow this guide step-by-step and you'll be well-prepared!
        </p>
        <Button size="sm" variant="primary">
          Download PDF Guide
        </Button>
      </Card>
    </div>
  );
};

export default InterviewPrepGuide;

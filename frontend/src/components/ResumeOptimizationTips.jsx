// frontend/src/components/ResumeOptimizationTips.jsx

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, Lightbulb, TrendingUp, Crown } from 'lucide-react';
import { premiumAPI } from '../services/api';
import { Card, Button, Badge } from './index';

/**
 * 🎯 RESUME OPTIMIZATION TIPS COMPONENT
 *
 * Premium feature that provides AI-powered resume optimization tips
 * categorized by priority and impact.
 */

const ResumeOptimizationTips = ({ resumeId }) => {
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  useEffect(() => {
    fetchOptimizationTips();
  }, [resumeId]);

  const fetchOptimizationTips = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await premiumAPI.getResumeTips(resumeId);

      if (response.data.success) {
        setTips(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch optimization tips:', err);

      if (err.response?.status === 403) {
        setUpgradeRequired(true);
        setError('This feature requires a Premium or Pro subscription');
      } else {
        setError('Failed to load optimization tips. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority <= 2) return 'danger';
    if (priority <= 4) return 'warning';
    return 'info';
  };

  const getImpactIcon = (impact) => {
    const icons = {
      high: <AlertCircle className="w-5 h-5 text-red-500" />,
      medium: <Info className="w-5 h-5 text-yellow-500" />,
      low: <Lightbulb className="w-5 h-5 text-blue-500" />
    };
    return icons[impact] || icons.low;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-neutral-600">Analyzing your resume...</span>
        </div>
      </Card>
    );
  }

  if (upgradeRequired) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-primary-50 to-purple-50">
        <Crown className="w-16 h-16 text-primary-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-neutral-900 mb-2">
          Premium Feature
        </h3>
        <p className="text-neutral-600 mb-6">
          Get AI-powered resume optimization tips with actionable improvements.
          Upgrade to Premium to unlock this feature!
        </p>
        <Button variant="primary" onClick={() => window.location.href = '/dashboard/pricing'}>
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Premium
        </Button>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-l-4 border-l-red-500">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
          <div>
            <p className="text-red-600 font-medium">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchOptimizationTips}
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!tips) return null;

  const { tips: tipCategories, overallScore, summary } = tips;
  const allTips = [
    ...tipCategories.critical,
    ...tipCategories.important,
    ...tipCategories.suggestions
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
              Resume Optimization Score
            </h3>
            <p className="text-sm text-neutral-600">{summary}</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${
              overallScore >= 85 ? 'text-green-600' :
              overallScore >= 70 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {overallScore}
            </div>
            <div className="text-xs text-neutral-500 mt-1">out of 100</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-neutral-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              overallScore >= 85 ? 'bg-green-500' :
              overallScore >= 70 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${overallScore}%` }}
          ></div>
        </div>
      </Card>

      {/* Strengths */}
      {tipCategories.strengths.length > 0 && (
        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-start mb-4">
            <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                Strengths
              </h4>
              <ul className="space-y-2">
                {tipCategories.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center text-neutral-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Optimization Tips */}
      {allTips.length > 0 ? (
        <div>
          <h4 className="text-lg font-semibold text-neutral-900 mb-4">
            Optimization Recommendations
          </h4>
          <div className="space-y-4">
            {allTips.map((tip, index) => (
              <Card
                key={index}
                className={`p-5 border-l-4 ${
                  tip.priority <= 2 ? 'border-l-red-500 bg-red-50' :
                  tip.priority <= 4 ? 'border-l-yellow-500 bg-yellow-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start">
                  {getImpactIcon(tip.impact)}
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={getPriorityColor(tip.priority)} size="sm">
                        {tip.category}
                      </Badge>
                      <span className="text-xs text-neutral-500">
                        Priority {tip.priority}
                      </span>
                    </div>

                    <h5 className="font-semibold text-neutral-900 mb-1">
                      {tip.tip}
                    </h5>

                    <p className="text-sm text-neutral-700 mb-3">
                      <strong>Action:</strong> {tip.action}
                    </p>

                    <div className="flex items-center text-xs text-neutral-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span className="capitalize">{tip.impact} impact</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center bg-green-50">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-neutral-900 mb-2">
            Excellent Work!
          </h4>
          <p className="text-neutral-600">
            Your resume is well-optimized. Keep refining it based on specific job requirements.
          </p>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-neutral-500">
        <p>
          💡 <strong>Pro Tip:</strong> Address critical issues first for maximum impact
        </p>
      </div>
    </div>
  );
};

export default ResumeOptimizationTips;

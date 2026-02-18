import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Book, Zap, FolderOpen, LayoutDashboard, HelpCircle, Lightbulb, MessageSquare, BookOpen, PlayCircle } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { useOnboarding } from '../hooks/useOnboarding';
import { useNavigate } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const HelpPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']));
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());
  const { resetOnboarding, completeTutorial, startOnboarding } = useOnboarding();
  const navigate = useNavigate();
  const [isResettingOnboarding, setIsResettingOnboarding] = useState(false);

  const handleStartTutorials = async () => {
    setIsResettingOnboarding(true);
    try {
      await resetOnboarding();
      // Mark welcome as completed so tours can appear
      await startOnboarding();
      await completeTutorial('welcome');
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/dashboard');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    } finally {
      setIsResettingOnboarding(false);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const faqs: FAQItem[] = [
    {
      question: 'How do I add a new lead?',
      answer: 'You can add a lead in two ways: 1) Click the "Add Lead" button at the top of the CRM, or 2) Click the "+ Add Lead" button in any Kanban column. The new lead will be created in the "Target" stage by default.',
    },
    {
      question: 'How do I move a lead between stages?',
      answer: 'Simply drag and drop the lead card from its current column to the desired stage column. Automation will run automatically if you have rules configured for that stage.',
    },
    {
      question: 'How do automations work?',
      answer: 'Automations share documents automatically when a lead reaches a specific stage. You can configure which documents to share, set a delay, and optionally send a custom notification email. Go to the Automation page to create and manage rules.',
    },
    {
      question: 'Can I set different permissions for each document?',
      answer: 'Yes, each document can have independent permissions. Click the settings icon (⚙️) on any document and select which stages should automatically share it.',
    },
    {
      question: 'What happens if I move a lead to a stage and have no rules configured?',
      answer: 'The lead will move normally, but documents won\'t be shared automatically. You can share documents manually from the Data Room or create an automation rule for future leads.',
    },
    {
      question: 'How do I see which documents have been shared with a lead?',
      answer: 'Documents shared with each lead are available in their personalized Data Room. When an investor signs in with their email and verification code, they see all documents you\'ve shared with them, plus view and download tracking.',
    },
    {
      question: 'How do investors access the Data Room?',
      answer: 'Investors receive an email with a 6-digit verification code when you share documents with them. They go to /investor/login, enter their email, receive the code by email, and then access their personalized Data Room where they only see documents shared with them.',
    },
    {
      question: 'Can I edit a lead after creating it?',
      answer: 'Yes, click any lead card to open the details panel. From there you can edit all lead information, change their stage, or delete the lead.',
    },
    {
      question: 'What file formats can I upload?',
      answer: 'You can upload PDFs, Word documents, Excel spreadsheets, and images. Recommended maximum size is 50MB per file.',
    },
  ];

  const tips = [
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      text: 'Organize documents by category to find them more easily',
    },
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      text: 'Use search and filters in the Data Room to manage many documents',
    },
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      text: 'Create automation rules for common stages like "Pitch Shared" or "Due Diligence"',
    },
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      text: 'Investors access the Data Room with their email and a verification code they receive by email',
    },
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      text: 'Use Automation Rules to send custom emails; document permissions only share files',
    },
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      text: 'Keep the last contact date updated to identify leads that need follow-up',
    },
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      text: 'Use notes on each lead to remember important conversation details',
    },
  ];

  const sections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with InvestiaFlow',
      icon: <Book size={20} />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What is InvestiaFlow?</h3>
            <p className="text-gray-600">
              InvestiaFlow is a platform that automates fundraising management for startups.
              It combines a visual Kanban-style CRM with a smart Data Room that shares documents
              automatically based on each potential investor&apos;s progress in your pipeline.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Main Navigation</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>CRM Pipeline:</strong> Manage your leads and investors on a visual Kanban board</li>
              <li><strong>Data Room:</strong> Upload and organize documents to share with investors</li>
              <li><strong>Automation:</strong> Set up rules to share documents automatically</li>
              <li><strong>Settings:</strong> Your account settings</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'crm',
      title: 'Using the CRM Pipeline',
      icon: <LayoutDashboard size={20} />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Pipeline Stages</h3>
            <p className="text-gray-600 mb-3">
              Your pipeline is organized into 8 stages that represent each investor&apos;s progress:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { emoji: '🎯', name: 'Target', desc: 'Identified investors, no contact yet' },
                { emoji: '📧', name: 'First Contact', desc: 'First communication established' },
                { emoji: '💬', name: 'In Conversation', desc: 'Active conversations in progress' },
                { emoji: '📊', name: 'Pitch Shared', desc: 'Pitch deck shared' },
                { emoji: '🔍', name: 'Due Diligence', desc: 'Due diligence process started' },
                { emoji: '📝', name: 'Term Sheet', desc: 'Term sheet received or under negotiation' },
                { emoji: '✅', name: 'Committed', desc: 'Investor committed' },
                { emoji: '❌', name: 'Passed', desc: 'Investor did not move forward' },
              ].map((stage) => (
                <div key={stage.name} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-xl">{stage.emoji}</span>
                  <div>
                    <p className="font-medium text-gray-900">{stage.name}</p>
                    <p className="text-xs text-gray-600">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Lead Management</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Add Lead:</strong> Use the &quot;Add Lead&quot; button or the &quot;+&quot; button in any column</li>
              <li><strong>Move Lead:</strong> Drag and drop the card between columns</li>
              <li><strong>View Details:</strong> Click any card to open the side panel</li>
              <li><strong>Edit Lead:</strong> Open the details panel and click &quot;Edit Lead&quot;</li>
              <li><strong>Delete Lead:</strong> From the details panel, click &quot;Delete Lead&quot;</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Visual Indicators</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Badge &quot;Follow up needed&quot;:</strong> Appears when a lead has had no contact for more than 14 days</li>
              <li><strong>Orange border:</strong> Indicates the lead needs follow-up</li>
              <li><strong>Column count:</strong> Shows how many leads are in each stage</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'dataroom',
      title: 'Managing the Data Room',
      icon: <FolderOpen size={20} />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Uploading Documents</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Click &quot;Upload Document&quot;</li>
              <li>Drag and drop a file or click to select one</li>
              <li>Select the category (Pitch, Financials, Legal, Metrics, Other)</li>
              <li>Add an optional description</li>
              <li>Click &quot;Upload Document&quot;</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Document Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600">
              <div><strong>Pitch:</strong> Pitch decks, presentations</div>
              <div><strong>Financials:</strong> Financial models, cap tables</div>
              <div><strong>Legal:</strong> Term sheets, contracts, policies</div>
              <div><strong>Metrics:</strong> Dashboards, product metrics</div>
              <div><strong>Other:</strong> Other relevant documents</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Configuring Permissions</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Click the settings icon (⚙️) on any document</li>
              <li>Check the stages where you want to share the document automatically</li>
              <li>Set an optional delay (days after the stage)</li>
              <li>Save changes</li>
            </ol>
            <p className="text-sm text-gray-500 mt-2">
              <strong>Note:</strong> To send notification emails to investors, you must create an Automation Rule on the Automation page. Document permissions only control when files are shared, not email sending.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Search and Filters</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Use the search bar to find documents by name or description</li>
              <li>Filter by category using the dropdown</li>
              <li>Results update in real time</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'investor-access',
        title: 'Investor Access to the Data Room',
        icon: <MessageSquare size={20} />,
        content: (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How does investor access work?</h3>
              <p className="text-gray-600 mb-3">
                When you share documents with a lead via permissions or automations, the investor can access
                their personalized Data Room using their email and a 6-digit verification code.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Access Process</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>The investor receives an email with a verification code when documents are shared with them</li>
                <li>The investor goes to the Data Room URL (usually shared in the email)</li>
                <li>They enter their email and request the verification code</li>
                <li>They receive a 6-digit code by email</li>
                <li>They enter the code to access their personalized Data Room</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What does the investor see?</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Only the documents you have shared with them specifically</li>
                <li>Information on when each document was shared</li>
                <li>Tracking of which documents they have viewed and downloaded</li>
                <li>They can view and download shared documents</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>🔒 Security:</strong> Each investor only sees their own documents. The system validates
                that the email matches a lead in your CRM before allowing access.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Activity Tracking</h3>
              <p className="text-gray-600">
                You can see which documents have been viewed and downloaded by each investor. This information
                helps you understand the level of interest and engagement of each lead in your pipeline.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'automation',
        title: 'Configuring Automations',
        icon: <Zap size={20} />,
        content: (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What are Automations?</h3>
              <p className="text-gray-600">
                Automations let you share documents automatically when a lead
                reaches a specific stage. This saves time and ensures investors receive
                the right information at the right time.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Creating an Automation Rule</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Go to the &quot;Automation&quot; page</li>
                <li>Click &quot;Create Rule&quot;</li>
                <li>Give your rule a descriptive name</li>
                <li>Select the stage that will trigger the rule (trigger stage)</li>
                <li>Choose the documents you want to share</li>
                <li>Set an optional delay (0 = immediate)</li>
                <li>Optionally, set up a notification email with variables like {'{{name}}'}, {'{{firm}}'}</li>
                <li>Enable the rule and save it</li>
              </ol>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">⏱️ What is Delay and how to use it?</h3>
              <p className="text-gray-700 mb-3">
                The <strong>delay</strong> is the number of days you wait <em>after</em> a lead
                reaches a stage before sharing documents automatically.
              </p>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Delay = 0 (Immediate):</p>
                  <p className="text-gray-700 text-sm">
                    Documents are shared as soon as the lead enters the stage.
                    <strong> Use when:</strong> You want the investor to have immediate access to the information
                    (e.g. share pitch deck when they reach &quot;Pitch Shared&quot;).
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Delay {'>'} 0 (With wait):</p>
                  <p className="text-gray-700 text-sm">
                    Documents are shared after X days in the stage.
                    <strong> Use when:</strong> You want to give the investor time to process information
                    before sharing more documents, or when there is a sequential process (e.g. share
                    financials 3 days after entering &quot;Due Diligence&quot; so they review the pitch first).
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-yellow-300">
                  <p className="text-sm font-medium text-gray-900 mb-1">💡 Example:</p>
                  <p className="text-sm text-gray-700">
                    Lead enters &quot;Due Diligence&quot; on February 1. If you set a 5-day delay,
                    documents will be shared automatically on February 6, giving the investor
                    time to review the initial documents first.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🚀 How to Make Automations Efficient</h3>
              <p className="text-gray-700 mb-3">
                The key is understanding the <strong>difference between Document Permissions and Automation Rules</strong>,
                and when to use each:
              </p>
              <div className="space-y-4">
                <div className="bg-white p-3 rounded border border-green-300">
                  <p className="font-medium text-gray-900 mb-2">📋 Document Permissions (Data Room):</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-2">
                    <li>Define <strong>when</strong> a document can be shared</li>
                    <li>Configured per individual document</li>
                    <li>Simpler: just check stages and delays</li>
                    <li>Useful for documents that are always shared in the same stages</li>
                    <li><strong>Do not send emails</strong> - they only share documents automatically</li>
                  </ul>
                  <p className="text-xs text-gray-600 italic">
                    Example: &quot;The pitch deck is always shared when a lead reaches &apos;Pitch Shared&apos;&quot;
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-green-300">
                  <p className="font-medium text-gray-900 mb-2">⚙️ Automation Rules:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-2">
                    <li>Define <strong>which documents</strong> to share and <strong>how</strong></li>
                    <li>Can group multiple documents in one action</li>
                    <li>Allow custom emails with templates</li>
                    <li>Useful for complex flows or when you want to control the process</li>
                  </ul>
                  <p className="text-xs text-gray-600 italic">
                    Example: &quot;When a lead reaches &apos;Due Diligence&apos;, share financials AND cap table,
                    with a custom email explaining what they include&quot;
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-300">
                  <p className="font-medium text-gray-900 mb-2">🎯 When to use each:</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">Use Permissions when:</p>
                      <ul className="list-disc list-inside text-gray-700 ml-2">
                        <li>You have documents that are always shared the same way</li>
                        <li>You want quick, simple setup</li>
                        <li>Each document has its own timing</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Use Rules when:</p>
                      <ul className="list-disc list-inside text-gray-700 ml-2">
                        <li>You want to group several documents in one action</li>
                        <li>You need custom emails with context</li>
                        <li>You have complex flows that need specific logic</li>
                        <li>You want to easily enable/disable groups of documents</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-300">
                  <p className="font-medium text-gray-900 mb-2">✨ Best Practices:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li><strong>Combine both:</strong> Use permissions for basic documents and rules for special packages</li>
                    <li><strong>Name your rules well:</strong> &quot;Share Pitch Package on Pitch Shared&quot; is better than &quot;Rule 1&quot;</li>
                    <li><strong>Review regularly:</strong> Disable rules you no longer use</li>
                    <li><strong>Test first:</strong> Create a test lead to verify automations work</li>
                    <li><strong>Document in notes:</strong> When you move a lead, add notes explaining why</li>
                  </ol>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Variables</h3>
              <p className="text-gray-600 mb-2">You can use these variables in your email templates:</p>
              <div className="bg-gray-50 p-3 rounded space-y-1 text-sm">
                <div><code className="bg-white px-2 py-1 rounded">{'{{name}}'}</code> - Lead name</div>
                <div><code className="bg-white px-2 py-1 rounded">{'{{firm}}'}</code> - Firm name</div>
                <div><code className="bg-white px-2 py-1 rounded">{'{{email}}'}</code> - Lead email</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Managing Rules</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>Enable/Disable:</strong> Use the toggle on each rule to turn it on or off</li>
                <li><strong>Edit:</strong> Click the edit icon to modify an existing rule</li>
                <li><strong>Delete:</strong> Click the delete icon to remove a rule</li>
                <li><strong>Multiple Rules:</strong> You can have several rules for the same stage</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Automations run automatically when you move a lead
                to a new stage. Check the browser console to see execution logs.
              </p>
            </div>
          </div>
        ),
      },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="text-primary-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Learn how to use InvestiaFlow to manage your fundraising process efficiently
        </p>
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="text-primary-600" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Interactive Tutorials</h3>
              <p className="text-sm text-gray-600">
                Learn step by step with our guided in-app tours
              </p>
            </div>
          </div>
          <Button 
            variant="primary" 
            onClick={handleStartTutorials}
            isLoading={isResettingOnboarding}
            disabled={isResettingOnboarding}
          >
            <PlayCircle size={16} className="mr-2" />
            Start Tutorials
          </Button>
        </div>
      </div>

      {/* Secciones principales */}
      <div className="space-y-4 mb-8">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-primary-600">{section.icon}</div>
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
              {expandedSections.has(section.id) ? (
                <ChevronDown className="text-gray-400" size={20} />
              ) : (
                <ChevronRight className="text-gray-400" size={20} />
              )}
            </button>
            {expandedSections.has(section.id) && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="pt-4">{section.content}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preguntas Frecuentes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="text-primary-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(`faq-${index}`)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {expandedFAQs.has(`faq-${index}`) ? (
                  <ChevronDown className="text-gray-400" size={20} />
                ) : (
                  <ChevronRight className="text-gray-400" size={20} />
                )}
              </button>
              {expandedFAQs.has(`faq-${index}`) && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tips y Mejores Prácticas */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="text-yellow-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Tips and Best Practices</h2>
        </div>
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              {tip.icon}
              <p className="text-gray-700 flex-1">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contacto */}
      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>
          Need more help? Contact{' '}
          <a href="mailto:sebas@investia.capital" className="text-primary-600 hover:underline">
            sebas@investia.capital
          </a>
        </p>
      </div>
    </div>
  );
};

export default HelpPage;

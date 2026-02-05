import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTeam } from '../contexts/TeamContext';
import { invitationService } from '../services/invitationService';
import { Button } from '../components/shared/Button';
import { Loader as LoaderComponent } from '../components/shared/Loader';

const InviteAcceptPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, firebaseUser } = useAuth();
  const { currentTeam, teams, refreshTeams, refreshMembers, refreshInvitations, setCurrentTeam } = useTeam();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'already_accepted'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid invitation link');
      setLoading(false);
      return;
    }

    // Check if user is authenticated
    if (!user) {
      // Try to get invitation email to show in login page (non-blocking)
      invitationService.getInvitationByToken(token)
        .then((invitation) => {
          if (invitation) {
            // Redirect to login with email hint
            navigate(`/login?redirect=/invite/${token}&email=${encodeURIComponent(invitation.email)}`);
          } else {
            // Redirect to login without email hint
            navigate(`/login?redirect=/invite/${token}`);
          }
        })
        .catch(() => {
          // If we can't load invitation, still redirect to login
          navigate(`/login?redirect=/invite/${token}`);
        });
      return;
    }

    // Load invitation details when user is authenticated
    loadInvitation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]); // Only depend on user.id to avoid infinite loops

  const loadInvitation = async () => {
    if (!token) return;

    try {
      const invitation = await invitationService.getInvitationByToken(token);
      
      if (!invitation) {
        setStatus('error');
        setErrorMessage('Invitation not found or invalid');
        setLoading(false);
        return;
      }

      if (invitation.expiresAt < new Date()) {
        setStatus('expired');
        setLoading(false);
        return;
      }

      if (invitation.acceptedAt) {
        setStatus('already_accepted');
        setLoading(false);
        return;
      }

      // Check if email matches
      if (user && invitation.email.toLowerCase() !== user.email.toLowerCase()) {
        setStatus('error');
        setErrorMessage(`This invitation was sent to ${invitation.email}, but you're logged in as ${user.email}`);
        setLoading(false);
        return;
      }

      // Auto-accept if everything is valid
      if (user) {
        await handleAccept();
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to load invitation');
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token || !user) return;

    setAccepting(true);
    try {
      await invitationService.acceptInvitation(
        token,
        user.id,
        user.email,
        user.name
      );

      // Refresh team data to include the new member
      try {
        await refreshTeams();
        await refreshMembers();
        await refreshInvitations();
        
        // Ensure currentTeam is set for the new member
        // refreshTeams should set it, but let's make sure
        const { currentTeam: refreshedTeam } = useTeam();
        if (!refreshedTeam && teams.length > 0) {
          setCurrentTeam(teams[0]);
        }
      } catch (refreshError) {
        console.warn('Failed to refresh team data:', refreshError);
        // Don't fail the whole operation if refresh fails
      }

      setStatus('success');
      
      // Redirect to team page after a short delay
      setTimeout(() => {
        navigate('/team');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
      setLoading(false);
    }
  };

  if (loading || accepting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoaderComponent size="lg" />
          <p className="mt-4 text-gray-600">
            {accepting ? 'Accepting invitation...' : 'Loading invitation...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'success' && (
          <>
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Accepted!</h1>
            <p className="text-gray-600 mb-6">
              You've successfully joined the team. Redirecting to team page...
            </p>
            <Button variant="primary" onClick={() => navigate('/team')}>
              Go to Team Page
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={64} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
          </>
        )}

        {status === 'expired' && (
          <>
            <XCircle size={64} className="mx-auto text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h1>
            <p className="text-gray-600 mb-6">
              This invitation has expired. Please ask for a new invitation.
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
          </>
        )}

        {status === 'already_accepted' && (
          <>
            <CheckCircle size={64} className="mx-auto text-blue-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Accepted</h1>
            <p className="text-gray-600 mb-6">
              You've already accepted this invitation.
            </p>
            <Button variant="primary" onClick={() => navigate('/team')}>
              Go to Team Page
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default InviteAcceptPage;

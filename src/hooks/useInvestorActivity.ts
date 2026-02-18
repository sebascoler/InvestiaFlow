import { useState, useEffect } from 'react';
import { useTeam } from '../contexts/TeamContext';
import { investorActivityService } from '../services/investorActivityService';
import { InvestorActivity } from '../types/investorActivity';

export function useInvestorActivity(leadId?: string) {
  const { currentTeam } = useTeam();
  const [activities, setActivities] = useState<InvestorActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (leadId) {
          const data = await investorActivityService.getActivitiesForLead(leadId);
          setActivities(data);
        } else if (currentTeam?.id) {
          const data = await investorActivityService.getActivities(currentTeam.id);
          setActivities(data);
        }
      } catch (error) {
        console.error('Error loading investor activities:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentTeam?.id, leadId]);

  return { activities, loading };
}

import OverviewTab from './tabs/OverviewTab';
import ProfileTab from './tabs/ProfileTab';
import ProjectsTab from './tabs/ProjectsTab';
import TeamsTab from './tabs/TeamsTab';
import ComingSoonTab from './tabs/ComingSoonTab';
import ManageTeams from './tabs/ManageTeams';
import TaskManagement from './tabs/TaskManagement';
/**
 * Dashboard Content Component
 * 
 * Renders the content based on the active tab.
 * 
 * Props:
 * - activeTab: Currently active tab ID
 * - user: Current user object
 * - organization: Current organization object
 * - team: Array of user's teams
 * - project: Array of user's projects
 */
export default function DashboardContent({ activeTab, user, organization, team, project }) {
  switch (activeTab) {
    case 'overview':
      return <OverviewTab user={user} team={team} project={project} />;
    case 'profile':
      return <ProfileTab user={user} organization={organization} />;
    case 'projects':
      return <ProjectsTab user={user} project={project} />;
    case 'teams':
      return <TeamsTab user={user} team={team} />;
    case 'manage-teams':
      return <ManageTeams user={user}/>
    case 'task':
      return <TaskManagement user={user}/>
    default:
      return <ComingSoonTab />;
  }
}
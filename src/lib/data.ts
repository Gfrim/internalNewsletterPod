import type { Source } from './types';

export const mockSources: Source[] = [
  {
    id: '1',
    title: 'Q2 Engineering Sprint Review',
    content: `The second quarter saw tremendous progress from the engineering team. We successfully launched the new user dashboard, which has received positive feedback for its improved performance and user experience. Key metrics show a 30% increase in user engagement since the launch. We also refactored the legacy authentication service, improving security and reducing latency by 50ms on average. However, we faced challenges with third-party API integrations, causing a two-week delay in the 'Project Phoenix' timeline. The team is now working on a more robust integration strategy to mitigate future risks.`,
    summary: 'Q2 saw the launch of a new user dashboard, boosting engagement by 30%. The team also refactored the auth service, improving security. A two-week delay occurred in \'Project Phoenix\' due to API integration issues.',
    category: 'key activities',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://example.com/doc/q2-sprint-review'
  },
  {
    id: '2',
    title: 'Marketing Circle Reaches 1M Followers',
    content: 'A huge win for the marketing circle this month! We officially crossed the 1 million follower mark on our primary social media platform. This milestone is a testament to our consistent content strategy and community engagement efforts over the past year. The "Connect & Create" campaign was particularly successful, generating over 5 million impressions and 200,000 new followers alone. We are incredibly proud of this achievement and thankful for the collaborative effort across the organization.',
    summary: 'Marketing has successfully reached 1 million followers on social media, largely driven by the high-impact "Connect & Create" campaign which brought in 200,000 new followers.',
    category: 'wins',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Scaling Infrastructure for Growth',
    content: 'As our user base grows, our infrastructure is showing signs of strain. Last week, we experienced two minor outages during peak traffic hours, affecting approximately 5% of users. The root cause was identified as a database connection pool limit. The DevOps team has implemented a temporary fix and is working on a long-term solution involving a switch to a more scalable database architecture. This transition is now a top priority for Q3 to ensure service stability.',
    summary: 'Recent infrastructure strain led to minor outages affecting 5% of users. The cause was a database connection limit. A permanent fix involving a more scalable database is a top priority for Q3.',
    category: 'challenges',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'New Onboarding Flow for Employees',
    content: 'HR has rolled out a new, streamlined onboarding process for all new hires, effective immediately. The new flow, accessible via the internal portal, digitizes all paperwork and provides a clear 30-day plan for new team members. This initiative is expected to reduce administrative overhead by 40% and improve the new hire experience. Feedback from the first batch of employees has been overwhelmingly positive.',
    summary: 'A new digital onboarding process has been launched internally to streamline hiring. It is expected to cut administrative work by 40% and has received positive initial feedback.',
    category: 'internal',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Site-wide constants: one place for the canonical host, the author identity and
// the profile links that appear both in the page footer and in the Person schema.
export const SITE = 'https://www.shubhamrandive.com';
export const AUTHOR = 'Shubham Randive';
export const EMAIL = 'randiveshubham3@gmail.com';

export const PROFILES = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shubham-randive-303/' },
  { label: 'GitHub', href: 'https://github.com/shubham303' },
  { label: 'Twitter', href: 'https://x.com/shubham_19hshs' },
  { label: 'Medium', href: 'https://medium.com/@randiveshubham3' },
  { label: 'Substack', href: 'https://substack.com/@shubhamrandive' },
  { label: 'Reddit', href: 'https://www.reddit.com/user/No_Incident_6009/' },
];

/** The Person node every page points its author/publisher at. */
export const PERSON = {
  '@type': 'Person',
  '@id': `${SITE}/#person`,
  name: AUTHOR,
  url: SITE,
  image: `${SITE}/photo.jpg`,
  email: `mailto:${EMAIL}`,
  jobTitle: 'Machine Learning Engineer',
  description:
    'Machine learning engineer who builds AI agents and writes about data science, agents and shipping software.',
  sameAs: PROFILES.map((p) => p.href),
};

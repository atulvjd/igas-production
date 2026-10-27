import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Flex, Typography, SingleSelect, SingleSelectOption } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';

type Entry = { documentId: string; email?: string; subscriptionStatus?: string; consentAt?: string; mode?: string; title?: string; subject?: string; updatedAt?: string };
const statuses = ['pending', 'subscribed', 'unsubscribed'];
export default function Newsletters() {
  const { get, put } = useFetchClient();
  const [tab, setTab] = useState<'subscribers' | 'drafts'>('subscribers');
  const [rows, setRows] = useState<Entry[]>([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState<string>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [changes, setChanges] = useState<Record<string, string>>({});
  const model = tab === 'subscribers' ? 'api::newsletter-subscriber.newsletter-subscriber' : 'api::newsletter.newsletter';
  const endpoint = `/content-manager/collection-types/${model}`;
  useEffect(() => { document.title = 'Newsletter | Strapi'; }, []);
  useEffect(() => {
    let active = true;
    setBusy(true); setError(''); setChanges({});
    const query = new URLSearchParams({ page: String(page), pageSize: '20', sort: tab === 'subscribers' ? 'consentAt:DESC' : 'updatedAt:DESC' });
    if (tab === 'subscribers' && filter !== 'all') query.set('filters[subscriptionStatus][$eq]', filter);
    if (tab === 'drafts') query.set('status', 'draft');
    get<{ results: Entry[]; pagination: { total: number; pageCount: number } }>(`${endpoint}?${query}`)
      .then(({ data }) => { if (active) { setRows(data.results); setTotal(data.pagination.total); setPages(Math.max(1, data.pagination.pageCount)); } })
      .catch(() => { if (active) setError('Could not load newsletter records. Check your permissions or try again.'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [get, endpoint, tab, filter, page, revision]);
  async function save(row: Entry) {
    if (saving) return;
    setSaving(row.documentId); setError(''); setNotice('');
    try {
      await put(`${endpoint}/${row.documentId}`, { subscriptionStatus: changes[row.documentId] });
      setNotice('Subscriber status saved.'); setRevision(value => value + 1);
    } catch { setError('Could not update this subscriber. Check your edit permissions or try again.'); }
    finally { setSaving(undefined); }
  }
  const editor = '/content-manager/collection-types/api::newsletter.newsletter';
  return <main id="main-content" style={{ padding: 32, maxWidth: 1600, margin: '0 auto' }}><Flex direction="column" alignItems="stretch" gap={6}>
    <div><Typography tag="h1" variant="alpha">Newsletter</Typography><Box paddingTop={2}><Typography textColor="neutral600">Manage website signups and prepare newsletter content.</Typography></Box></div>
    <Box background="primary100" padding={5} hasRadius><Typography textColor="primary700">Email sending is not connected. Saving or publishing a newsletter does not send emails. New signups are pending review; verify the address before marking it subscribed.</Typography></Box>
    <Flex gap={3}><Button variant={tab === 'subscribers' ? 'default' : 'secondary'} onClick={() => { setTab('subscribers'); setPage(1); setNotice(''); }}>Subscribers</Button><Button variant={tab === 'drafts' ? 'default' : 'secondary'} onClick={() => { setTab('drafts'); setPage(1); setNotice(''); }}>Newsletter drafts</Button></Flex>
    {error && <Box role="alert" padding={4} background="danger100"><Typography textColor="danger700">{error}</Typography></Box>}
    {notice && <Box role="status" padding={4} background="success100"><Typography textColor="success700">{notice}</Typography></Box>}
    <Flex gap={4} justifyContent="space-between" wrap="wrap"><Typography>{total} {tab === 'subscribers' ? 'subscribers' : 'newsletters'}</Typography><Flex gap={3}>{tab === 'subscribers' ? <SingleSelect aria-label="Subscription status" value={filter} onChange={value => { setFilter(String(value)); setPage(1); }}><SingleSelectOption value="all">All statuses</SingleSelectOption>{statuses.map(status => <SingleSelectOption key={status} value={status}>{status}</SingleSelectOption>)}</SingleSelect> : <Link to={`${editor}/create`}>Create newsletter draft</Link>}<Button variant="secondary" onClick={() => setRevision(value => value + 1)}>Refresh</Button></Flex></Flex>
    {busy ? <Typography>Loading…</Typography> : !rows.length ? <Box padding={8} background="neutral0" hasRadius><Typography>{tab === 'subscribers' ? 'No subscribers match this view.' : 'No newsletters yet. Create your first draft.'}</Typography></Box> : rows.map(row => <Box key={row.documentId} padding={5} background="neutral0" hasRadius><Flex justifyContent="space-between" gap={4} wrap="wrap"><div><Typography variant="delta" tag="h2">{tab === 'subscribers' ? row.email : row.title}</Typography><Box paddingTop={2}><Typography textColor="neutral600">{tab === 'subscribers' ? `Consent recorded: ${row.consentAt ? new Date(row.consentAt).toLocaleString() : 'Not recorded'} · ${row.mode || 'india'}` : row.subject}</Typography></Box></div>{tab === 'subscribers' ? <Flex gap={3} wrap="wrap"><SingleSelect aria-label={`Status for ${row.email}`} disabled={Boolean(saving)} value={changes[row.documentId] || row.subscriptionStatus || 'pending'} onChange={value => setChanges(previous => ({ ...previous, [row.documentId]: String(value) }))}>{statuses.map(status => <SingleSelectOption key={status} value={status}>{status}</SingleSelectOption>)}</SingleSelect><Button loading={saving === row.documentId} disabled={!changes[row.documentId] || Boolean(saving)} onClick={() => save(row)}>Save status</Button></Flex> : <Link to={`${editor}/${row.documentId}`}>Edit and preview draft</Link>}</Flex></Box>)}
    <Flex gap={4}><Button variant="tertiary" disabled={busy || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><Typography>Page {page} of {pages}</Typography><Button variant="tertiary" disabled={busy || page >= pages} onClick={() => setPage(value => value + 1)}>Next</Button></Flex>
  </Flex></main>;
}

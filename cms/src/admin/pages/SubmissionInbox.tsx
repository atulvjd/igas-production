import { useEffect, useState } from 'react';
import { Box, Button, Flex, Typography, SingleSelect, SingleSelectOption, Textarea } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import SubmissionFile from '../components/SubmissionFile';

type Submission = {
  documentId: string; name: string; email: string; message: string;
  receivedAt?: string; createdAt?: string; submissionStatus: string;
  jobTitle?: string; mode?: string; consent?: boolean; notes?: string;
  attachment?: { name: string; type: string; size: number; contentBase64: string };
};
const statuses = ['new', 'reviewing', 'contacted', 'closed'];
const date = (value?: string) => value ? new Date(value).toLocaleString() : '—';

export default function SubmissionInbox({ application = false }: { application?: boolean }) {
  const { get, put } = useFetchClient();
  const model = application ? 'api::job-application.job-application' : 'api::enquiry.enquiry';
  const endpoint = `/content-manager/collection-types/${model}`;
  const title = application ? 'Job Applications' : 'Enquiries';
  useEffect(() => { document.title = `${title} | Strapi`; }, [title]);
  const [rows, setRows] = useState<Submission[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string>();
  const [selected, setSelected] = useState<Submission>();
  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const query = new URLSearchParams({ page: String(page), pageSize: '20', sort: 'receivedAt:DESC' });
    // File contents are fetched only when a submission is opened.
    const fields = ['documentId', 'name', 'email', 'receivedAt', 'createdAt', 'submissionStatus'];
    if (application) fields.push('jobTitle');
    fields.forEach((field, index) => query.set(`fields[${index}]`, field));
    if (filter !== 'all') query.set('filters[submissionStatus][$eq]', filter);
    get<{ results: Submission[]; pagination: { total: number; pageCount: number } }>(`${endpoint}?${query}`).then(({ data }) => {
      if (!active) return;
      setRows(data.results);
      setTotal(data.pagination.total);
      setPages(Math.max(1, data.pagination.pageCount));
    }).catch(() => { if (active) setError('Could not load this inbox. Check your permissions or try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [get, endpoint, page, filter, revision, application]);

  useEffect(() => {
    let active = true;
    setSelected(undefined);
    if (!selectedId) return;
    setDetailLoading(true);
    setError('');
    setNotice('');
    get<{ data: Submission }>(`${endpoint}/${selectedId}`).then(({ data }) => {
      if (!active) return;
      setSelected(data.data);
      setStatus(data.data.submissionStatus || 'new');
      setNotes(data.data.notes || '');
    }).catch(() => { if (active) setError('Could not open this submission.'); })
      .finally(() => { if (active) setDetailLoading(false); });
    return () => { active = false; };
  }, [get, endpoint, selectedId]);

  async function save() {
    if (!selected || saving) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await put(`${endpoint}/${selected.documentId}`, { submissionStatus: status, notes });
      setNotice('Status and notes saved.');
      setRevision(value => value + 1);
    } catch { setError('Could not save changes. Check your edit permissions or try again.'); }
    finally { setSaving(false); }
  }

  return <main id="main-content" style={{ padding: '32px', maxWidth: 1600, margin: '0 auto' }}>
    <Flex direction="column" alignItems="stretch" gap={6}>
      <div><Typography variant="alpha" tag="h1">{title}</Typography><Box paddingTop={2}><Typography textColor="neutral600">{application ? 'Applications and CVs sent by candidates through the website.' : 'Messages and briefs sent by visitors through the website.'}</Typography></Box></div>
      {error && <Box role="alert" padding={4} background="danger100"><Typography textColor="danger700">{error}</Typography></Box>}
      {notice && <Box role="status" padding={4} background="success100"><Typography textColor="success700">{notice}</Typography></Box>}
      {selectedId ? <>
        <div><Button variant="tertiary" disabled={saving} onClick={() => { setSelectedId(undefined); setNotice(''); setError(''); }}>Back to {title.toLowerCase()}</Button></div>
        {detailLoading ? <Typography>Loading submission…</Typography> : selected && <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
          <Flex direction="column" alignItems="stretch" gap={5}>
            <Typography tag="h2" variant="beta">{selected.name}</Typography>
            <Typography>Email: {selected.email}</Typography>
            {application && <Typography>Role: {selected.jobTitle}</Typography>}
            <Typography>Received: {date(selected.receivedAt || selected.createdAt)} · Site: {selected.mode || 'india'}</Typography>
            <Typography>Contact consent: {selected.consent ? 'Given' : 'Not recorded'}</Typography>
            <div><Typography variant="delta" tag="h3">Message</Typography><Box paddingTop={3}><Typography style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{selected.message}</Typography></Box></div>
            <SubmissionFile value={selected.attachment} label={application ? 'CV' : 'Attachment'} name="inbox-file" />
            <div><Typography tag="label" htmlFor="inbox-status" fontWeight="bold">Review status</Typography><Box paddingTop={2}><SingleSelect id="inbox-status" value={status} onChange={value => setStatus(String(value))} disabled={saving}>{statuses.map(value => <SingleSelectOption key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</SingleSelectOption>)}</SingleSelect></Box></div>
            <div><Typography tag="label" htmlFor="inbox-notes" fontWeight="bold">Internal notes</Typography><Box paddingTop={2}><Textarea id="inbox-notes" value={notes} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(event.target.value)} disabled={saving} /></Box></div>
            <div><Button onClick={save} loading={saving}>Save status and notes</Button></div>
          </Flex>
        </Box>}
      </> : <>
        <Flex gap={4} wrap="wrap" justifyContent="space-between"><Typography>{total} {total === 1 ? 'submission' : 'submissions'}</Typography><Flex gap={3}><SingleSelect aria-label="Filter by review status" value={filter} onChange={value => { setFilter(String(value)); setPage(1); }}><SingleSelectOption value="all">All statuses</SingleSelectOption>{statuses.map(value => <SingleSelectOption key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</SingleSelectOption>)}</SingleSelect><Button variant="secondary" onClick={() => setRevision(value => value + 1)}>Refresh</Button></Flex></Flex>
        {loading ? <Typography>Loading submissions…</Typography> : !rows.length ? <Box background="neutral0" padding={8} hasRadius><Typography>No submissions{filter !== 'all' ? ' with this status' : ' yet'}.</Typography></Box> : <Flex direction="column" alignItems="stretch" gap={3}>{rows.map(row => <Box key={row.documentId} padding={5} background="neutral0" hasRadius><Flex gap={4} justifyContent="space-between" wrap="wrap"><div><Typography variant="delta" tag="h2">{row.name}</Typography><Box paddingTop={2}><Typography textColor="neutral600">{row.email}{application && row.jobTitle ? ` · ${row.jobTitle}` : ''}</Typography></Box><Box paddingTop={2}><Typography textColor="neutral600">{date(row.receivedAt || row.createdAt)} · {row.submissionStatus}</Typography></Box></div><Button variant="secondary" onClick={() => setSelectedId(row.documentId)}>Open submission</Button></Flex></Box>)}</Flex>}
        <Flex gap={4}><Button variant="tertiary" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><Typography>Page {page} of {pages}</Typography><Button variant="tertiary" disabled={loading || page >= pages} onClick={() => setPage(value => value + 1)}>Next</Button></Flex>
      </>}
    </Flex>
  </main>;
}

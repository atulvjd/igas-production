import { forwardRef } from 'react';
import { Button, Typography } from '@strapi/design-system';

type StoredFile = { name: string; type: string; size: number; contentBase64: string };

const SubmissionFile = forwardRef<HTMLButtonElement, { value?: StoredFile | string | null; label?: string; name?: string }>(function SubmissionFile({ value, label = 'Submitted file', name }, ref) {
  let file: StoredFile | undefined;
  try { file = typeof value === 'string' ? JSON.parse(value) : value || undefined; } catch { /* Invalid historical data is not downloadable. */ }
  function download() {
    if (!file?.contentBase64) return;
    const bytes = Uint8Array.from(atob(file.contentBase64), c => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: file.type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div style={{ display: 'grid', gap: 10, color: 'inherit' }}>
    <Typography tag="span" fontWeight="bold">{label}</Typography>
    {file?.contentBase64 ? <><Typography>{file.name} · {Math.ceil(file.size / 1024)} KB</Typography><div><Button ref={ref} id={name} type="button" variant="secondary" onClick={download}>Download file</Button></div></> : <Typography textColor="neutral600">No file attached.</Typography>}
  </div>;
});
export default SubmissionFile;

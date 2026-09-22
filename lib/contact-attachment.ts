import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

/**
 * Private, short-lived development storage. Directories and files are owner-only,
 * and are removed even if provider delivery fails. Production storage is deliberately
 * not assumed: configure an approved provider adapter before enabling attachments.
 */
export async function withTemporaryContactAttachment(file: File, safeName: string, deliver: (bytes: Buffer) => Promise<void>) {
  const directory = await mkdtemp(path.join(tmpdir(), 'igas-contact-'))
  const location = path.join(directory, safeName)
  try {
    const bytes = Buffer.from(await file.arrayBuffer())
    await writeFile(location, bytes, { mode: 0o600 })
    await deliver(bytes)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

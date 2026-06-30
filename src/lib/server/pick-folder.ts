import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type PickFolderResult =
	| { ok: true; path: string }
	| { ok: false; cancelled: true }
	| { ok: false; cancelled: false; error: string };

async function pickFolderMac(prompt: string): Promise<PickFolderResult> {
	const script = `POSIX path of (choose folder with prompt "${prompt.replace(/"/g, '\\"')}")`;
	try {
		const { stdout } = await execFileAsync('osascript', ['-e', script]);
		const folder = stdout.trim();
		if (!folder) return { ok: false, cancelled: false, error: 'No folder selected' };
		return { ok: true, path: folder };
	} catch (e) {
		const err = e as NodeJS.ErrnoException & { stderr?: string };
		if (err.code === 1) return { ok: false, cancelled: true };
		return { ok: false, cancelled: false, error: err.stderr?.trim() || err.message || 'Folder picker failed' };
	}
}

async function pickFolderWindows(prompt: string): Promise<PickFolderResult> {
	const ps = [
		'Add-Type -AssemblyName System.Windows.Forms',
		'$dialog = New-Object System.Windows.Forms.FolderBrowserDialog',
		`$dialog.Description = '${prompt.replace(/'/g, "''")}'`,
		"if ($dialog.ShowDialog() -eq 'OK') { Write-Output $dialog.SelectedPath } else { exit 1 }"
	].join('; ');
	try {
		const { stdout } = await execFileAsync('powershell', ['-NoProfile', '-Command', ps]);
		const folder = stdout.trim();
		if (!folder) return { ok: false, cancelled: false, error: 'No folder selected' };
		return { ok: true, path: folder };
	} catch (e) {
		const err = e as NodeJS.ErrnoException;
		if (err.code === 1) return { ok: false, cancelled: true };
		return { ok: false, cancelled: false, error: err.message || 'Folder picker failed' };
	}
}

async function pickFolderLinux(): Promise<PickFolderResult> {
	try {
		const { stdout } = await execFileAsync('zenity', ['--file-selection', '--directory']);
		const folder = stdout.trim();
		if (!folder) return { ok: false, cancelled: false, error: 'No folder selected' };
		return { ok: true, path: folder };
	} catch (e) {
		const err = e as NodeJS.ErrnoException;
		if (err.code === 1) return { ok: false, cancelled: true };
		try {
			const { stdout } = await execFileAsync('kdialog', ['--getexistingdirectory', '.']);
			const folder = stdout.trim();
			if (!folder) return { ok: false, cancelled: false, error: 'No folder selected' };
			return { ok: true, path: folder };
		} catch (e2) {
			const err2 = e2 as NodeJS.ErrnoException;
			if (err2.code === 1) return { ok: false, cancelled: true };
			return {
				ok: false,
				cancelled: false,
				error: 'Folder picker is not available on this system'
			};
		}
	}
}

export async function pickFolder(prompt: string): Promise<PickFolderResult> {
	switch (process.platform) {
		case 'darwin':
			return pickFolderMac(prompt);
		case 'win32':
			return pickFolderWindows(prompt);
		case 'linux':
			return pickFolderLinux();
		default:
			return { ok: false, cancelled: false, error: 'Folder picker is not supported on this platform' };
	}
}

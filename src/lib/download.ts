/** Saves text as a file through the browser's normal download, with no server involved. */
export function downloadText(fileName: string, text: string, type = 'application/json') {
	const url = URL.createObjectURL(new Blob([text], { type }));
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.append(link);
	link.click();
	link.remove();
	// Give the browser a moment to start the download before the address goes away.
	setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

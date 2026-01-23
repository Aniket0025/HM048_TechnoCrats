// Placeholder for Excalidraw export utilities.
// In production, you would:
// - Use Excalidraw client-side SVG/PNG export and upload to cloud storage.
// - Or use Puppeteer/Playwright on the server to render SVG to PNG/PDF.
// For now, we return mock URLs.

export async function exportExcalidrawToPNG(noteId, excalidrawData) {
    // TODO: Implement actual export (client-side upload to S3/CloudFront)
    return `https://cdn.example.com/notes/${noteId}.png`;
}

export async function exportExcalidrawToPDF(noteId, excalidrawData) {
    // TODO: Implement actual export (client-side upload to S3/CloudFront)
    return `https://cdn.example.com/notes/${noteId}.pdf`;
}

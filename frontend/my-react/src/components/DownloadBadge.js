// Floating download button placed above the footer to trigger a file download.
import React from 'react';
import { Download } from 'react-bootstrap-icons';

export default function DownloadBadge() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/sample.pdf';
    link.download = 'civicissues-info.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button type="button" className="download-badge" onClick={handleDownload} aria-label="Download information PDF">
      <Download size={20} />
      <span className="ms-2 d-none d-sm-inline">Download</span>
    </button>
  );
}






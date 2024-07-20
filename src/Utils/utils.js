// Utility function to extract plain text from HTML
export const extractPlainText = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

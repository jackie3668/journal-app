import React from 'react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfMake from 'html-to-pdfmake';
import Papa from 'papaparse';
import './Export.css'

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const Export = ({ entryTitle, entryText }) => {

  const handleExportTxt = () => {
    let text = entryText
      .replace(/<\/p>/gi, '\n\n')        
      .replace(/<br\s*\/?>/gi, '\n')     
      .replace(/<\/div>/gi, '\n\n')     
      .replace(/<\/h[1-6]>/gi, '\n\n')   
      .replace(/<[^>]*>/g, '')           
      .replace(/\n\s*\n/g, '\n\n')      
      .trim();                           
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${entryTitle || 'Untitled'}.txt`);
  };
  
  const handleExportPdf = () => {
    const docDefinition = {
      content: [
        { text: entryTitle || 'Untitled', style: 'header' },
        htmlToPdfMake(entryText)
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
      },
    };

    pdfMake.createPdf(docDefinition).download(`${entryTitle || 'Untitled'}.pdf`);
  };

  const handleExportCsv = () => {
    let text = entryText
      .replace(/<\/p>/gi, '\n')        
      .replace(/<br\s*\/?>/gi, '\n')   
      .replace(/<\/div>/gi, '\n')      
      .replace(/<\/h[1-6]>/gi, '\n')   
      .replace(/<[^>]*>/g, '')         
      .split('\n')                     
      .map(row => row.trim())          
      .filter(row => row.length > 0)  
      .map(row => [row]);            

    const csv = Papa.unparse(text, { header: false });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${entryTitle || 'Untitled'}.csv`);
  };

  const handleExportDocx = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: entryTitle || 'Untitled',
              heading: 'Heading1',
            }),
            ...convertHtmlToDocx(entryText),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${entryTitle || 'Untitled'}.docx`);
  };

  return (
    <div className='export-menu'>
      <button onClick={handleExportTxt}>Export as TXT</button>
      <button onClick={handleExportPdf}>Export as PDF</button>
      <button onClick={handleExportCsv}>Export as CSV</button>
      <button onClick={handleExportDocx}>Export as DOCX</button>
    </div>
  );
};

const convertHtmlToDocx = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = doc.body.children;

  return Array.from(elements).map(element => {
    switch (element.tagName) {
      case 'P':
        return new Paragraph({
          children: [new TextRun(element.textContent || '')],
        });
      default:
        return new Paragraph({
          children: [new TextRun(element.textContent || '')],
        });
    }
  });
};

export default Export;

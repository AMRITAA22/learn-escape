import jsPDF from 'jspdf';

interface Note {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export const exportNoteToPDF = (note: Note) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with wrapping
    const addText = (text: string, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal', color: [number, number, number] = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += fontSize * 0.5;
        });
        
        yPosition += 5;
    };

    // Helper to strip HTML tags and convert to plain text
    const stripHTML = (html: string): string => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Add title
    addText(note.title || 'Untitled Note', 20, 'bold', [79, 70, 229]);
    yPosition += 5;

    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Last Modified: ${new Date(note.updatedAt).toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;

    // Add a separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Add content
    const plainContent = stripHTML(note.content);
    if (plainContent) {
        addText(plainContent, 12, 'normal');
    } else {
        doc.setFontSize(12);
        doc.setTextColor(150, 150, 150);
        doc.text('No content', margin, yPosition);
    }

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // Save the PDF
    const fileName = `${note.title || 'note'}.pdf`.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(fileName);
};

export const exportAllNotesToPDF = (notes: Note[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    const stripHTML = (html: string): string => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const addText = (text: string, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal', color: [number, number, number] = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += fontSize * 0.5;
        });
        
        yPosition += 5;
    };

    // Cover page
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('My Notes Collection', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(128, 128, 128);
    doc.text(`Total Notes: ${notes.length}`, pageWidth / 2, pageHeight / 2, { align: 'center' });
    doc.text(`Exported: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

    // Add each note
    notes.forEach((note, index) => {
        doc.addPage();
        yPosition = margin;

        // Note number
        doc.setFontSize(12);
        doc.setTextColor(150, 150, 150);
        doc.text(`Note ${index + 1} of ${notes.length}`, margin, yPosition);
        yPosition += 10;

        // Note title
        addText(note.title || 'Untitled Note', 18, 'bold', [79, 70, 229]);
        
        // Metadata
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Last Modified: ${new Date(note.updatedAt).toLocaleDateString()}`, margin, yPosition);
        yPosition += 15;

        // Separator
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;

        // Content
        const plainContent = stripHTML(note.content);
        if (plainContent) {
            addText(plainContent, 12, 'normal');
        } else {
            doc.setFontSize(12);
            doc.setTextColor(150, 150, 150);
            doc.text('No content', margin, yPosition);
        }
    });

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // Save
    doc.save(`all_notes_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportNotesStats = (notes: Note[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    const stripHTML = (html: string): string => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Calculate stats
    const totalNotes = notes.length;
    const totalWords = notes.reduce((sum, note) => {
        const text = stripHTML(note.content);
        return sum + text.split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    const avgWordsPerNote = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;
    const notesWithContent = notes.filter(n => stripHTML(n.content).trim().length > 0).length;
    const emptyNotes = totalNotes - notesWithContent;

    // Find most recent note
    const mostRecent = notes.length > 0 
        ? notes.reduce((prev, current) => 
            new Date(current.updatedAt) > new Date(prev.updatedAt) ? current : prev
        ) 
        : null;

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('Notes Statistics', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    doc.setFontSize(12);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 25;

    // Stats boxes
    const addStatBox = (label: string, value: string, color: [number, number, number]) => {
        // Box
        doc.setFillColor(color[0], color[1], color[2], 0.1);
        doc.roundedRect(margin, yPosition, maxWidth, 25, 3, 3, 'F');
        
        // Label
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(label, margin + 10, yPosition + 10);
        
        // Value
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(value, margin + 10, yPosition + 20);
        
        yPosition += 35;
    };

    const maxWidth = pageWidth - 2 * margin;

    addStatBox('Total Notes', totalNotes.toString(), [79, 70, 229]);
    addStatBox('Total Words', totalWords.toLocaleString(), [16, 185, 129]);
    addStatBox('Average Words per Note', avgWordsPerNote.toString(), [245, 158, 11]);
    addStatBox('Notes with Content', notesWithContent.toString(), [59, 130, 246]);
    addStatBox('Empty Notes', emptyNotes.toString(), [239, 68, 68]);

    yPosition += 10;

    // Most recent note
    if (mostRecent) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text('Most Recently Updated', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`"${mostRecent.title || 'Untitled'}"`, margin + 10, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Updated: ${new Date(mostRecent.updatedAt).toLocaleString()}`, margin + 10, yPosition);
    }

    // Save
    doc.save(`notes_statistics_${new Date().toISOString().split('T')[0]}.pdf`);
};

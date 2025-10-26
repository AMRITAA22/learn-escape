import jsPDF from 'jspdf';

interface Note {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

// Better HTML to text conversion that preserves structure
const convertHTMLToFormattedText = (html: string): Array<{text: string, style: string}> => {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    const formattedContent: Array<{text: string, style: string}> = [];
    
    const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
                formattedContent.push({ text, style: 'normal' });
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const tagName = element.tagName.toLowerCase();
            
            switch (tagName) {
                case 'h1':
                case 'h2':
                case 'h3':
                    formattedContent.push({ text: '\n' + element.textContent + '\n', style: 'heading' });
                    break;
                case 'strong':
                case 'b':
                    formattedContent.push({ text: element.textContent || '', style: 'bold' });
                    break;
                case 'em':
                case 'i':
                    formattedContent.push({ text: element.textContent || '', style: 'italic' });
                    break;
                case 'li':
                    formattedContent.push({ text: '\n  • ' + element.textContent, style: 'normal' });
                    break;
                case 'p':
                    Array.from(element.childNodes).forEach(processNode);
                    formattedContent.push({ text: '\n', style: 'normal' });
                    break;
                case 'pre':
                case 'code':
                    formattedContent.push({ text: '\n' + element.textContent + '\n', style: 'code' });
                    break;
                case 'br':
                    formattedContent.push({ text: '\n', style: 'normal' });
                    break;
                default:
                    Array.from(element.childNodes).forEach(processNode);
                    break;
            }
        }
    };
    
    Array.from(div.childNodes).forEach(processNode);
    return formattedContent;
};

export const exportNoteToPDF = (note: Note) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    const checkPageBreak = (lineHeight: number) => {
        if (yPosition + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    };

    // Add title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    const titleLines = doc.splitTextToSize(note.title || 'Untitled Note', maxWidth);
    titleLines.forEach((line: string) => {
        checkPageBreak(12);
        doc.text(line, margin, yPosition);
        yPosition += 12;
    });
    yPosition += 5;

    // Add metadata with better styling
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Created: ${new Date(note.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    })}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Last Modified: ${new Date(note.updatedAt).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })}`, margin, yPosition);
    yPosition += 10;

    // Add separator line
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Process content with formatting
    const formattedContent = convertHTMLToFormattedText(note.content);
    
    formattedContent.forEach((item) => {
        const { text, style } = item;
        
        if (!text.trim()) {
            yPosition += 5;
            return;
        }

        // Set style
        switch (style) {
            case 'heading':
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(50, 50, 50);
                break;
            case 'bold':
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                break;
            case 'italic':
                doc.setFontSize(11);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(0, 0, 0);
                break;
            case 'code':
                doc.setFontSize(9);
                doc.setFont('courier', 'normal');
                doc.setTextColor(0, 0, 0);
                // Add background for code
                const codeLines = doc.splitTextToSize(text, maxWidth - 10);
                const codeHeight = codeLines.length * 5 + 4;
                checkPageBreak(codeHeight);
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, yPosition - 2, maxWidth, codeHeight, 'F');
                break;
            default:
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                break;
        }

        // Split and add text
        const lines = doc.splitTextToSize(text, maxWidth - (style === 'code' ? 10 : 0));
        lines.forEach((line: string) => {
            checkPageBreak(6);
            doc.text(line, margin + (style === 'code' ? 5 : 0), yPosition);
            yPosition += style === 'heading' ? 8 : 6;
        });

        if (style === 'heading') {
            yPosition += 3;
        }
    });

    if (formattedContent.length === 0) {
        doc.setFontSize(11);
        doc.setTextColor(150, 150, 150);
        doc.text('No content', margin, yPosition);
    }

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        doc.text(
            'Learn Escape',
            margin,
            pageHeight - 10
        );
    }

    // Save the PDF
    const fileName = `${(note.title || 'note').replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(fileName);
};

export const exportAllNotesToPDF = (notes: Note[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Cover page
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('My Notes Collection', pageWidth / 2, pageHeight / 3, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(128, 128, 128);
    doc.text(`Total Notes: ${notes.length}`, pageWidth / 2, pageHeight / 2, { align: 'center' });
    doc.text(`Exported: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Learn Escape', pageWidth / 2, pageHeight - 30, { align: 'center' });

    // Add each note
    notes.forEach((note, index) => {
        doc.addPage();
        
        // Export each note using the same function
        const tempDoc = new jsPDF();
        exportNoteToPDF(note);
        
        // Add note separator
        const yPosition = margin;
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Note ${index + 1} of ${notes.length}`, margin, yPosition);
    });

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

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

    const mostRecent = notes.length > 0 
        ? notes.reduce((prev, current) => 
            new Date(current.updatedAt) > new Date(prev.updatedAt) ? current : prev
        ) 
        : null;

    // Title
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('Notes Statistics', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    doc.setFontSize(11);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 25;

    // Stats boxes
    const maxWidth = pageWidth - 2 * margin;
    const addStatBox = (label: string, value: string, color: [number, number, number]) => {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.roundedRect(margin, yPosition, maxWidth, 28, 3, 3);
        
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(label, margin + 10, yPosition + 12);
        
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(value, margin + 10, yPosition + 23);
        
        yPosition += 35;
    };

    addStatBox('Total Notes', totalNotes.toString(), [79, 70, 229]);
    addStatBox('Total Words', totalWords.toLocaleString(), [16, 185, 129]);
    addStatBox('Average Words per Note', avgWordsPerNote.toString(), [245, 158, 11]);
    addStatBox('Notes with Content', notesWithContent.toString(), [59, 130, 246]);
    addStatBox('Empty Notes', emptyNotes.toString(), [239, 68, 68]);

    yPosition += 10;

    if (mostRecent) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text('Most Recently Updated', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const titleText = `"${mostRecent.title || 'Untitled'}"`;
        doc.text(titleText, margin + 5, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Updated: ${new Date(mostRecent.updatedAt).toLocaleString()}`, margin + 5, yPosition);
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Learn Escape', pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`notes_statistics_${new Date().toISOString().split('T')[0]}.pdf`);
};
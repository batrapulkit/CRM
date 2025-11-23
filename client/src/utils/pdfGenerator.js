// Utility for generating professional PDF itineraries with company branding
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Premium Color Palette
const COLORS = {
    primary: [15, 23, 42],    // Slate-900 (Deep Navy/Black)
    secondary: [51, 65, 85],  // Slate-700 (Dark Grey)
    accent: [180, 83, 9],     // Amber-700 (Gold/Bronze)
    light: [248, 250, 252],   // Slate-50 (Off-white background)
    text: [30, 41, 59],       // Slate-800 (Main text)
    muted: [100, 116, 139],   // Slate-500 (Muted text)
    border: [226, 232, 240]   // Slate-200 (Light borders)
};

export const generateItineraryPDF = async (itinerary, companyName = 'Triponic', logoUrl = '') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- COVER PAGE ---
    // Background
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Decorative Element (Gold Line)
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(2);
    doc.line(20, 20, pageWidth - 20, 20);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(40);
    const title = itinerary.title || itinerary.destination || 'Luxury Escape';
    const titleLines = doc.splitTextToSize(title.toUpperCase(), pageWidth - 40);
    doc.text(titleLines, pageWidth / 2, pageHeight / 3, { align: 'center' });

    // Subtitle / Destination
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text((itinerary.destination || '').toUpperCase(), pageWidth / 2, (pageHeight / 3) + 20, { align: 'center' });

    // Dates & Duration
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.accent);
    const durationText = itinerary.duration ? `${itinerary.duration} Days` : '';
    const dateText = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    doc.text(`${durationText} | ${dateText}`, pageWidth / 2, (pageHeight / 3) + 30, { align: 'center' });

    // Client Name
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`Prepared for: ${itinerary.client?.full_name || 'Valued Client'}`, pageWidth / 2, pageHeight - 40, { align: 'center' });

    // Company Branding
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(companyName.toUpperCase(), pageWidth / 2, pageHeight - 30, { align: 'center' });

    // --- CONTENT PAGES ---
    doc.addPage();
    let yPos = 30;

    const details = itinerary.ai_generated_json?.detailedPlan || itinerary.ai_generated_json || {};

    // Helper: Header on each page
    const drawHeader = (title) => {
        doc.setFillColor(...COLORS.light);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.muted);
        doc.text(companyName.toUpperCase(), 20, 13);
        doc.setTextColor(...COLORS.accent);
        doc.text(title.toUpperCase(), pageWidth - 20, 13, { align: 'right' });
        doc.setDrawColor(...COLORS.border);
        doc.line(0, 20, pageWidth, 20);
    };

    drawHeader('Trip Overview');

    // Overview Section
    const summaryText = details.description || details.summary || (typeof itinerary.ai_generated_content === 'string' ? itinerary.ai_generated_content : '');
    if (summaryText) {
        doc.setFont('times', 'italic'); // Elegant font for summary
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.text);
        const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 40);
        doc.text(summaryLines, 20, yPos);
        yPos += summaryLines.length * 7 + 15;
    }

    // Logistics (Flights & Hotels) - Modern Cards
    if (details.flights || details.hotel) {
        const boxWidth = (pageWidth - 50) / 2;
        const boxHeight = 50;

        if (details.flights) {
            // Card Background
            doc.setFillColor(...COLORS.light);
            doc.roundedRect(20, yPos, boxWidth, boxHeight, 3, 3, 'F');
            doc.setDrawColor(...COLORS.border);
            doc.roundedRect(20, yPos, boxWidth, boxHeight, 3, 3, 'S');

            // Icon/Label
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...COLORS.accent);
            doc.text('FLIGHT DETAILS', 25, yPos + 10);

            // Details
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...COLORS.text);
            doc.text(details.flights.airline || 'Airline TBD', 25, yPos + 20);
            doc.setTextColor(...COLORS.muted);
            doc.setFontSize(9);
            doc.text(details.flights.departure || '', 25, yPos + 28);
            doc.text(details.flights.price || '', 25, yPos + 36);
        }

        if (details.hotel) {
            const hotelX = 20 + boxWidth + 10;
            // Card Background
            doc.setFillColor(...COLORS.light);
            doc.roundedRect(hotelX, yPos, boxWidth, boxHeight, 3, 3, 'F');
            doc.setDrawColor(...COLORS.border);
            doc.roundedRect(hotelX, yPos, boxWidth, boxHeight, 3, 3, 'S');

            // Icon/Label
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...COLORS.accent);
            doc.text('ACCOMMODATION', hotelX + 5, yPos + 10);

            // Details
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...COLORS.text);
            doc.text(details.hotel.name || 'Hotel TBD', hotelX + 5, yPos + 20);
            doc.setTextColor(...COLORS.muted);
            doc.setFontSize(9);
            doc.text(details.hotel.location || '', hotelX + 5, yPos + 28);
            doc.text(details.hotel.price || '', hotelX + 5, yPos + 36);
        }
        yPos += boxHeight + 20;
    }

    // Daily Itinerary - Timeline Style
    const days = details.dailyPlan || details.daily || [];
    if (days.length > 0) {
        if (yPos > pageHeight - 60) {
            doc.addPage();
            drawHeader('Daily Itinerary');
            yPos = 30;
        } else {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor(...COLORS.primary);
            doc.text('Day by Day', 20, yPos);
            yPos += 15;
        }

        days.forEach((day, index) => {
            // Page Break Check
            if (yPos > pageHeight - 50) {
                doc.addPage();
                drawHeader('Daily Itinerary');
                yPos = 30;
            }

            // Timeline Line
            doc.setDrawColor(...COLORS.border);
            doc.setLineWidth(0.5);
            doc.line(25, yPos + 5, 25, yPos + 40); // Vertical line

            // Day Circle
            doc.setFillColor(...COLORS.primary);
            doc.circle(25, yPos + 5, 4, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(`${day.day}`, 25, yPos + 6, { align: 'center' });

            // Day Title
            doc.setTextColor(...COLORS.primary);
            doc.setFontSize(12);
            doc.text(day.title || `Day ${day.day}`, 35, yPos + 6);

            // Description
            yPos += 12;
            if (day.description) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...COLORS.muted);
                const descLines = doc.splitTextToSize(day.description, pageWidth - 55);
                doc.text(descLines, 35, yPos);
                yPos += descLines.length * 5 + 5;
            }

            // Activities
            if (day.activities && day.activities.length > 0) {
                day.activities.forEach(act => {
                    if (yPos > pageHeight - 20) {
                        doc.addPage();
                        drawHeader('Daily Itinerary');
                        yPos = 30;
                    }
                    doc.setFillColor(...COLORS.accent);
                    doc.circle(35, yPos - 1.5, 1.5, 'F');
                    doc.setTextColor(...COLORS.text);
                    doc.setFontSize(9);
                    doc.text(act, 40, yPos);
                    yPos += 6;
                });
                yPos += 5;
            }
            yPos += 5;
        });
    }

    return doc;
};

export const downloadItineraryPDF = async (itinerary, companyName, logoUrl = '') => {
    const doc = await generateItineraryPDF(itinerary, companyName, logoUrl);
    const fileName = `${itinerary.destination || 'Itinerary'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};

export const generateInvoicePDF = async (invoice, companyName = 'Triponic', logoUrl = '') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- HEADER ---
    // Dark Header Background
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Company Name/Logo
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(companyName.toUpperCase(), 20, 30);

    // "INVOICE" Label
    doc.setFontSize(36);
    doc.setTextColor(...COLORS.accent);
    doc.text('INVOICE', pageWidth - 20, 35, { align: 'right' });

    // --- INFO SECTION ---
    let yPos = 70;

    // Bill To
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.muted);
    doc.text('BILL TO', 20, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client?.full_name || 'Valued Client', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.secondary);
    doc.text(invoice.client?.email || '', 20, yPos);

    // Invoice Details (Right Side)
    yPos = 70;
    const rightX = pageWidth - 80;
    const valueX = pageWidth - 20;

    const drawDetail = (label, value, isBold = false) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.muted);
        doc.text(label, rightX, yPos);

        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(...COLORS.primary);
        doc.text(value, valueX, yPos, { align: 'right' });
        yPos += 7;
    };

    drawDetail('Invoice Number:', invoice.invoice_number || invoice.id.slice(0, 8));
    drawDetail('Date Issued:', new Date(invoice.created_at).toLocaleDateString());
    drawDetail('Due Date:', invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon Receipt');

    // Status Badge Simulation
    yPos += 2;
    doc.setFillColor(...(invoice.status === 'paid' ? [16, 185, 129] : COLORS.accent)); // Green if paid, Gold otherwise
    doc.roundedRect(rightX, yPos - 4, 20, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.status.toUpperCase(), rightX + 2, yPos, { align: 'left' });

    // --- TABLE ---
    yPos = 110;

    // Table Header
    doc.setFillColor(...COLORS.primary);
    doc.rect(20, yPos, pageWidth - 40, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 25, yPos + 7);
    doc.text('AMOUNT', pageWidth - 25, yPos + 7, { align: 'right' });

    // Table Content
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10);

    // Row Background (Zebra striping optional, sticking to clean white for luxury)

    // Description
    const descLines = doc.splitTextToSize(invoice.notes || 'Travel Services', pageWidth - 80);
    doc.text(descLines, 25, yPos + 8);

    // Amount
    doc.text(`$${parseFloat(invoice.total).toLocaleString()}`, pageWidth - 25, yPos + 8, { align: 'right' });

    // Bottom Line
    yPos += Math.max(descLines.length * 5, 15);
    doc.setDrawColor(...COLORS.border);
    doc.line(20, yPos, pageWidth - 20, yPos);

    // --- TOTALS ---
    yPos += 10;
    const totalX = pageWidth - 80;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('TOTAL', totalX, yPos + 5);
    doc.setFontSize(16);
    doc.text(`$${parseFloat(invoice.total).toLocaleString()}`, pageWidth - 25, yPos + 5, { align: 'right' });

    // --- FOOTER ---
    const footerY = pageHeight - 30;
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.5);
    doc.line(20, footerY, pageWidth - 20, footerY);

    doc.setFontSize(10);
    doc.setFont('times', 'italic');
    doc.setTextColor(...COLORS.muted);
    doc.text('Thank you for choosing us for your travel needs.', pageWidth / 2, footerY + 10, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.border); // Very light text for ID
    doc.text(invoice.id, pageWidth / 2, pageHeight - 10, { align: 'center' });

    return doc;
};

export const downloadInvoicePDF = async (invoice, companyName, logoUrl = '') => {
    const doc = await generateInvoicePDF(invoice, companyName, logoUrl);
    const fileName = `Invoice_${invoice.invoice_number || 'Draft'}.pdf`;
    doc.save(fileName);
};

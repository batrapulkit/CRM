// Utility for generating professional PDF itineraries with company branding
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateItineraryPDF = async (itinerary, companyName = 'Triponic', logoUrl = '') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Colors
    const primaryColor = [99, 102, 241]; // Indigo-500
    const secondaryColor = [30, 41, 59]; // Slate-800
    const accentColor = [241, 245, 249]; // Slate-100
    const textColor = [51, 65, 85]; // Slate-700

    // --- SIDEBAR ---
    const sidebarWidth = 60;
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 0, sidebarWidth, pageHeight, 'F');

    // Company Name in Sidebar
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 10, 30);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Travel Itinerary', 10, 40);

    // Client Details in Sidebar
    let sideY = 80;

    const drawSideLabel = (label, value) => {
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text(label.toUpperCase(), 10, sideY);
        sideY += 5;
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        // Handle long text wrapping
        const lines = doc.splitTextToSize(value, sidebarWidth - 20);
        doc.text(lines, 10, sideY);
        sideY += lines.length * 5 + 10;
    };

    drawSideLabel('Client', itinerary.client?.full_name || 'Valued Client');
    drawSideLabel('Destination', itinerary.destination || 'N/A');
    drawSideLabel('Duration', `${itinerary.duration || 'N/A'} Days`);
    drawSideLabel('Travelers', `${itinerary.travelers || 1}`);
    drawSideLabel('Date', new Date().toLocaleDateString());

    if (itinerary.budget) {
        drawSideLabel('Est. Cost', itinerary.budget);
    }

    // --- MAIN CONTENT AREA ---
    const contentX = sidebarWidth + 15;
    const contentWidth = pageWidth - sidebarWidth - 25;
    let yPos = 30;

    const details = itinerary.ai_generated_json?.detailedPlan || itinerary.ai_generated_json || {};
    const title = itinerary.title || details.title || details.destination || 'Your Trip Plan';

    // Title
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(title, contentX, yPos);
    yPos += 15;

    // Helper for page breaks
    const checkPageBreak = (requiredSpace = 20) => {
        if (yPos + requiredSpace > pageHeight - 20) {
            doc.addPage();
            // Re-draw sidebar
            doc.setFillColor(...secondaryColor);
            doc.rect(0, 0, sidebarWidth, pageHeight, 'F');
            yPos = 30;
            return true;
        }
        return false;
    };

    // Overview
    const summaryText = details.description || details.summary || (typeof itinerary.ai_generated_content === 'string' ? itinerary.ai_generated_content : '');
    if (summaryText) {
        doc.setFontSize(12);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
        doc.text(summaryLines, contentX, yPos);
        yPos += summaryLines.length * 5 + 15;
    }

    // Logistics Grid
    if (details.flights || details.hotel) {
        checkPageBreak(50);

        const boxWidth = (contentWidth - 10) / 2;

        if (details.flights) {
            doc.setFillColor(...accentColor);
            doc.roundedRect(contentX, yPos, boxWidth, 40, 2, 2, 'F');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...primaryColor);
            doc.text('FLIGHTS', contentX + 5, yPos + 10);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textColor);
            doc.text(`${details.flights.airline}`, contentX + 5, yPos + 20);
            doc.text(`${details.flights.departure}`, contentX + 5, yPos + 25);
            doc.text(`${details.flights.price}`, contentX + 5, yPos + 30);
        }

        if (details.hotel) {
            const hotelX = contentX + boxWidth + 10;
            doc.setFillColor(...accentColor);
            doc.roundedRect(hotelX, yPos, boxWidth, 40, 2, 2, 'F');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...primaryColor);
            doc.text('HOTEL', hotelX + 5, yPos + 10);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textColor);
            doc.text(`${details.hotel.name}`, hotelX + 5, yPos + 20);
            doc.text(`${details.hotel.location}`, hotelX + 5, yPos + 25);
            doc.text(`${details.hotel.price}`, hotelX + 5, yPos + 30);
        }

        yPos += 50;
    }

    // Daily Plan
    const days = details.dailyPlan || details.daily || [];
    if (days.length > 0) {
        checkPageBreak(20);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...secondaryColor);
        doc.text('Day by Day', contentX, yPos);
        yPos += 10;

        days.forEach((day, index) => {
            checkPageBreak(40);

            // Day Number Circle
            doc.setFillColor(...primaryColor);
            doc.circle(contentX + 4, yPos + 4, 4, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`${day.day}`, contentX + 4, yPos + 5, { align: 'center' });

            // Day Title
            doc.setTextColor(...secondaryColor);
            doc.setFontSize(12);
            doc.text(day.title || `Day ${day.day}`, contentX + 15, yPos + 5);
            yPos += 12;

            // Description
            if (day.description) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...textColor);
                const descLines = doc.splitTextToSize(day.description, contentWidth - 15);
                doc.text(descLines, contentX + 15, yPos);
                yPos += descLines.length * 5 + 5;
            }

            // Activities
            if (day.activities && day.activities.length > 0) {
                day.activities.forEach(act => {
                    checkPageBreak(10);
                    doc.setFillColor(...primaryColor);
                    doc.circle(contentX + 18, yPos - 1, 1, 'F');
                    doc.setTextColor(...textColor);
                    doc.text(act, contentX + 22, yPos);
                    yPos += 5;
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

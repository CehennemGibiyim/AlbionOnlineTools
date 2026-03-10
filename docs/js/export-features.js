// export-features.js - Export & Share Functionality
// CSV/Excel export, PDF reports, share builds

const ExportModule = {
    async exportToCSV(data, filename = 'export.csv') {
        if (!data || data.length === 0) {
            ToastManager.show('Export etmek için veri bulunamadı', 'warning');
            return;
        }
        
        // Get headers from first row
        const headers = Object.keys(data[0]);
        
        // Create CSV content
        let csv = headers.join(',') + '\n';
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Handle strings with commas
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }
                return value;
            });
            csv += values.join(',') + '\n';
        });
        
        // Download
        this.downloadFile(csv, filename, 'text/csv');
        ToastManager.show(`CSV exported: ${filename}`, 'success');
    },
    
    async exportToJSON(data, filename = 'export.json') {
        if (!data) {
            ToastManager.show('Export etmek için veri bulunamadı', 'warning');
            return;
        }
        
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, filename, 'application/json');
        ToastManager.show(`JSON exported: ${filename}`, 'success');
    },
    
    async exportToPDF(htmlContent, filename = 'export.pdf') {
        // This requires a library like pdfkit or jsPDF
        // For now, provide instructions
        ToastManager.show('PDF export requires jsPDF library. Using fallback: Copy to clipboard', 'info');
        
        // Fallback: copy HTML to clipboard
        navigator.clipboard.writeText(htmlContent);
        this.downloadFile(htmlContent, filename, 'text/html');
    },
    
    exportBuildToJSON(buildData) {
        const build = {
            timestamp: new Date().toISOString(),
            content_type: buildData.contentType,
            role: buildData.role,
            difficulty: buildData.difficulty,
            gear: buildData.gear,
            skills: buildData.skills,
            notes: buildData.notes
        };
        
        this.exportToJSON(build, `build-${buildData.role}-${Date.now()}.json`);
    },
    
    exportCraftResultsToCSV(craftResults) {
        if (!craftResults || craftResults.length === 0) {
            ToastManager.show('Export etmek için craft sonuçları bulunamadı', 'warning');
            return;
        }
        
        const data = craftResults.map(result => ({
            'Kategori': result.category,
            'Fiyat': result.price,
            'Malzeme Maliyeti': result.material_cost,
            'Kâr': result.profit,
            'Marj %': result.margin,
            'Adet': result.quantity
        }));
        
        this.exportToCSV(data, `craft-results-${Date.now()}.csv`);
    },
    
    shareViaLink(data) {
        // Create shareable URL with encoded data
        const encoded = btoa(JSON.stringify(data));
        const shareUrl = `${window.location.origin}?shared=${encoded}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            ToastManager.show('Share link copied to clipboard', 'success');
        }).catch(err => {
            console.error('[Export] Share link copy failed:', err);
            ToastManager.show('Failed to copy share link', 'error');
        });
        
        return shareUrl;
    },
    
    shareBuild(buildData) {
        const buildInfo = {
            type: 'build',
            content: buildData.contentType,
            role: buildData.role,
            equipment: buildData.gear,
            timestamp: new Date().toISOString()
        };
        
        return this.shareViaLink(buildInfo);
    },
    
    generatePDFReport(title, sections) {
        // Generate HTML report
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #f59e0b; border-bottom: 2px solid #f59e0b; }
                    h2 { color: #64b5f6; margin-top: 20px; }
                    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
                    th { background: #1a1f2e; color: #f59e0b; padding: 10px; text-align: left; }
                    td { border: 1px solid #ddd; padding: 8px; }
                    .footer { margin-top: 30px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <p>Exported: ${new Date().toLocaleString('tr-TR')}</p>
        `;
        
        sections.forEach(section => {
            html += `<h2>${section.title}</h2>`;
            if (section.html) {
                html += section.html;
            }
        });
        
        html += `
                <div class="footer">
                    <p>Generated by Albion Tools</p>
                </div>
            </body>
            </html>
        `;
        
        this.downloadFile(html, `report-${Date.now()}.html`, 'text/html');
    },
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Print-friendly version
    printPage(title = 'Albion Tools Report') {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                ${document.querySelector('.generic-panel')?.innerHTML || document.body.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
};

window.ExportModule = ExportModule;

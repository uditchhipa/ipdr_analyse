/**
 * LEA IPDR/CDR Analysis Tool - Backend
 * Author: Gemini
 * Date: 2025-08-31
 * Description: A secure, local-first backend for parsing and analyzing IPDR/CDR data.
 * This server runs locally and does not persist any data to a database, ensuring confidentiality.
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Papa = require('papaparse');
const fs = require('fs');
const os = require('os');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up Multer for file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Normalizes common header variations found in ISP/Telco data files.
 * @param {string} header - The original header from the CSV file.
 * @returns {string} - The standardized header name.
 */
const normalizeHeader = (header) => {
    const h = header.toLowerCase().replace(/[\s_-]/g, ''); // Normalize to lowercase and remove spaces/underscores
    
    // MSISDN (Phone Number) Mappings
    if (['msisdn', 'callingnumber', 'callernumber', 'callingpartynumber', 'a_msisdn', 'phonenumber', 'mobileno'].includes(h)) return 'msisdn';
    if (['callednumber', 'calledpartynumber', 'b_msisdn'].includes(h)) return 'called_msisdn';

    // Device ID Mappings
    if (['imei', 'deviceimei'].includes(h)) return 'imei';
    if (['imsi'].includes(h)) return 'imsi';

    // IP Address Mappings
    if (['sourceip', 'srcip', 'userip', 'clientip', 'publicip', 'privateip'].includes(h)) return 'source_ip';
    if (['destinationip', 'destip', 'serverip'].includes(h)) return 'destination_ip';
    
    // Timestamp Mappings
    if (['starttime', 'sessionstart', 'timestamp', 'eventtimestamp', 'startdate', 'recordopeningtime'].includes(h)) return 'start_time';
    if (['endtime', 'sessionend', 'enddate'].includes(h)) return 'end_time';
    
    // Data Volume Mappings
    if (['uplinkvolume', 'dataupload', 'bytesup'].includes(h)) return 'data_up';
    if (['downlinkvolume', 'datadownload', 'bytesdown'].includes(h)) return 'data_down';

    // Location Mappings
    if (['cellid', 'location', 'celltowerid'].includes(h)) return 'cell_id';

    // Other common fields
    if (['sourceport', 'srcport'].includes(h)) return 'source_port';
    if (['destinationport', 'destport'].includes(h)) return 'destination_port';
    if (['protocol'].includes(h)) return 'protocol';
    
    return header; // Return original header if no mapping is found
};


/**
 * Main API endpoint for uploading and processing IPDR/CDR files.
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log(`[SERVER] Received a file upload request.`);
    if (!req.file) {
        console.error('[SERVER] No file uploaded.');
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        const fileContent = req.file.buffer.toString('utf8');

        console.log('[SERVER] Parsing file content...');
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: header => normalizeHeader(header),
            complete: (results) => {
                console.log(`[SERVER] Successfully parsed ${results.data.length} records.`);
                
                // Basic validation
                if (results.data.length === 0 || results.errors.length > 0) {
                     console.error('[SERVER] Parsing errors or no data found:', results.errors);
                    return res.status(400).json({ error: 'Failed to parse file or file is empty.', details: results.errors });
                }

                const processedData = results.data.map((row, index) => ({ id: index, ...row }));
                
                // Perform basic analysis for dashboard widgets
                const analysis = performAnalysis(processedData);

                res.status(200).json({
                    message: 'File processed successfully',
                    filename: req.file.originalname,
                    data: processedData,
                    meta: results.meta,
                    analysis: analysis
                });
            },
            error: (error) => {
                console.error('[SERVER] PapaParse Error:', error.message);
                res.status(500).json({ error: 'Error parsing the file.', details: error.message });
            }
        });

    } catch (error) {
        console.error('[SERVER] Internal Server Error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


/**
 * Performs summary analysis on the processed data for dashboard metrics.
 * @param {Array<Object>} data - The array of parsed data records.
 * @returns {Object} - An object containing summary statistics.
 */
function performAnalysis(data) {
    if (!data || data.length === 0) return {};

    const uniqueMSISDNs = new Set();
    const uniqueIPs = new Set();
    const uniqueIMEIs = new Set();
    let minTimestamp = Infinity;
    let maxTimestamp = -Infinity;

    data.forEach(row => {
        if (row.msisdn) uniqueMSISDNs.add(row.msisdn);
        if (row.source_ip) uniqueIPs.add(row.source_ip);
        if (row.imei) uniqueIMEIs.add(row.imei);
        
        if (row.start_time) {
            const ts = new Date(row.start_time).getTime();
            if (!isNaN(ts)) {
                if (ts < minTimestamp) minTimestamp = ts;
                if (ts > maxTimestamp) maxTimestamp = ts;
            }
        }
    });

    const dateRange = {
        from: minTimestamp === Infinity ? 'N/A' : new Date(minTimestamp).toISOString(),
        to: maxTimestamp === -Infinity ? 'N/A' : new Date(maxTimestamp).toISOString()
    };
    
    console.log('[SERVER] Analysis complete.');

    return {
        totalRecords: data.length,
        uniqueMSISDNs: uniqueMSISDNs.size,
        uniqueIPs: uniqueIPs.size,
        uniqueIMEIs: uniqueIMEIs.size,
        dateRange,
    };
}


// Start the server
app.listen(PORT, () => {
    console.log(`[SERVER] Backend is running on http://localhost:${PORT}`);
    console.log('[SERVER] Waiting for file uploads...');
});

LEA IPDR Analysis Tool
1. Overview
This is a full-stack, standalone web application designed for Law Enforcement Agencies (LEAs) to analyze Internet Protocol Detail Records (IPDR). The tool allows investigators to upload raw data files from Internet Service Providers (ISPs), and then search, filter, and visualize the data to uncover connections and patterns.

The entire application is designed to run locally on an investigator's machine to ensure data security and confidentiality. No data ever leaves the local computer.

Key Features:

Universal File Upload: Upload IPDR data in common formats like CSV or TXT.

Intelligent Parsing: The backend automatically detects and normalizes data from different ISP formats.

Interactive Data Table: View, sort, and paginate through millions of records.

Advanced Search & Filtering: Instantly filter data by IP address, phone number (MSISDN), IMEI, date/time range, and more.

Timeline Visualization: Reconstruct a chronological sequence of a suspect's communications.

Link Analysis: Automatically generate a visual graph to show connections between different entities (IPs, numbers, devices).

Secure & Local: The entire system runs on your machine. Data is processed in memory and is not stored in a database, ensuring maximum security.

!(https://www.google.com/search?q=https://placehold.co/1200x600/2d3748/ffffff%3Ftext%3DIPDR%2520Analysis%2520Dashboard)

2. Technology Stack
Backend: Node.js, Express.js

Frontend: React.js, Tailwind CSS

Data Parsing: PapaParse

Visualizations: A custom SVG-based engine for simplicity and security.

3. Prerequisites
Before you begin, ensure you have the following installed on your system:

Node.js and npm: You can download them from https://nodejs.org/

4. Setup and Installation
You will need to run the backend server and the frontend application in two separate terminal windows.

A. Backend Setup
Save the Backend Code: Create a new folder on your computer named ipdr-tool-backend. Inside this folder, save the backend code as backend.js.

Open a Terminal: Open a new terminal or command prompt window.

Navigate to the Backend Directory:

cd path/to/ipdr-tool-backend

Initialize npm and Install Dependencies: Run the following commands one by one.

npm init -y
npm install express cors multer papaparse

Start the Backend Server:

node backend.js

You should see a message in the terminal: [SERVER] Backend is running on http://localhost:5000. Keep this terminal window open.

B. Frontend Setup
Save the Frontend Code: In a completely separate folder, save the frontend file as index.html.

Open in Browser: Simply open the index.html file in a modern web browser like Google Chrome, Firefox, or Microsoft Edge. You can do this by double-clicking the file or right-clicking and selecting "Open with...".

5. How to Use the Tool
Launch: Ensure your backend server is running (Step A.5). Open the index.html file in your browser.

Upload Data:

Drag and drop your IPDR file (e.g., in .csv format) onto the designated upload area.

Alternatively, click the upload area to open a file selection dialog.

Analyze Data:

Once uploaded, the data will be processed and displayed in the main table.

Use the search bar and filter panel on the left to query the data. You can filter by date, IP, phone number, etc.

As you filter, the dashboard widgets and visualizations will update in real-time.

Interpret Visualizations:

Timeline: This chart shows the frequency of communication over time. You can drag to select a specific time range to zoom in.

Link Analysis Graph: This graph shows the relationships between entities. Click and drag the nodes (circles) to rearrange the graph for better clarity.

6. Supported Data Formats
The tool is designed to be flexible. For best results, your CSV file should contain headers. The parser will automatically try to map common header names.

Example Supported Headers:

MSISDN, Calling Number, caller_msisdn

IMEI, device_imei

Source IP, src_ip, user_ip

Destination IP, dest_ip

Start Time, session_start, Timestamp

End Time, session_end

Cell ID, location

If the parser cannot find matches, it will display the raw column headers.
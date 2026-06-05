# Temple Parking System

A modern QR-enabled parking management system with a responsive web interface and backend API.

## 🎯 Features

### Core Functionality
- **User Management** - Register users with QR code generation
- **Vehicle Management** - Register vehicles with multiple types (Two, Three, Four-wheeler)
- **Parking Slots** - Create and manage parking slots
- **QR Code Scanning** - Entry and exit scanning for automated parking management
- **Parking Records** - Track vehicle entry/exit with timestamps
- **Reports** - User visit history and slot usage analytics

### UI/UX Features
- 🎨 **Modern Bootstrap 5 Design** - Professional, clean interface
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- 🎭 **Tabbed Navigation** - Organized features into logical sections
- ✅ **Form Validation** - Real-time input validation with error feedback
- 🔔 **Toast Notifications** - User-friendly success/error messages
- 📊 **Smart Result Display** - JSON cards and formatted data tables
- ⚡ **Smooth Animations** - Transition effects and hover states

## 📁 Project Structure

```
temple-parking/
├── frontend/
│   └── index.html           # Modern responsive UI with Bootstrap 5
├── backend/
│   ├── server.js            # Express.js API server
│   ├── package.json         # Node dependencies
│   └── package-lock.json
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL database with parking system schema
- Modern web browser

### Setup Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure database connection in `server.js`:
   ```javascript
   const pool = mysql.createPool({
     host: 'localhost',
     user: 'root',
     password: 'your_password',
     database: 'parkingsysdb',
     // ... other config
   });
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   Server runs on `http://localhost:4000`

### Setup Frontend

Simply open `frontend/index.html` in your web browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Then visit: http://localhost:8000/index.html
```

## 📡 API Endpoints

### Users
- `POST /api/users` - Create new user with QR code

### Vehicles
- `POST /api/vehicles` - Register vehicle for a user

### Parking Slots
- `POST /api/slots` - Create parking slot

### QR Codes
- `GET /api/qrcode/:type/:id` - Generate QR code (type: user/vehicle)

### Scanning
- `POST /api/scan/entry` - Process entry scan
- `POST /api/scan/exit` - Process exit scan
- `GET /api/parking/current` - List currently parked vehicles

### Reports
- `GET /api/visits/:user_id` - User parking history with date filtering
- `GET /api/slot-usage/:slot_number` - Slot usage analytics

## 🎨 UI Components

### Navigation Tabs
1. **Users Tab** - Register new users
2. **Vehicles Tab** - Register vehicles for users
3. **Parking Slots Tab** - Create parking slots
4. **QR Codes Tab** - Generate and display QR codes
5. **Scanning Tab** - Process entry/exit scans and view current parked vehicles
6. **Reports Tab** - Generate user visits and slot usage reports

### Design Elements
- **Color Scheme**: Professional blues, greens, and reds
- **Typography**: Modern Segoe UI font family
- **Spacing**: Consistent padding and margins
- **Effects**: Gradients, shadows, smooth transitions
- **Responsive Grid**: Adapts to all screen sizes

## 🔧 Database Schema (Expected)

### Tables Required
- `users` - User information
- `vehicles` - Vehicle details with user reference
- `parking_slots` - Parking slot definitions
- `parking_records` - Entry/exit records
- `stored procedures` - sp_allocate_slot, sp_process_exit

## 📱 Mobile Responsiveness

The interface automatically adapts to different screen sizes:
- **Desktop (1200px+)** - Full-width layout with side-by-side forms
- **Tablet (768px-1199px)** - Adjusted spacing and responsive grid
- **Mobile (<768px)** - Stacked single-column layout

## ✨ Recent Improvements

### UI Modernization
- ✅ Bootstrap 5 framework integration
- ✅ Custom professional CSS styling
- ✅ Responsive grid-based layout
- ✅ Enhanced form validation
- ✅ Toast notification system
- ✅ Improved result displays (cards and tables)
- ✅ Professional navbar with branding

### Backend Enhancements
- ✅ User parking history endpoint with date filtering
- ✅ Slot usage analytics endpoint
- ✅ Better error handling and responses

## 🧪 Testing

### Test the System
1. Create a user and note the user_id
2. Create a vehicle with that user_id
3. Create a parking slot
4. Generate QR codes for testing
5. Simulate entry scan with vehicle QR
6. View current parked vehicles
7. Simulate exit scan
8. Generate reports to verify data

## 🔐 Security Notes

- Database credentials are currently hardcoded (update for production)
- Add authentication/authorization for API endpoints
- Implement CORS restrictions
- Validate all user inputs server-side
- Use environment variables for sensitive config

## 🛣️ Future Enhancements

- User authentication and login
- Payment integration
- SMS/Email notifications
- Admin dashboard with real-time analytics
- Batch vehicle registration
- Parking fee calculation system
- Vehicle search and history
- Receipt generation

## 📄 License

ISC License

## 👥 Contributors

- Shreyas Damle

## 📞 Support

For issues or questions, please contact the development team or check the project documentation.

---

**Last Updated**: June 2026  
**Version**: 2.0 (Modern UI with responsive design)

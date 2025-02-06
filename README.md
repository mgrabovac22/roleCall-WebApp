# Role Call Web Application

## Overview
Role Call is a web application designed for managing cinematography staff. It utilizes **TMDB services** and provides **CRUD functionality** for actors and cinematography personnel. The application supports **authentication, reCAPTCHA, TOTP, JWT, session management**, and more.

## Features
- **Actor & Staff Management**: CRUD operations for actors and cinematography staff.
- **Authentication & Security**:
  - User authentication (login, logout, session management)
  - Two-Factor Authentication (TOTP)
  - JWT-based authentication
  - reCAPTCHA integration
- **Database**:
  - Uses **SQLite** for lightweight and efficient data storage.
- **API & Documentation**:
  - Well-structured API with **DAO and REST layers**.
  - Includes detailed documentation for usage and setup.

## Versions
Role Call is available in two versions:

1. **Node.js & TypeScript Version**:
   - Backend: Node.js with TypeScript.
   - Frontend: HTML, JavaScript, and basic templating.
   - Uses DAO and RESTful APIs.

2. **Angular Version**:
   - Backend: Same as the Node.js version.
   - Frontend: Built with **Angular** for a dynamic and interactive UI.

## Installation & Setup
### Prerequisites
- **Node.js** (v16+ recommended)
- **SQLite**
- **Angular CLI** (for the Angular version)

### Steps
1. **Clone the repository**:
   ```sh
   git clone https://github.com/yourusername/roleCall-WebApp.git
   cd roleCall-WebApp
   ```

2. **Install dependencies**:
   ```sh
   npm run pripremi
   ```

3. **Build and compile the application**:
   ```sh
   npm run start
   ```

4. **Run the application**:
   - For the Node.js version:
     ```sh
     npm run kreni
     ```
   - For the Angular version:
     ```sh
     cd ../angular
     ng serve
     ```

## Usage
- Access the application in the browser at `http://localhost:12222` (Node.js version) or `http://localhost:4200` (Angular version).
- Follow the provided documentation for API usage and user management.

## Contribution
Feel free to contribute by submitting issues, feature requests, or pull requests.

## License
This project is licensed under the MIT License.

---
Developed by **[Marin Grabovac]** 🚀

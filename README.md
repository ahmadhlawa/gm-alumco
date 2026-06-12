# Aluminum & Glass Premium Website

A modernized, multilingual-ready frontend project for a premium aluminum and glass company.

## Future Backend & Security Roadmap

While the current application consists of a robust frontend and mock API layer, the following aspects need to be implemented for the final full-stack deployment:

- **Real Admin Authentication:** Replace the placeholder admin layout with an authentic entry portal.
- **Strong Password Hashing:** Use Argon2id or bcrypt for credential storage.
- **JWT & Cookies:** Implement JWT access tokens alongside refresh tokens, storing them securely in `httpOnly` secure cookies.
- **Role-Based Access Control:** Protect APIs and dashboard views based on authorized user roles.
- **Rate Limiting:** Protect login endpoints and form submission routes against brute force attacks.
- **Input Validation:** Use robust DTOs (e.g., Zod or similar validation) for strict API input validation.
- **Secure File Upload Validation:** Restrict file extensions, validate mime-types, and limit payload size on the server side correctly for AWS S3 or Cloudinary.
- **Audit Logs:** Maintain immutable audit trails for admin activities (project deletion, profile updates, etc.).
- **CORS Configuration:** Enforce proper Cross-Origin Resource Sharing rules securely.
- **Database Architecture:** Plan for secure database schema migrations, and scheduled data backups using PostgreSQL with an ORM like Drizzle or Prisma.
- **HTTPS Deployment:** Strict TLS routing with safe headers.
- **Admin Provisioning:** Admin accounts must be created merely through secure seed scripts or terminal commands, disabling public registration APIs to avoid rogue admin creation.

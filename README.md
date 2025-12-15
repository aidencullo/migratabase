# Migratabase

A Next.js application for searching and managing migrant information.

## Features

- **Simple, slick UI**: White background with spinning globe icon and centered search box
- **Animated text**: Shows "where is [name]?" with animated typing/deleting effect
- **MySQL Database**: Relational database with tables for migrants, names, and relationships
- **Search functionality**: Search migrants by name, country, or other attributes

## Database Schema

- **migrants**: Main table with migrant information (name, country of origin, DOB, age, current location, status)
- **migrant_names**: Normalized names table for multiple name variations
- **migrant_relationships**: Relationships between migrants (family, friends, etc.)

## Getting Started

### Prerequisites

- Bun (or Node.js)
- MySQL server running locally

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aidencullo/migratabase.git
cd migratabase
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=migratabase
```

4. Initialize the database:
   - Start your MySQL server
   - Create the database manually or use the init API endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/init
   ```

5. Seed the database with Aiden Cullo:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

6. Run the development server:
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

- `GET /api/migrants` - Get all migrants
- `POST /api/migrants` - Create a new migrant
- `GET /api/migrants/search?q=query` - Search migrants
- `POST /api/init` - Initialize database schema
- `POST /api/seed` - Seed database with Aiden Cullo

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- MySQL2
- Bun

## License

MIT

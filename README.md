# Steve The Bearded Dragon

Rub my Belly

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing Neon Database

To test your Neon database connection:

1. Create a `.env.local` file in the root directory:

   ```bash
   DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
   ```

   Get your connection string from [Neon Console](https://console.neon.tech/).

2. Run the test script:
   ```bash
   npm run test:neon
   # or
   yarn test:neon
   # or
   pnpm test:neon
   ```

The test will:

- Check database connection
- List all tables in the public schema
- Get the current database timestamp

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

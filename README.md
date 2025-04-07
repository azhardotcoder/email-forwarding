# Email Forwarding Portal

A secure email forwarding system built with Next.js and Supabase.

## Features

- Email forwarding with filters
- User authentication
- Admin dashboard
- Secure email access

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/email-forwarding.git
cd email-forwarding
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials
   - Add your Gmail configuration

4. Set up Gmail:
   - Enable 2-Step Verification
   - Generate App Password
   - Add to environment variables

5. Run the development server:
```bash
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `GMAIL_USER`: Your Gmail address
- `GMAIL_APP_PASSWORD`: Your Gmail app password
- `NEXT_PUBLIC_SITE_URL`: Your site URL (default: http://localhost:3000)

## Security

- Never commit `.env` or `.env.local` files
- Keep your Gmail app password secure
- Regularly rotate your credentials
- Use environment variables for all sensitive data

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request

## License

MIT License

# Frontend

## Run

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## EmailJS setup (Contact page)

The contact page can send email directly through EmailJS.

1. Create an EmailJS template with variables: `from_name`, `reply_to`, and `message`.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Fill EmailJS values:

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_CONTACT_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_WISHLIST_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

4. Restart `npm run dev` after editing `.env`.

## Admin

- Log in with the seeded backend admin account: `admin@example.com` / `admin12345`
- Open `http://localhost:5173/admin`
- The dashboard manages products, categories, and users

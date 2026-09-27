# Linking the backend (Supabase)

The site works right now without a backend: bookings are saved in the browser
and the owner area opens with the PIN. That means a booking a customer makes on
their phone never reaches you. Linking Supabase fixes that, and gives you a real
owner login.

You need a free Supabase account. It takes about ten minutes.

## 1. Create the project

1. Go to supabase.com and sign up.
2. New project. Name it `fresco-hairvolution`, pick the region closest to Lagos
   (Europe West or South Africa), and set a database password you will keep.
3. Wait for it to finish building.

## 2. Create the tables

1. In the project, open **SQL Editor** → **New query**.
2. In the site's preview, open the setup page: add `#/setup` to the end of the
   preview address. It shows the whole script as text, with a **Download as a
   file** button and a **Copy the whole script** button. Either download the
   file and open it, or press copy.
3. Paste into the Supabase editor and press **Run**.
4. You should see "Success. No rows returned". That created the tables, the
   security rules, and the two functions customers use to look up their own
   bookings.

If Supabase shows an error, it starts with `ERROR:` and a code such as `42601`.
Send that message over and the script can be fixed to match.

## 3. Create your owner login

1. Open **Authentication** → **Users** → **Add user** → **Create new user**.
2. Use your own email and a strong password. Tick "Auto confirm user".
3. That email and password is what opens `/admin` from now on. There is no
   sign-up screen on the site, so nobody else can create an account.

## 4. Connect the project

1. Open **Project Settings** → **API**. The direct link is
   https://supabase.com/dashboard/project/_/settings/api (pick your project from
   the list if it opens the wrong one). In the sidebar, Project Settings is the
   last item, under the gear icon at the bottom.
2. Copy **Project URL** (looks like `https://abcdefgh.supabase.co`) and the
   **anon public** key (a long string starting with `eyJ`).
3. Go back to the setup page (`#/setup`) and paste both into the **Your project**
   box at the top, then press **Connect**. It checks the project, saves it in
   this browser and reloads. The page then shows "Connected to …".

The anon key is meant to be public; the security rules in step 2 are what
protect the data. Never paste the `service_role` key.

If you would rather keep the keys in the project instead of the browser, create
a file called `.env` in the project root with these two lines and restart:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 5. First load

On the first load after connecting, the site shows your seeded price list
locally. The first time you sign in at `/admin`, it copies your price list,
zones, reviews and settings up to the database — only when the server tables
are empty, so it can never overwrite real data later.

## 6. Putting the site on a domain

The site is a static build (a `dist` folder) with hash routing, so any static
host works and no server rewrite rules are needed.

1. Push the project to GitHub, then import the repo on Vercel, Netlify or
   Cloudflare Pages. Build command `npm run build`, output directory `dist`.
2. Add the two `VITE_SUPABASE_*` values from `.env` to the host's environment
   variables, or the live site will run without the backend.
3. Buy the domain (Whogohost, Qservers or DomainKing take naira; Namecheap or
   Cloudflare for a `.com`), then add it in the host's dashboard and point the
   nameservers or A/CNAME records at the host. HTTPS is automatic.

## What changes once it is linked

- A booking a customer sends is written to the database and appears in your
  owner area, on any device, signed in with your email and password.
- Customers can look up and cancel their own bookings with the phone number
  they booked with, and only those.
- Nobody but your signed-in account can read booking requests, so one customer
  can never see another customer's address or phone number.
- The PIN box is replaced by the email and password login.

## If you skip this

Everything still works, but bookings stay on the device they were made on, and
the PIN is the only thing keeping customers out of `/admin`. That is fine for
showing the site to people; it is not fine for taking real bookings.

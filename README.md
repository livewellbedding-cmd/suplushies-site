# suplushies-site

suplushies.com, deployed by Netlify from this repo.

- `public/` is the built static site (a Next.js static export; there is no source project, so edits are made in the built files). Netlify publishes this folder as-is.
- `public/order/` is the wholesale order page. Each wholesale customer gets a private link from Su Desk (`/order/?k=…`) with their pricing and product picks.
- `netlify/functions/orders.mjs` serves `/api/orders`: it saves each submitted order and returns a store's past orders for the "Your past orders" / Reorder section of its order link. Orders are kept in Netlify Blobs (store `wholesale-orders`).
- Order submissions also go to the Netlify form `wholesale-order`, which emails Su; Su Desk reads those emails.

Deploying: commit to `main` and Netlify publishes. Batch website changes per the update queue rather than pushing each small edit.

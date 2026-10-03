# KrishiSetu Connect

Design and build a production-grade, highly intuitive Farmer-to-Market distributed platform called "KrishiSetu". 

Theme & UI Design System:

- Clean agricultural modern aesthetic: rich forest green primary (#1b4332 / #2d6a4f), soft mint accents (#d8f3dc), crisp neutral slate/white backgrounds, and warm amber accents for price highlights.

- Modern typography, rounded cards (rounded-2xl), subtle drop shadows, smooth tab transitions, and Lucide React icons.

- Fully responsive layout with a top navigation bar displaying the platform branding, role switcher badge, and live server connection status indicator.

Backend API Integration:

- The app communicates directly with a local FastAPI backend running at "http://localhost:8000".

- Implement resilient API handling: show skeletons during loading, toast notifications on error/success, and provide fallback realistic mock data (e.g., Nashik Red Onion, Pune Tomatoes, Ratnagiri Alphonso) if the local backend is unreachable.

Navigation & Views:

Create a prominent segmented view switcher in the header with three views:

1. Farmer Dashboard:

- Header metric cards: Active Listings, Total Stock Listed (kg), Estimated Revenue (₹), Average Selling Price.

- "List New Harvest" Card/Form:

  - Fields: Crop Name (text), Category (dropdown: Vegetables, Fruits, Grains, Pulses), Quantity in kg (number), Price per kg in ₹ (number), Farmer Name (text), and Location (text).

  - Submit button that fires a POST request to "http://localhost:8000/api/produce" with payload { crop_name, category, quantity_kg, price_per_kg, farmer_name, location }.

  - Success triggers a toast notification and re-fetches the listings.

- Active Listings Table: Fetches live data via GET from "http://localhost:8000/api/produce". Columns for Crop, Category badge, Stock Available, Price/kg, Location, Status ("Available"), and quick actions.

2. Buyer Marketplace:

- Top filter bar: Instant search input by crop/farmer name, category pill filters ("All", "Vegetables", "Fruits", "Grains"), and a sort dropdown (Price: Low to High, Quantity).

- Produce Grid: Beautiful product cards displaying crop icon/avatar, crop name, category tag, location badge, price per kg in prominent bold text, available quantity progress indicator, and farmer details.

- "Buy Direct" Modal: Clicking a card opens a checkout sheet to enter desired quantity, showing real-time total price calculation (kg × price_per_kg), zero middleman commission badge, and a "Place Order" confirmation button.

3. Mandi Price Analytics (DBMS Insights):

- Data-driven analytics tab fulfilling Objective 6:

- Fetches summary data via GET from "http://localhost:8000/api/analytics/summary".

- Clean bar or area chart (using Recharts) comparing average prices across categories.

- Middleman Savings comparison card showing Farmer Earning vs. Traditional Mandi Intermediary margins.

Ensure all API calls use native fetch, handle CORS seamlessly, and keep code modular and performant.


## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

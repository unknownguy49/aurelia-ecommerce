# AURELIA

AURELIA is a full-stack jewellery e-commerce demonstration website built with React, Firebase, Vercel Serverless Functions, and Razorpay.

## Live Demo

https://aurelia-jewellers.vercel.app

## Features

- User registration and login with Firebase Authentication
- Product catalogue powered by Firestore
- Product details and stock information
- Persistent user-specific shopping cart
- Quantity and cart management
- Checkout with shipping details
- Razorpay payment integration
- Server-side order creation and payment verification
- Stock updates after successful payment
- Order success flow
- Responsive desktop and mobile UI

## Tech Stack

- React + Vite
- React Router
- Firebase Authentication
- Cloud Firestore
- Firebase Admin SDK
- Vercel Serverless Functions
- Razorpay
- CSS

## Architecture

```text
React + Vite
     |
     +-- Firebase Authentication
     |
     +-- Firestore
     |
     v
Vercel Serverless API
     |
     v
Razorpay
```

Sensitive payment operations are handled by the backend. Razorpay secret credentials are never exposed to the frontend.

## Main Collections

```text
users/{uid}
products/{productId}
carts/{uid}
orders/{orderId}
```

## Payment Flow

```text
Product
  -> Cart
  -> Checkout
  -> Create Razorpay Order
  -> Razorpay Checkout
  -> Backend Verification
  -> Order marked PAID
  -> Stock updated
  -> Cart cleared
```

The backend validates the authenticated user, product availability, stock, price, payment signature, payment amount, currency, and capture status before finalizing an order.

## Project Structure

```text
api/
  _lib/
  payments/

src/
  components/
  context/
  pages/
  routes/
  services/

public/
  home/
  products/
```

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Required environment variables include Firebase Admin credentials and Razorpay credentials. Actual secrets must not be committed to the repository.

## Demo Payment

A temporary `TEST-001` product priced at ₹1 is retained for demonstrating the payment workflow.

For production use, the temporary demonstration configuration should be replaced with the client's own Razorpay merchant account and production credentials.

## Deployment

The application is deployed on Vercel.

Production URL:

https://aurelia-jewellers.vercel.app

## Current Scope

The current project demonstrates the complete customer e-commerce flow from authentication and product browsing through cart management, checkout, payment verification, order creation, and stock management.
# 🎪 The Blockbuster Arena

A collection of interactive movie trivia games built with React, TypeScript, and Tailwind CSS.

## 🎮 Available Games

- **🎭 Cast Guessing Game** (`/cast-game`) - Guess movies based on their cast members
- **🎬 Grid Categories Game** (`/grid-game`) - Group movies into categories in a grid puzzle

## 🌐 Navigation

The application now features a proper multi-page structure with:
- **Navigation Bar**: Fixed navigation with links to all games and home page
- **Responsive Design**: Works on desktop, tablet, and mobile devices  
- **Individual URLs**: Each game has its own unique URL for easy bookmarking and sharing

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Navigation.tsx      # Main navigation component
│   ├── Layout.tsx         # Consistent layout wrapper
│   ├── GameCard.tsx       # Game preview cards
│   ├── CastGame.tsx       # Original cast game component
│   ├── GridGame.tsx       # Original grid game component
│   └── ui/               # Shared UI components
├── pages/
│   ├── Index.tsx         # Home page with game selection
│   ├── CastGamePage.tsx  # Cast guessing game page
│   ├── GridGamePage.tsx  # Grid categories game page
│   └── NotFound.tsx      # 404 error page
└── App.tsx              # Router configuration
```

## Project info

**URL**: https://lovable.dev/projects/df1eb4cd-52f4-45ff-96c4-06e14116dd54

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/df1eb4cd-52f4-45ff-96c4-06e14116dd54) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/df1eb4cd-52f4-45ff-96c4-06e14116dd54) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

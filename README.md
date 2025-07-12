# Skeleton App

A React Native + Expo skeleton application template with authentication, data management, and customizable UI components.

## Features

- 🔐 **Authentication**: Supabase Auth with anonymous and email authentication
- 🎨 **Customizable UI**: Environment variable-based color theming
- 📱 **Multi-platform**: iOS, Android, and Web support
- 🌍 **Internationalization**: Japanese and English language support
- 🗄️ **Database**: Supabase with PostgreSQL and Row Level Security
- 🎯 **TypeScript**: Full TypeScript support with strict mode
- 🧪 **Testing**: Jest and React Native Testing Library setup
- 🎭 **State Management**: React Context + AsyncStorage and React Query
- 🎨 **Styling**: NativeWind (Tailwind CSS for React Native)

## Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Context + AsyncStorage (global state) + Tanstack React Query (server state)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Forms**: React Hook Form + Zod
- **Testing**: Jest + React Native Testing Library
- **Navigation**: Expo Router (file-based routing)

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd skeleton-app
npm install
```

### 2. Environment Setup

Copy the environment template and configure your values:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Application Information
APP_NAME=Your App Name
APP_FULL_NAME=Your Full App Name
APP_BUNDLE_ID=com.yourcompany.yourapp

# Color Scheme
EXPO_PUBLIC_PRIMARY_COLOR=#3B82F6
EXPO_PUBLIC_PRIMARY_DARK=#2563EB
EXPO_PUBLIC_PRIMARY_LIGHT=#60A5FA
EXPO_PUBLIC_SECONDARY_COLOR=#8B5CF6
EXPO_PUBLIC_SECONDARY_LIGHT=#A78BFA

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Update App Configuration

Edit `app.json` and replace placeholder values:

```json
{
  "expo": {
    "name": "{{APP_NAME}}",
    "slug": "skeleton-app",
    "bundleIdentifier": "{{APP_BUNDLE_ID}}",
    "extra": {
      "fullAppName": "{{APP_FULL_NAME}}"
    }
  }
}
```

### 4. Database Setup

Set up your Supabase database:

```bash
# Start local Supabase (optional)
npx supabase start

# Push database schema
npm run db:push
```

### 5. Development

```bash
# Start the development server
npm start

# For specific platforms
npm run ios
npm run android
npm run web
```

## Project Structure

```
skeleton-app/
├── app/                    # Expo Router pages
│   ├── (app)/             # Authenticated routes
│   │   ├── (tabs)/        # Main tab navigation
│   │   │   ├── index.tsx  # Home dashboard
│   │   │   ├── record.tsx # Form example
│   │   │   ├── history.tsx# List example
│   │   │   ├── ranking.tsx# Ranking example
│   │   │   └── settings.tsx# Settings
│   │   └── ...           # Other authenticated pages
│   ├── sign-in.tsx       # Authentication
│   ├── sign-up.tsx       # Registration
│   └── welcome.tsx       # Welcome screen
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components
│   └── ...              # Feature-specific components
├── lib/                 # Business logic
│   ├── api/             # Supabase API client
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom hooks
│   ├── locales/         # i18n translations
│   ├── services/        # Business logic services
│   └── types/           # TypeScript type definitions
├── supabase/            # Database migrations and config
└── assets/              # Static assets
```

## Customization

### Colors

Customize your app's color scheme by setting environment variables:

```env
EXPO_PUBLIC_PRIMARY_COLOR=#your-primary-color
EXPO_PUBLIC_PRIMARY_DARK=#your-primary-dark
EXPO_PUBLIC_PRIMARY_LIGHT=#your-primary-light
EXPO_PUBLIC_SECONDARY_COLOR=#your-secondary-color
EXPO_PUBLIC_SECONDARY_LIGHT=#your-secondary-light
```

### App Information

Update your app information:

```env
APP_NAME=Your App Name
APP_FULL_NAME=Your Full App Name
APP_BUNDLE_ID=com.yourcompany.yourapp
```

### Localization

- Edit `lib/locales/ja.json` for Japanese translations
- Edit `lib/locales/en.json` for English translations
- Add more language files as needed

## Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run on web browser

# Testing
npm run lint           # Run ESLint
npm test               # Run all tests
npm run test:unit      # Run unit tests only
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report

# Database
npm run db:push        # Apply migrations
npm run db:pull        # Pull schema changes
npm run db:migration   # Create new migration
npm run db:remote-reset # Reset remote database (dev only)
```

## Sample Screens

This skeleton includes 4 main tab screens with sample functionality:

1. **Home**: Dashboard with statistics and recent activities
2. **Record**: Form input example with validation
3. **History**: List display with filtering capabilities
4. **Ranking**: Ranking display with charts and leaderboard
5. **Settings**: App settings and user preferences

## Authentication Flow

- **Anonymous Authentication**: Users can start using the app immediately
- **Email Upgrade**: Anonymous users can upgrade to email accounts
- **Session Management**: Handled by SessionContext and UserContext

## Database Schema

The skeleton includes basic tables for:

- Users and profiles
- Groups (teams/organizations)
- Tasks and task logs
- User preferences

## Testing

Run tests with:

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

## Deployment

### Building for Production

```bash
# Build for different platforms
eas build --platform ios
eas build --platform android
eas build --platform web
```

### Environment Variables

Make sure to set all required environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

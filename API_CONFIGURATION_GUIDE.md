# Dynamic API Configuration Guide

This guide explains how to use the new dynamic API configuration system that automatically switches between development and production endpoints.

## Overview

Instead of manually commenting/uncommenting API URLs, the application now uses environment-based configuration that automatically selects the correct endpoints based on the build configuration.

## Environment Files

### Development Environment (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  pdfApiUrl: 'http://localhost:3000/v1/convert/pdf'
};
```

### Production Environment (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.picassopdf.com/api',
  pdfApiUrl: 'https://api.picassopdf.com/v1/convert/pdf'
};
```

## Available Scripts

### Development Mode (uses localhost:3000)
```bash
npm start          # Default development mode
npm run start:dev  # Explicit development mode
```

### Production Mode (uses api.picassopdf.com)
```bash
npm run start:prod # Production mode with live API
```

### Build Scripts
```bash
npm run build:dev  # Build for development
npm run build:prod # Build for production
npm run build      # Default production build
```

## How It Works

1. **Environment Configuration**: The `environment.ts` files define the API endpoints for each environment
2. **API Config Service**: A centralized service (`ApiConfigService`) provides access to the current environment's configuration
3. **Service Integration**: All service files now use `ApiConfigService` instead of hardcoded URLs
4. **Automatic Switching**: Angular automatically loads the correct environment file based on the build configuration

## Updated Services

The following services have been updated to use the new configuration:

- `ApiService` - Main API service
- `AuthService` - Authentication service
- `ActionsService` - Actions service
- `apiKeysService` - API keys service
- `PdfVaultService` - PDF vault service
- `constants.ts` - API endpoint constants

## Benefits

1. **No More Manual URL Switching**: No need to comment/uncomment URLs
2. **Environment Consistency**: All services use the same environment configuration
3. **Easy Deployment**: Different builds for different environments
4. **Centralized Configuration**: All API URLs managed in one place
5. **Type Safety**: Environment configuration is type-safe

## Usage Examples

### Starting Development Server
```bash
# Uses localhost:3000
npm start
```

### Starting Production Server (for testing)
```bash
# Uses api.picassopdf.com
npm run start:prod
```

### Building for Production
```bash
# Creates production build with live API endpoints
npm run build:prod
```

## Migration Notes

- All hardcoded API URLs have been removed from service files
- Services now inject `ApiConfigService` to get the current API configuration
- The `constants.ts` file now imports from environment configuration
- No breaking changes to existing functionality

## Troubleshooting

If you encounter issues:

1. **Check Environment Files**: Ensure both `environment.ts` and `environment.prod.ts` exist
2. **Verify Scripts**: Make sure you're using the correct npm script for your intended environment
3. **Clear Cache**: Run `npm run build:dev` or `npm run build:prod` to ensure proper environment loading
4. **Check Console**: Look for any environment-related errors in the browser console

## Future Enhancements

- Add more environment-specific configurations (staging, testing, etc.)
- Implement runtime environment detection
- Add environment validation
- Create environment-specific feature flags

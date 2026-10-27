# GrowthPrint Frontend - Development Guide

## Prerequisites

**Required Software:**
- Node.js 18 or later
- npm or yarn package manager
- Git for version control
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code recommended)

**Optional Software:**
- Docker (for backend integration testing)

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd GrowthPrint-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

**Copy `.env.example` to `.env.local`:**
```bash
cp .env.example .env.local
```

**Edit `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8090
NEXT_PUBLIC_USE_MOCK_API=true
```

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_USE_MOCK_API` - Enable mock mode (true/false)

### 4. Verify Setup

Run the development server:
```bash
npm run dev
```

Expected output:
- Application starts on http://localhost:3000
- No build errors
- No console errors

## Development Commands

### Run

**Development server:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
```

**Start production server:**
```bash
npm start
```

### Test

**Run all tests:**
```bash
npm test
```

**Run tests with coverage:**
```bash
npm run test:coverage
```

### Lint

**TypeScript linting:**
```bash
npm run lint
```

**Format code (if Prettier configured):**
```bash
npm run format
```

### Clean

**Clean build artifacts:**
```bash
npm run clean
```

## VS Code Configuration

### Recommended Extensions

**Essential:**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer

**Optional:**
- React/Redux Snippets
- Import Cost
- GitLens

### Settings

**.vscode/settings.json:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Verification Steps

### 1. Verify Application Startup

```bash
npm run dev
```

**Expected:**
- Application starts without errors
- Port 3000 accessible
- No console errors

### 2. Verify Public Website

Open browser: http://localhost:3000

**Expected:**
- Public website loads
- All sections render
- Inquiry form works

### 3. Verify Admin Portal

Open browser: http://localhost:3000/admin

**Expected:**
- Admin login page loads
- Can navigate to admin dashboard (with mock data)

### 4. Verify Client Portal

Open browser: http://localhost:3000/portal

**Expected:**
- Client login page loads
- Can navigate to client dashboard (with mock data)

### 5. Verify TypeScript Compilation

```bash
npm run lint
```

**Expected:**
- No type errors
- Compilation succeeds

## Troubleshooting

### Application Won't Start

**Issue:** Application fails to start

**Solutions:**
1. Check Node.js version (18+ required)
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check port 3000 is not in use
4. Check environment variables in `.env.local`
5. Check console logs for specific error

### Dependencies Fail to Install

**Issue:** npm install fails

**Solutions:**
1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules and package-lock.json
3. Reinstall: `npm install`
4. Try with yarn instead: `yarn install`

### TypeScript Errors

**Issue:** TypeScript compilation fails

**Solutions:**
1. Check tsconfig.json configuration
2. Verify all imports resolve correctly
3. Check for missing type definitions
4. Run `npm run lint` for details

### API Calls Fail

**Issue:** API calls return errors

**Solutions:**
1. Check NEXT_PUBLIC_API_URL is correct
2. Verify backend is running
3. Check CORS configuration on backend
4. Check network tab in browser for error details
5. If using mock mode, check mock data

### Mock Mode Issues

**Issue:** Mock mode not working

**Solutions:**
1. Check NEXT_PUBLIC_USE_MOCK_API=true
2. Check mock data in store/initialData.ts
3. Check Redux store configuration
4. Check console for Redux errors

## Recommended Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow feature-based architecture
- Write unit tests for new code
- Update API documentation
- Update relevant documentation files

### 3. Run Tests

```bash
npm test
```

### 4. Build and Verify

```bash
npm run build
npm run lint
```

### 5. Commit Changes

```bash
git add .
git commit -m "Add feature: description"
```

### 6. Push Branch

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

- Describe changes
- Link to issue or milestone
- Request code review

### 8. Merge After Approval

- Ensure CI/CD passes
- Address review comments
- Merge to main branch

## Debugging

### React DevTools

**Install:**
- React Developer Tools browser extension

**Use:**
- Inspect component tree
- View props and state
- Profile performance
- Debug Redux state

### Redux DevTools

**Install:**
- Redux DevTools browser extension

**Use:**
- Inspect Redux state
- View action history
- Time travel debugging
- Dispatch test actions

### Browser Console

**Debugging Tips:**
- Use console.log for debugging
- Use console.error for errors
- Use console.warn for warnings
- Remove debug statements before commit

### Network Tab

**Debugging API Calls:**
- Inspect request headers
- Inspect request payload
- Inspect response
- Check response status
- Check response time

## Performance Profiling

### Lighthouse

**Run Lighthouse:**
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit
4. Review results

**Target Scores:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### React Profiler

**Use React Profiler:**
- Record component render times
- Identify expensive components
- Optimize re-renders

### Bundle Analysis

**Analyze Bundle Size:**
```bash
ANALYZE=true npm run build
```

**Review:**
- Identify large bundles
- Optimize code splitting
- Remove unused dependencies

## Additional Resources

**Next.js Documentation:**
- https://nextjs.org/docs

**React Documentation:**
- https://react.dev

**Redux Toolkit Documentation:**
- https://redux-toolkit.js.org/

**Tailwind CSS Documentation:**
- https://tailwindcss.com/docs

**TypeScript Documentation:**
- https://www.typescriptlang.org/docs/

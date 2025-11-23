# CLAUDE.md - AI Assistant Guide for Cloud-kit

## Project Overview

**Cloud-kit** (also known as `vercel-deploy` in package.json) is a TypeScript-based deployment service that enables cloning Git repositories and uploading their contents to Cloudflare R2 (S3-compatible object storage). This service acts as a simplified deployment pipeline similar to Vercel's deployment workflow.

### Purpose
- Accept repository URLs via POST requests
- Clone repositories locally
- Upload all files to Cloudflare R2 storage
- Return unique deployment IDs for each deployment

### Current Status
- Project: In active development
- Version: 1.0.0
- Main Branch: `main` (not explicitly configured)
- Development Branch: `claude/claude-md-miblf5owxgwb5rfo-01UmmfkrZxqCC9wB1wR2oo5N`

## Codebase Structure

```
Cloud-kit/
├── src/                    # Source TypeScript files
│   ├── index.ts           # Main Express server and /deploy endpoint
│   ├── aws.ts             # S3/R2 upload functionality
│   ├── file.ts            # File system utilities
│   └── utils.ts           # ID generation utilities
├── output/                # Cloned repositories (gitignored)
├── dist/                  # Compiled JavaScript output (gitignored)
├── node_modules/          # Dependencies (gitignored)
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── .gitignore            # Git ignore rules
```

## Technology Stack

### Core Dependencies
- **Runtime**: Node.js with TypeScript
- **Web Framework**: Express 5.1.0
- **Cloud Storage**: AWS SDK S3 Client 3.933.0 (for Cloudflare R2)
- **Git Operations**: simple-git 3.28.0
- **CORS**: cors 2.8.5
- **Redis**: redis 5.8.3 (installed but not yet implemented)

### Development Configuration
- **TypeScript Target**: ES2016
- **Module System**: CommonJS
- **Strict Mode**: Enabled
- **Source Directory**: `./src`
- **Output Directory**: `./dist`
- **Root Directory**: `./src`

## Key Components

### 1. Entry Point (`src/index.ts`)

**Responsibilities**:
- Express server setup on port 3000
- CORS configuration
- POST `/deploy` endpoint handler

**Flow**:
1. Receives `repourl` in request body
2. Generates unique 8-character deployment ID
3. Clones repository to `output/{id}` directory
4. Retrieves all files recursively
5. Uploads each file to R2 with relative paths
6. Returns deployment ID

**Known Issues**:
- Contains hardcoded Cloudflare credentials (SECURITY RISK - see Security section)
- Uses `forEach` with async functions (won't await properly)
- No error handling for clone or upload failures
- Path construction may be fragile across platforms

### 2. S3/R2 Upload Service (`src/aws.ts`)

**Responsibilities**:
- Manages S3Client configuration
- Handles file uploads to Cloudflare R2

**Key Function**: `uploadFile(fileName: string, localFilePath: string)`
- `fileName`: The S3 key (relative path in bucket)
- `localFilePath`: Absolute path to local file
- Uses bucket name: "vercel"
- Logs upload response to console

**Issues**:
- Hardcoded credentials (CRITICAL SECURITY ISSUE)
- S3Client instantiated on every upload (inefficient)
- No error handling or retry logic
- No progress tracking for large files

### 3. File System Utilities (`src/file.ts`)

**Key Function**: `getAllFiles(directoryPath: string): string[]`
- Recursively traverses directory tree
- Returns array of absolute file paths
- Skips no directories (includes `.git`, `node_modules`, etc.)

**Issues**:
- No filtering for unwanted directories
- Could upload sensitive files (.env, .git, etc.)
- Synchronous operations may block for large repositories

### 4. Utilities (`src/utils.ts`)

**Key Function**: `generate(): string`
- Generates random 8-character alphanumeric IDs
- Character set: `123456789qwertyuiopasdfghjklzxcvbnm`
- No collision detection

**Potential Issues**:
- Low entropy for production use
- No UUID or timestamp-based generation
- Collision probability increases with scale

## Development Workflow

### Building the Project
```bash
# Install dependencies
npm install

# Compile TypeScript (manual - no npm script configured)
tsc

# Run compiled JavaScript
node dist/index.js
```

### Testing
- No test framework configured
- No tests written yet
- Test script exists but only returns error message

### Git Workflow
1. Work on feature branches prefixed with `claude/`
2. Branch naming: `claude/claude-md-{session-id}`
3. Commit changes with descriptive messages
4. Push to origin with `-u` flag: `git push -u origin <branch-name>`

### Recent Commits
```
8acc362 - added upload service using cloudflare R2
b861296 - init vercel-deployment project and added directry path logic
```

## Code Conventions

### TypeScript
- **Strict mode**: Always enabled
- **Imports**: Use ES6 imports, not require()
- **Types**: Prefer explicit types over implicit any
- **Async/Await**: Preferred over promises and callbacks
- **Error Handling**: Currently minimal - needs improvement

### File Organization
- One main concern per file
- Export functions that will be used elsewhere
- Keep related functionality together

### Naming Conventions
- **Files**: lowercase with hyphens (e.g., `file.ts`, `aws.ts`)
- **Functions**: camelCase (e.g., `getAllFiles`, `uploadFile`)
- **Constants**: Currently not following UPPER_SNAKE_CASE convention
- **Variables**: camelCase

### Code Style
- Use `const` and `let`, avoid `var`
- Template literals preferred for string interpolation
- Functional array methods (`forEach`, `map`, `filter`)
- Path operations use `path.join()` for cross-platform compatibility

## Security Considerations

### CRITICAL: Hardcoded Credentials

**Location**: `src/index.ts:1-3` and `src/aws.ts:17-18`

Both files contain hardcoded Cloudflare R2 credentials:
- Account ID: `1520335557fb6dfdd2ea44e0822aa001`
- Secret Key: `be8e8947d01c617b2a025a3812c80883248151ac42cbcb7f2d9394d5b4501dfa`
- Endpoint: `https://e14b54367b12d91bc13b2d6d3e4dc94b.r2.cloudflarestorage.com`

**IMMEDIATE ACTIONS REQUIRED**:
1. Rotate these credentials immediately
2. Move to environment variables
3. Add `.env` to `.gitignore`
4. Use `process.env.VARIABLE_NAME` pattern
5. Consider using a secrets manager for production

**Recommended .env structure**:
```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_SECRET_KEY=your_secret_key
CLOUDFLARE_ENDPOINT=your_endpoint
CLOUDFLARE_BUCKET_NAME=vercel
PORT=3000
```

### Other Security Concerns

1. **No Input Validation**
   - Repository URLs not validated
   - Could clone malicious repositories
   - No size limits on repositories

2. **File Upload Vulnerabilities**
   - Uploads ALL files including `.env`, `.git`, `node_modules`
   - No content-type validation
   - No file size limits

3. **Path Traversal Risk**
   - Path manipulation in `file.slice(__dirname.length+1)`
   - Should use `path.relative()` instead

4. **No Authentication**
   - `/deploy` endpoint is publicly accessible
   - No API keys or rate limiting
   - Vulnerable to abuse

## Common Tasks for AI Assistants

### Adding New Features

When implementing new features:
1. Read existing code first to understand patterns
2. Follow the established file structure
3. Add types for all new functions
4. Consider error handling from the start
5. Update this CLAUDE.md if architecture changes

### Fixing Bugs

Bug fix workflow:
1. Identify the issue location using grep/file search
2. Read surrounding code for context
3. Write fix that matches existing code style
4. Test manually (no automated tests yet)
5. Commit with clear description

### Refactoring

When refactoring:
1. Don't change functionality and structure simultaneously
2. Preserve existing public APIs unless explicitly requested
3. Update types if function signatures change
4. Keep commits focused on single refactorings
5. Document breaking changes

### Security Improvements

Priority security tasks:
1. **IMMEDIATE**: Move credentials to environment variables
2. Add input validation to `/deploy` endpoint
3. Implement file filtering in `getAllFiles()`
4. Add authentication middleware
5. Implement rate limiting
6. Add request size limits

## Important Implementation Notes

### Async/Await Issues

**Current Problem** (`src/index.ts:26-33`):
```typescript
files.forEach(async file => {
    await uploadFile(file.slice(__dirname.length+1), file)
})
```

This does NOT wait for uploads to complete. The response is sent before uploads finish.

**Correct Implementation**:
```typescript
await Promise.all(
    files.map(file => uploadFile(file.slice(__dirname.length+1), file))
)
```

### Path Handling

Current path slicing is fragile. Better approach:
```typescript
const relativePath = path.relative(
    path.join(__dirname, 'output', id),
    file
)
```

### File Filtering

Recommended implementation for `getAllFiles()`:
```typescript
const IGNORED_PATTERNS = [
    /node_modules/,
    /\.git/,
    /\.env/,
    /dist/,
    /\.DS_Store/
]

// Filter before adding to response
if (!IGNORED_PATTERNS.some(pattern => pattern.test(fullFilePath))) {
    response.push(fullFilePath)
}
```

## Dependencies Not Yet Used

The following dependencies are installed but not implemented:
- **redis**: Likely intended for caching or queue management
- Possible future uses:
  - Queue deployment jobs
  - Cache deployment status
  - Rate limiting
  - Session management

## Testing Strategy (To Be Implemented)

Recommended test structure:
```
tests/
├── unit/
│   ├── file.test.ts       # Test getAllFiles()
│   ├── utils.test.ts      # Test generate()
│   └── aws.test.ts        # Test uploadFile() with mocks
├── integration/
│   └── deploy.test.ts     # Test full /deploy flow
└── fixtures/
    └── test-repo/         # Sample repository for testing
```

## Environment Setup for Development

Required environment variables:
```bash
# Required
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_SECRET_KEY=
CLOUDFLARE_ENDPOINT=
CLOUDFLARE_BUCKET_NAME=vercel

# Optional
PORT=3000
NODE_ENV=development
```

## Future Improvements Roadmap

Based on code analysis, consider these improvements:

1. **Error Handling**
   - Add try-catch blocks
   - Implement proper error responses
   - Log errors with context

2. **Validation**
   - Validate repository URLs
   - Check repository size before cloning
   - Validate file types before uploading

3. **Performance**
   - Implement parallel uploads with concurrency limits
   - Add progress tracking
   - Cleanup old deployments from `output/`

4. **Observability**
   - Add structured logging
   - Implement deployment status tracking
   - Add metrics and monitoring

5. **Redis Integration**
   - Queue deployments
   - Track deployment status
   - Implement caching layer

6. **Build Process**
   - Add npm scripts for build, dev, start
   - Consider using ts-node for development
   - Add build artifacts to .gitignore

## AI Assistant Guidelines

### When Modifying Code

1. **Always read files before editing** - Never propose changes to unread code
2. **Preserve existing patterns** - Match the current code style
3. **Consider security** - Check for vulnerabilities in changes
4. **Update types** - Maintain TypeScript strict mode compliance
5. **Test manually** - Run the server and test endpoints after changes

### When Adding Dependencies

1. Use `npm install <package>` for runtime dependencies
2. Use `npm install -D <package>` for dev dependencies
3. Update this CLAUDE.md if the dependency changes architecture
4. Consider bundle size impact

### When Committing

1. Stage only related changes together
2. Write clear, descriptive commit messages
3. Follow format: `<verb> <what> <where>` (e.g., "add input validation to deploy endpoint")
4. Don't commit sensitive data or credentials
5. Push to the designated claude/* branch

### When Stuck

1. Ask for clarification rather than guessing
2. Read related code for context
3. Check git history for similar changes
4. Propose multiple solutions when uncertain

## Quick Reference

### Start Development Server
```bash
npm install
tsc
node dist/index.js
```

### Deploy Endpoint
```bash
curl -X POST http://localhost:3000/deploy \
  -H "Content-Type: application/json" \
  -d '{"repourl": "https://github.com/user/repo.git"}'
```

### Common File Paths
- Main server: `src/index.ts:42`
- Deploy handler: `src/index.ts:19`
- Upload function: `src/aws.ts:13`
- File traversal: `src/file.ts:5`
- ID generator: `src/utils.ts:3`

---

**Last Updated**: 2025-11-23
**Project Version**: 1.0.0
**Maintained By**: AI Assistant (Claude)

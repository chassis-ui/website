# Development Guide

This guide provides detailed information for developers working on the Chassis Documentation project.

## Development Environment Setup

### System Requirements

- **macOS, Linux, or Windows** with WSL2
- **Node.js** 18.0.0 or higher (recommend using nvm)
- **npm** 8.0.0 or higher
- **Git** with SSH keys configured for GitHub access

### Initial Setup

1. **Configure Git SSH Keys** (required for submodules):
   ```bash
   # Generate SSH key if you don't have one
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add to SSH agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   
   # Add public key to GitHub account
   cat ~/.ssh/id_ed25519.pub
   ```

2. **Clone with submodules**:
   ```bash
   git clone --recursive git@github.com:chassis-ui/docs.git
   cd chassis-docs
   ```

3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

4. **Verify setup**:
   ```bash
   npm run sync:all
   npm run build
   ```

## Development Workflow

### Daily Development

1. **Start development server**:
   ```bash
   npm run dev
   ```
   This starts the Astro dev server at `http://localhost:4321`

2. **Watch for changes**: The dev server automatically reloads when you modify:
   - Pages in `apps/website/src/pages/`
   - Components in `apps/website/src/components/`
   - Styles in `apps/website/src/styles/`

3. **Test changes**: Always test your changes by building:
   ```bash
   npm run build:website
   ```

### Working with Submodules

The project uses four submodules in the `vendor/` directory:

```bash
# Check submodule status
git submodule status

# Update all submodules to latest
npm run sync:all

# Update specific submodule
git submodule update --remote vendor/tokens

# Work on a submodule
cd vendor/tokens
git checkout main
# Make changes...
git commit -am "Update tokens"
git push

# Return to main project and update reference
cd ../..
git add vendor/tokens
git commit -m "Update tokens submodule"
```

### File Structure Deep Dive

```
chassis-docs/
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       ├── deploy.yml         # Production deployment
│       ├── lighthouse.yml     # Performance testing
│       └── sync-submodules.yml # Automated submodule updates
├── apps/
│   └── website/               # Main Astro documentation site
│       ├── astro.config.mjs   # Astro configuration
│       ├── package.json       # Website dependencies
│       ├── src/
│       │   ├── components/    # Reusable Astro components
│       │   │   ├── Header.astro
│       │   │   ├── Footer.astro
│       │   │   └── ...
│       │   ├── layouts/       # Page layouts
│       │   │   └── Layout.astro
│       │   ├── pages/         # Route pages (file-based routing)
│       │   │   ├── index.astro
│       │   │   ├── simple.astro
│       │   │   └── ...
│       │   └── styles/        # SCSS stylesheets
│       │       └── main.scss
│       └── public/            # Static assets
├── examples/                  # Integration examples
│   ├── react-app/            # React + Vite example
│   └── vanilla-html/         # Pure HTML/CSS example
├── scripts/                   # Build and deployment scripts
│   ├── sync-all.js           # Submodule synchronization
│   └── deploy.js             # Deployment coordination
├── tools/                     # Build tools
│   └── build.js              # Main build orchestrator
└── vendor/                   # Git submodules (auto-managed)
    ├── assets/               # chassis-assets submodule
    ├── css/                  # chassis-css submodule
    ├── figma/                # chassis-figma submodule
    └── tokens/               # chassis-tokens submodule
```

## Adding New Content

### Documentation Pages

1. **Create new page**:
   ```bash
   # Create apps/website/src/pages/getting-started.astro
   ```

2. **Use the standard layout**:
   ```astro
   ---
   import Layout from '../layouts/Layout.astro';
   ---
   
   <Layout title="Getting Started - Chassis Design System">
     <section class="py-xlarge">
       <div class="container">
         <h1>Getting Started</h1>
         <!-- Your content here -->
       </div>
     </section>
   </Layout>
   ```

### Components

1. **Create reusable component**:
   ```astro
   ---
   // apps/website/src/components/CodeBlock.astro
   export interface Props {
     code: string;
     language?: string;
   }
   
   const { code, language = 'html' } = Astro.props;
   ---
   
   <div class="code-block">
     <pre><code class={`language-${language}`}>{code}</code></pre>
   </div>
   ```

2. **Use in pages**:
   ```astro
   ---
   import CodeBlock from '../components/CodeBlock.astro';
   ---
   
   <CodeBlock 
     language="html" 
     code={`<button class="button primary">Click me</button>`} 
   />
   ```

### Examples

1. **Create new example directory**:
   ```bash
   mkdir examples/vue-app
   cd examples/vue-app
   ```

2. **Add package.json**:
   ```json
   {
     "name": "chassis-vue-example",
     "scripts": {
       "dev": "vite",
       "build": "vite build"
     }
   }
   ```

3. **Register in tools/build.js**:
   ```javascript
   // Add to examples array
   const examples = ['react-app', 'vanilla-html', 'vue-app'];
   ```

## Testing

### Manual Testing

1. **Development testing**:
   ```bash
   npm run dev
   # Test in browser at http://localhost:4321
   ```

2. **Production build testing**:
   ```bash
   npm run build
   npm run preview
   # Test production build at http://localhost:4321
   ```

3. **Example testing**:
   ```bash
   npm run build:examples
   # Check examples/*/dist/ directories
   ```

### Automated Testing

1. **Lighthouse CI**: Runs automatically on PR
   ```bash
   # Run locally (requires server running)
   npx lhci autorun
   ```

2. **Build validation**:
   ```bash
   npm run validate
   ```

## Deployment

### Development Deployment

Push to any branch triggers a preview deployment on Vercel.

### Production Deployment

1. **Merge to main**: Triggers production deployment
2. **Manual deployment**:
   ```bash
   npm run deploy
   ```

### Deployment Process

1. **Submodule sync**: Updates all vendor dependencies
2. **Dependency installation**: Fresh npm install
3. **Build**: Generates static site and examples
4. **Deploy**: Uploads to Vercel
5. **Validation**: Runs Lighthouse CI

## Performance

### Optimization Techniques

1. **Astro optimizations**:
   - Static generation for better performance
   - Automatic code splitting
   - Image optimization (when configured)

2. **CSS optimizations**:
   - Chassis CSS framework provides optimized styles
   - SCSS compilation with compression
   - Critical CSS inlining

3. **JavaScript optimizations**:
   - Minimal JavaScript (Astro philosophy)
   - Component hydration only when needed

### Monitoring

- **Lighthouse CI**: Automated performance testing
- **Bundle analysis**: Check build output sizes
- **Core Web Vitals**: Monitor real user metrics

## Troubleshooting

### Common Development Issues

1. **Submodule authentication errors**:
   ```bash
   # Ensure SSH keys are configured
   ssh -T git@github.com
   
   # Convert HTTPS URLs to SSH
   git config --global url."git@github.com:".insteadOf "https://github.com/"
   ```

2. **Node version conflicts**:
   ```bash
   # Use nvm to manage Node versions
   nvm install 18
   nvm use 18
   ```

3. **Port conflicts**:
   ```bash
   # Change Astro dev server port
   npx astro dev --port 3000
   ```

4. **Build cache issues**:
   ```bash
   # Clear all caches
   rm -rf apps/website/.astro apps/website/dist
   rm -rf examples/*/dist examples/*/node_modules
   npm run clean
   npm install
   ```

### Debug Mode

Enable verbose logging:

```bash
# Debug build process
DEBUG=* npm run build

# Debug Astro
npm run dev -- --verbose
```

## Git Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Individual feature branches
- **hotfix/***: Critical fixes

### Commit Convention

```bash
# Feature
git commit -m "feat: add component documentation page"

# Bug fix
git commit -m "fix: resolve mobile navigation issue"

# Documentation
git commit -m "docs: update development guide"

# Submodule update
git commit -m "chore: update submodules"
```

### Pull Request Process

1. **Create feature branch**:
   ```bash
   git checkout -b feature/component-docs
   ```

2. **Make changes and test**:
   ```bash
   npm run build
   npm run validate
   ```

3. **Commit and push**:
   ```bash
   git commit -am "feat: add component documentation"
   git push origin feature/component-docs
   ```

4. **Create PR**: Use GitHub interface

5. **Review process**: 
   - Code review
   - Automated tests pass
   - Lighthouse CI passes
   - Manual testing

## IDE Setup

### VS Code Extensions

Recommended extensions for optimal development experience:

```json
{
  "recommendations": [
    "astro-build.astro-vscode",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-css-language-features"
  ]
}
```

### Settings

Create `.vscode/settings.json`:

```json
{
  "astro.typescript.allowArbitraryAttributes": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.associations": {
    "*.astro": "astro"
  }
}
```

<a name="readme-top"></a>

<h1 align="center">Personal Website & Developer Portfolio</h1>

<div align="center">
  <p>- my multilingual portfolio showcasing some of my development expertise -</p>
  <h5 align="center">&nbsp;</h5>
</div>

## About The Project

This is my personal portfolio website, i am a fullstack developer specializing in Vue.js and Nuxt.js. The portfolio showcases professional experience, projects, skills, certifications, and testimonials.

Built with **Nuxt 4** and modern web technologies, the portfolio features:

- **Multilingual support** (German & English)
- **Dark/Light mode** with system preference detection
- **Interactive data visualizations** using Chart.js
- **Responsive design** optimized for all devices
- **SEO optimized** with proper meta tags and structured data
- **Performance focused** with lazy loading and optimized images
- **Accessibility compliant** following WCAG standards
- **Content management** via Strapi CMS integration

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Tech Stack

This project leverages modern technologies for optimal performance and developer experience:

**Framework & Frontend:**

- [Nuxt 4](https://nuxt.com) - The Intuitive Web Framework
- [Vue 3](https://vuejs.org) - The Progressive JavaScript Framework (Composition API)
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [@nuxt/ui](https://ui.nuxt.com/) - Fully styled and customizable components

**Styling & Animation:**

- [Sass/SCSS](https://sass-lang.com/) - CSS with superpowers
- [Nuxt AOS](https://github.com/egidiusmengelberg/nuxt-aos) - Animate On Scroll library

**Data Visualization:**

- [Chart.js](https://www.chartjs.org/) - Simple yet flexible JavaScript charting
- [Vue-ChartJS](https://vue-chartjs.org/) - Vue.js wrapper for Chart.js

**Content & SEO:**

- [Strapi Blocks Renderer](https://github.com/strapi-community/strapi-blocks-renderer) - Rich text content rendering
- [@nuxtjs/seo](https://nuxtseo.com/) - Complete SEO solution for Nuxt
- [Nuxt i18n Micro](https://github.com/s00d/nuxt-i18n-micro) - Lightweight internationalization

**Utilities & Integrations:**

- [@vueuse/nuxt](https://vueuse.org/) - Collection of essential Vue composition utilities
- [@nuxt/image](https://image.nuxt.com/) - Optimized images for Nuxt
- [PDFEasy](https://github.com/denissteinhorst/pdfeasy) - PDF generation utilities
- [DOMPurify](https://github.com/cure53/DOMPurify) - DOM-only XSS sanitizer

**Development & Quality:**

- [@nuxt/eslint](https://eslint.nuxt.com/) - ESLint configuration for Nuxt

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Prerequisites

This project requires the following to be installed:

- [Node.js](https://nodejs.org/en/) (v22.18.0 - as specified in package.json engines)
- [NPM](https://www.npmjs.com/) (v10.9.3 - as specified in package.json engines)
- Optional: [NVM](https://github.com/nvm-sh/nvm) for Node.js version management

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Installation

<details>
<summary>Click here to expand the Installation Guide</summary>
<br>
<ul>
<li>
  <b>1) Install or Check correct Node version</b>

```bash
# If using NVM
nvm install 22.18.0
# or if already installed
nvm use 22.18.0
```

```bash
# Verify versions
node -v && npm -v
```

</li>
<br>
<li>
  <b>2) Clone the Repository</b>

```bash
git clone https://github.com/denissteinhorst/steinhorst-dev.git
```

</li>
<br>
<li>
  <b>3) Switch into project Directory and install Dependencies</b>

```bash
cd steinhorst-dev
npm install
npm run postinstall
```

</li>
</ul>
</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

<details>
<summary>Click here to expand the Usage Guide</summary>

<ul>
<br>
<li>
  <b>Development Commands</b>
  <br><br>

| Command               | Description                                 | Port / Location |
| --------------------- | ------------------------------------------- | --------------- |
| `npm run dev`         | Starts the Nuxt development server with HMR | :3000           |
| `npm run build`       | Build the application for production        | .output         |
| `npm run generate`    | Generate a static version of the site       | .output         |
| `npm run preview`     | Preview the production build locally        | :3000           |
| `npm run postinstall` | Prepare Nuxt for development                | -               |

</li>
<br>
<li>
  <b>Environment Configuration</b>
  <br><br>

The application uses Nuxt's runtime configuration for environment variables:

| Variable               | Description                        | Default                        |
| ---------------------- | ---------------------------------- | ------------------------------ |
| `NUXT_API_TOKEN`       | Strapi CMS API token (server-only) | -                              |
| `NUXT_PUBLIC_API_BASE` | Base URL for the CMS               | https://cms.steinhorst.dev     |
| `NUXT_PUBLIC_API_URL`  | API endpoint URL                   | https://cms.steinhorst.dev/api |

</li>
<br>
<li>
  <b>Content Management</b>
  <br><br>

The portfolio content is managed through a Strapi CMS instance. The application fetches:

- Personal information and bio
- Professional experience entries
- Project portfolio items
- Skills and certifications
- Testimonials and references
- Localized content for German/English

</li>
</ul>
</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Project Structure

<details>
<summary>Click here to expand the Project Structure</summary>

```text
steinhorst-dev/
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot coding guidelines and conventions
├── app/                        # Nuxt 4 application source code directory
│   ├── app.config.ts           # App-level configuration for UI colors and themes
│   ├── assets/                 # Processed assets (SCSS, images used by Vite)
│   │   └── scss/
│   │       ├── app.scss        # Global SCSS styles and imports
│   │       └── theme.scss      # Theme-specific styling variables and mixins
│   ├── components/             # Reusable Vue 3 components (PascalCase SFCs)
│   │   ├── A11yHelper.vue      # Accessibility helper component for screen readers
│   │   ├── AiSummary.vue       # AI-generated content summary display component
│   │   ├── BaseCard.vue        # Base card component with consistent styling
│   │   ├── ColorSelector.vue   # Theme color selection component
│   │   ├── JobSearchBadge.vue  # Job availability status badge component
│   │   ├── LanguageSelector.vue # Language switching component for i18n
│   │   ├── LeaveNotification.vue # User leave intent notification component
│   │   ├── ProjectFilter.vue   # Project filtering and search functionality
│   │   ├── ScrollCompanion.vue # Scroll-based navigation and progress indicator
│   │   ├── SectionWrapper.vue  # Common wrapper component for page sections
│   │   ├── SkillQuickFilter.vue # Quick filtering component for skills display
│   │   ├── cards/              # Specialized card components for different content types
│   │   │   ├── BarchartCard.vue        # Bar chart visualization card component
│   │   │   ├── CertificateCard.vue     # Professional certificate display card
│   │   │   ├── ContactCard.vue         # Contact information display card
│   │   │   ├── ExperienceCard.vue      # Work experience timeline card
│   │   │   ├── PolarchartCard.vue      # Polar chart visualization card component
│   │   │   ├── ProjectCard.vue         # Individual project showcase card
│   │   │   ├── ProjectCardLast.vue     # Special "see more" project card variant
│   │   │   ├── SkillCard.vue           # Individual skill display card
│   │   │   ├── TestimonialCardCompact.vue # Compact testimonial display card
│   │   │   └── TestimonialCardLarge.vue   # Full-featured testimonial display card
│   │   └── sections/           # Page section components for layout organization
│   │       ├── CertificateSection.vue  # Professional certifications section
│   │       ├── ContactSection.vue      # Contact form and information section
│   │       ├── ExperienceSection.vue   # Work experience timeline section
│   │       ├── FaqSection.vue          # Frequently asked questions section
│   │       ├── FooterSection.vue       # Site footer with links and info
│   │       ├── HeroSection.vue         # Main landing page hero section
│   │       ├── NavigationSection.vue   # Site navigation header component
│   │       ├── PersonalitySection.vue  # Personal traits and characteristics section
│   │       ├── ProjectSection.vue      # Project portfolio showcase section
│   │       ├── SkillSection.vue        # Technical skills display section
│   │       └── TestimonialSection.vue  # Client testimonials and references section
│   ├── composables/            # Vue 3 Composition API reusable logic
│   │   ├── useFocusHelper.ts   # Focus management and accessibility utilities
│   │   ├── useIdGenerator.ts   # Unique ID generation for components
│   │   ├── usePdfEasy.ts       # PDF generation and download functionality
│   │   ├── usePdfEasyFormatter.ts # PDF content formatting utilities
│   │   ├── useScrollHashes.ts  # URL hash-based scroll navigation
│   │   ├── useSkillSearch.ts   # Skill filtering and search functionality
│   │   └── useStrapi.ts        # Strapi CMS data fetching and caching
│   ├── layouts/                # Page layout components
│   │   └── default.vue         # Default layout template for all pages
│   ├── pages/                  # File-based routing pages (auto-generated routes)
│   │   ├── imprint.vue         # Legal imprint and privacy policy page
│   │   └── index.vue           # Main portfolio homepage
│   ├── plugins/                # Nuxt plugins for client-side functionality
│   │   ├── chartjs.client.ts   # Chart.js setup and configuration plugin
│   │   ├── dompurify.client.ts # HTML sanitization plugin for security
│   │   └── pdfeasy.client.ts   # PDF generation library initialization
│   └── types/                  # Shared TypeScript type definitions
│       ├── pdfeasy.d.ts        # Type definitions for PDF generation library
│       └── types.ts            # Application-wide TypeScript interfaces
├── locales/                    # Internationalization (i18n) translation files
│   ├── de.json                 # German language translations
│   └── en.json                 # English language translations
│
├── public/                     # Static files served as-is by the web server
│   ├── _robots.txt             # Search engine crawling instructions
│   ├── favicon.ico             # Website favicon for browser tabs
│   ├── logo-magnify.svg        # SVG logo file for branding
│   └── images/
│       ├── hero_image.webp     # Optimized hero section background image
│       └── og_image.png        # Open Graph social media preview image
├── server/                     # Server-side code (Nitro / h3)
│   ├── tsconfig.json           # TypeScript configuration for server code
│   ├── api/
│   │   └── request.ts          # Server API endpoint for handling requests
│   └── assets/
│       └── _locales/           # Server-side locale assets (legacy structure)
├── .dockerignore                # Docker build context ignore rules
├── .env                         # Environment variables for local development
├── .gitignore                   # Git ignore rules for version control
├── .nvmrc                       # Node.js version specification for NVM
├── .prettierrc                  # Prettier code formatting configuration
├── Dockerfile                   # Docker container configuration for deployment
├── README.md                    # Project documentation and setup guide
├── eslint.config.mjs           # ESLint configuration for code quality and style
├── nuxt.config.ts              # Main Nuxt 4 framework configuration file
├── package.json                # NPM dependencies and project scripts
├── package-lock.json           # NPM dependency lock file for consistent installs
├── tsconfig.json               # TypeScript compiler configuration
```

</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

### 🌐 Multilingual Support

- German (default) and English languages
- Automatic locale detection
- SEO-optimized language switching
- Localized content from CMS

### 🎨 Modern UI/UX

- Clean, professional design
- Smooth animations and transitions
- Interactive data visualizations
- Responsive layout for all devices

### ⚡ Performance Optimized

- Server-side rendering (SSR)
- Optimized images with @nuxt/image
- Lazy loading for better performance
- Minimal JavaScript bundle size
- Google Lighthouse optimized: for maximum performance scores
- WCAG 2.2 accessibility compliance: validated with [AccessibleWeb.com](https://accessibleweb.com/) (Best Practices 102 Tests / Extended AAA-Rating) as well as [WAVE from WebAim.org](https://wave.webaim.org/)

### 📊 Interactive Charts

- Skill level visualizations
- Experience timeline charts
- Technology stack representations
- Responsive chart components

### 🔍 SEO & Analytics

- Complete meta tag optimization
- Open Graph and Twitter Card support
- Structured data markup
- Analytics integration ready

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Deployment

The application is designed to be deployed as a static site or on Node.js servers:

**Static Deployment:**

```bash
npm run generate
# Upload .output/public folder to your hosting service
```

**Server Deployment:**

```bash
npm run build
# Deploy .output folder to your Node.js hosting
```

**Recommended Hosting:**

- [Vercel](https://vercel.com/) - Optimized for Nuxt applications
- [Netlify](https://netlify.com/) - Great for static site generation
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform/) - Full-stack hosting

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

This is a personal portfolio project, but suggestions and improvements are welcome! If you have ideas for enhancements:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Denis Steinhorst - [contact@steinhorst.dev](mailto:contact@steinhorst.dev)

Website: [steinhorst.dev](https://steinhorst.dev)
Project Link: [github.com/denissteinhorst/steinhorst-dev](https://github.com/denissteinhorst/steinhorst-dev)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

This project is a personal portfolio and is not intended for reuse. All content and design are proprietary.

However, you're welcome to use the code structure and technical implementation as inspiration for your own projects.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<div align="center">
  <p><strong>Built with ❤️ using Nuxt 4 and modern web technologies</strong></p>
  <p>© 2025 Denis Steinhorst. All rights reserved.</p>
</div>

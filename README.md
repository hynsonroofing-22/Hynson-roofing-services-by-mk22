# Hynson Roofing Services Ltd — website

Recovered from the Emergent preview build on 17 August 2026. This is the original
React source, not a screenshot copy.

## Run it locally

You need Node.js installed (you already have it).

    npm install
    npm start

That opens the site at http://localhost:3000.

## Build for hosting

    npm run build

That produces a `build/` folder. Drag that folder onto Netlify to publish it.

## What's here

    src/pages/Home.jsx          the whole homepage, in order
    src/pages/Admin.jsx         the /admin enquiries screen
    src/data/content.js         ALL your text, services, projects, reviews, FAQs
                                — edit copy here, not in the components
    src/components/
      Navbar.jsx                top bar + mobile menu
      Hero3D.jsx                hero section, mounts the 3D canvas
      BuildingScene.jsx         >>> THE SCROLL HOUSE BUILD ANIMATION <<<
      MiniBuilding.jsx          small 3D house used elsewhere
      About.jsx  Services.jsx  Projects.jsx  Testimonials.jsx
      FAQ.jsx  Contact.jsx  Footer.jsx  Marquee.jsx
    src/index.css               all site styling (compiled, self-contained)
    public/img/                 the 9 photos

## Notes

- `src/index.css` is the finished compiled stylesheet. There is no Tailwind build
  step to configure — the CSS is complete as-is.
- The contact form and admin page call `REACT_APP_BACKEND_URL` (see `.env`).
  That backend lived on Emergent and did NOT come across — only the frontend
  source is recoverable this way. The form will not submit until that's replaced.
- Nothing in here connects to Emergent any more.

## Next job

Rebuild `BuildingScene.jsx` so the house build looks photoreal, matching the
two TikTok references (@elyptwebdesign "built from the ground up",
@webloved "VESTA / from ink to keys") instead of the current plain shapes.

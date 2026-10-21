# App hero specs

How the hero of the master app template (`src/app/test-template/AppTemplate.tsx`) is set up for each of the 14 apps: the order its elements appear in, what the reader can do with it, and what has to be made (screen images, icons) before it can ship.

Every hero is the same component. What changes per app is one entry in `src/data/appTemplates.ts` (`hero.actions`, `hero.strip`, `hero.screen`) plus the screen images it points to. The headline, summary, rating and accent colour already come from `src/data/apps.ts`.

Nine apps go further and get a **custom hero scene**: their own background, controls, cursor or centrepiece in place of the shared shader sky and action buttons (see §2, "Custom scenes"). These are Flashlight, Volume Control, Step Tracker, Calendar, Daily Horoscope, Notes, Weather Radar, QR Scanner and Holy Bible. Find My Phone uses the shared hero as it is.

Preview any app at `/test-template/<slug>`.

---

## 1. Shared hero flow

The order is the same for every app. Items marked **per app** are set in `appTemplates.ts`; everything else is automatic.

| # | Element | Source | Notes |
|---|---|---|---|
| 1 | Site header | shared | The site's own `Header`. |
| 2 | Sky + shader background | shared | Animated rainbow band; a click anywhere on the hero sends a ripple through it. Parallax: lags the scroll. |
| 3 | Headline | `apps.ts` → `headline` | One block per authored line (`\n`); a long line may wrap. |
| 4 | Summary | `apps.ts` → `summary` | |
| 5 | Google Play button | shared | 3px animated gradient ring around it. |
| 6 | Rating line | `apps.ts` → `rating`, `ratingCount` | |
| 7 | 3D phone | shared model, **per app** screen | Slow 360° spin every 4s, leans toward the cursor. `hero.screen` sets what its display shows at rest. |
| 8 | Action buttons (0–2) | **per app** `hero.actions` | Frosted pills left and right of the phone. Pressing one plays its action for 2.4s. |
| 9 | Status note | **per app** `actions[].note` | Dark pill above the phone while an action plays, e.g. "Clap detected · Ringing". |
| 10 | Bottom strip | **per app** `hero.strip` | A grey label over three icon + word items, pinned to the hero's foot. Optional. |
| 11 | Store card | shared | App icon + name, bottom right, desktop only. |

The hero is fully usable with none of the per-app fields: the phone spins, there are no buttons and no strip.

## 2. Interactive building blocks

### What the phone can do today (`does`)

| `does` | What happens | Needs |
|---|---|---|
| `ring` | Turns to its back, buzzes in short pulses, blinks the flash LED at 2.5/s, turns back to the front. | Nothing |
| `torch` | Turns to its back and holds the flash LED on. | Nothing |
| `volume` | Stays facing front; the side buttons press in three times. | Nothing |
| `screen` | Stays facing front; the display shows `action.screen` for the duration. | One 1260×2800 image |

### Proposed additions

The specs below use these where the four above can't show what the app does. Each is a small addition to `PhoneModel`; none is built yet.

| Proposal | What it would do | Used by |
|---|---|---|
| `screens` (sequence) | Like `screen`, but steps through 2–4 images over the 2.4s, so a result can appear after an input (a question, then an answer). Field: `action.screens: string[]`. | AI Chat, Calculator |
| Floating chip | A small card that pops out beside the phone while an action plays, such as a temperature or a lucky number. Field: `action.chip: { emoji, text }`. | Horoscope, Alarm |

### Custom scenes

A scene is a per-app hero component that can replace the background (layer 2), the 3D phone (layer 7), the action buttons (layer 8) and the cursor. It keeps the headline, store button, rating, strip and store card. Field: `hero.scene: "flashlight" | "volume" | "steps" | "calendar" | "horoscope" | "notes" | "weather" | "qr" | "bible"`. The scenes need these additions to `PhoneModel`:

| Addition | What it does | Used by |
|---|---|---|
| Live screen | The display shows a canvas the scene draws into, redrawn each frame (about 360×800), so a colour, a number or a list can change live without screen images. | Flashlight, Volume, Step Tracker, Horoscope, Notes |
| Hold | Holds the phone facing front or back until it is released, instead of for 2.4s. | Flashlight, Volume, Horoscope, Notes |
| Upside down | Holds the phone facing front, turned 180° in its own plane so the bottom speaker points up. | Volume |
| Torch beam | When the torch is held on, the flash glow widens into a beam that lights the darkened hero. | Flashlight |

A scene can also darken the whole hero (Flashlight with the torch on, and Horoscope always). The headline, summary and rating then turn white, and they go back when the hero is light again.

### Rules for every app

- **Flashing:** anything that flashes stays at or under 3 flashes a second.
- **Reduced motion:** the phone doesn't turn, shake or bob. `ring` and `torch` show a steady glow behind it instead, and `screen` still swaps the display, because that isn't motion. In scenes, the waves, footprints, rain, stars, flying blocks, page turns and scan loop are shown at rest, and every control still works.
- **Keyboard:** every scene control (swatches, knob, voice button, constellations, step labels, page turns) can be reached and used without a mouse. The knob is a `role="slider"` that the arrow keys move.
- **Status note:** every action has a `note`; it's announced to screen readers (`role="status"`).
- **Button count:** two buttons at most, left then right. One is fine.
- **Screen images:** 1260×2800 (9:20), saved as WebP in `public/images/apps/<slug>/hero/`. They're shown unlit on the phone, so the image's own colours are what you see.
- **Strip icons:** an SVG path on a 24-unit grid with a 1.8 stroke, matching the existing three. Each spec below names the icon; the path still needs drawing.

---

## 3. Per-app specs

Each app has:
- **MVP:** the one thing the hero has to show.
- **Flow:** what the reader sees and does, in order.
- **Components:** what to add to `appTemplates.ts`.
- **To make:** the images and icons the spec needs.

### Find My Phone Launcher · `find-my-phone` · **live in the template**

- **MVP:** clap or whistle, and the phone rings, flashes and vibrates.
- **Flow:**
  1. The headline "Lost your phone? Clap.", then the store button.
  2. The phone spins at rest.
  3. The reader presses **Clap** or **Whistle**.
  4. The phone turns round, buzzes and blinks its flash, under the note "Clap detected · Ringing".
  5. The strip reads "Works whether your phone is on: Silent · Vibrate · Full volume".
- **Components:**
  - Clap (`ring`)
  - Whistle (`ring`)
  - strip as above
- **To make:** nothing. Optionally, a `hero.screen` of the app's "Clap & Whistle detection ON" screen.

### Brightest Flashlight Launcher · `flashlight`

- **MVP:** a screen light in any colour, and a torch bright enough to light a dark room.
- **Scene:** `flashlight`
- **Flow:**
  1. The headline, then the store button. The phone spins at rest.
  2. To the left of the phone is a row of colour swatches: white, warm amber, red, green, blue and pink.
  3. Picking a swatch stops the spin and holds the phone facing front, with the whole display lit in that colour. A soft glow of the same colour spreads behind the phone, and the chosen swatch is ringed.
  4. To the right is a 🔦 **Flashlight** toggle. Turning it on dims the hero to near black over about 0.6s, and the headline turns white. The phone turns to its back and its flash LED holds on, throwing a beam of light across the dark hero. The note reads "Torch on".
  5. With the hero dark, picking a swatch turns the phone back to the front, so its coloured screen glows in the dark like a screen light.
  6. Turning the toggle off fades the hero back to light, and the phone resumes its spin.
  7. The strip shows the app's other tools.
- **Components:**
  - swatches: a live screen filled with the colour, plus hold front
  - Flashlight toggle: `torch` with hold and the torch beam, plus a dark hero
  - strip "Also in the app": Magnifier · Compass · Screen light
- **Rules:** the torch holds steady and never strobes. Under reduced motion the phone doesn't turn, and the dark hero shows a static pool of light where the beam would be.
- **To make:**
  - no screen images (the screen is drawn live)
  - icons: magnifying glass, compass, sun

### Volume Control Launcher · `volume-control`

- **MVP:** turn any sound up exactly as far as you want.
- **Scene:** `volume`
- **Flow:**
  1. At rest, the phone spins and its display shows the volume at 0%.
  2. Beside the phone is a large circular knob, like a hi-fi dial, with tick marks round its rim and a glowing arc that fills as it turns. It sweeps 270°, from -135° (0%) to +135° (100%).
  3. Dragging the cursor round the knob turns it, following the cursor's angle from its centre. Arrow keys, Page Up/Down and Home/End also work.
  4. Once the knob leaves 0, the phone stops spinning and turns upside down, facing front with its bottom speaker pointing up. The phone's side buttons press in time with the movement.
  5. Audio waves come out of the speaker and across the hero: a few layered sine lines behind the phone. Their height, speed and brightness follow the knob, from a flat line at 0% to tall, fast waves at 100%.
  6. The display shows the level live as a big percentage and a filled bar. The note reads "Volume 72%".
  7. Back at 0, the waves settle flat and the phone turns upright and spins again.
  8. The strip names what can be controlled.
- **Components:**
  - knob: a `role="slider"` (0–100)
  - phone: upside down and a live screen, with `volume` button presses
  - waves: a canvas behind the phone, driven by the knob's value
  - strip "Control every sound": Calls · Music · Alarms
- **Rules:** no sound plays. Under reduced motion the phone stays upright and the waves are drawn still, at a height set by the knob.
- **To make:**
  - no screen images (the screen is drawn live)
  - icons: phone handset, music note, alarm bell

### Step Tracker Launcher · `step-tracker`

- **MVP:** every step counted as you take it.
- **Scene:** `steps`
- **Flow:**
  1. The shader sky is replaced by a top-down view of land: soft grass, earth paths and a few trees, seen from above in pale, map-like colours so the headline stays readable.
  2. Over the hero, the cursor becomes a human footprint.
  3. As the cursor moves, it leaves a trail of footprints, one about every 40px of travel. They alternate left and right, a little either side of the path, and each turns to face the way it is heading. Each print fades out after a few seconds, and at most about 40 are on screen.
  4. In the centre, the phone holds facing front with a step counter on its display. It counts up by one for every footprint, with a ring filling toward a goal of 100. Distance and calories tick up under the count.
  5. Reaching the goal fills the ring and the note reads "Goal reached 🎉". The count then carries on.
  6. The strip shows the three numbers it tracks.
- **Components:**
  - land background: a shader or a static illustration
  - footprint cursor (CSS `cursor`), plus a footprint trail on a canvas over the land
  - counter: a live screen on the phone
  - strip "Tracks as you go": Steps · Distance · Calories
- **Rules:** on touch screens, the footprints follow a finger dragged across the hero. With no pointer, the count rises a little on its own so the hero isn't empty. Under reduced motion the prints still appear but don't fade.
- **To make:**
  - the land art, or a shader
  - the footprint cursor (left and right foot, SVG)
  - icons: footprints, route, flame

### AI Chat Launcher · `ai-chat`

- **MVP:** ask anything from the home screen and get an answer.
- **Flow:**
  1. At rest, the phone shows the chat screen.
  2. **Ask** steps through a typed question, then the answer; the note reads "Answer ready".
  3. **Speak** shows the voice-mode screen, then the answer; the note reads "Listening…".
  4. The strip names the AI models it uses.
- **Components:**
  - Ask: 💬 `screens` (proposed)
  - Speak: 🎙️ `screens` (proposed)
  - strip "Powered by": GPT · Gemini · Claude, as words only, since these are other companies' marks
- **To make:**
  - five screens: rest, question, answer, voice, voice answer
  - no strip icons (words only)

### 2026 Calendar Launcher · `calendar`

- **MVP:** your whole 2026 at a glance, with events and reminders.
- **Scene:** `calendar`
- **Flow:**
  1. **Reveal (about 2s, plays once on load):** a tear-off desk calendar sits in the centre of the hero. Its pages flip over the top binding, one after another and faster as they go, from January 2026 to the current month, where it stops.
  2. The calendar then breaks apart into four blocks. Each flies in from a different direction and settles in its own way round the centre:
     - **Month grid:** the current month, sliding in from the left with a slight tilt
     - **Today tile:** a big date number, dropping from the top with a small bounce
     - **Event card**, e.g. "📌 Team lunch · Fri 1pm": sweeping in from the right
     - **Reminder chip**, e.g. "🔔 10:00 Dentist": rising from below and scaling up
  3. The phone fades in at the centre of the blocks and spins as usual, showing the app's month view. The blocks drift gently with the cursor at different depths.
  4. The strip names the three things it does.
- **Components:**
  - flip calendar: DOM pages turned with GSAP `rotateX`
  - four blocks, animated in with GSAP from four directions
  - strip "Plan it all": Month view · Events · Reminders
- **Rules:** the dates are worked out in the browser, so a statically built page shows the real current month and day. Under reduced motion there are no flips: the four blocks are simply shown in place.
- **To make:**
  - optionally a `hero.screen` of the month view
  - icons: calendar grid, pin, bell

### Daily Horoscope Launcher · `daily-horoscope`

- **MVP:** today's reading for your sign, written in the stars.
- **Scene:** `horoscope`
- **Flow:**
  1. The shader sky is replaced by a deep night sky: a dark indigo-to-black gradient with a faint milky band, and three layers of stars that twinkle at different rates. The headline, summary and rating turn white.
  2. The twelve zodiac constellations are set round the phone as faint stars. The star layers and the constellations drift against the cursor at different depths, which gives the sky parallax.
  3. **Hover:** as the cursor comes near a constellation, its stars brighten. Lines draw between them, star to star, and the sign's name and dates fade in beside it, e.g. "♌ Leo · Jul 23 – Aug 22". Moving away fades the lines out.
  4. **Click (or Enter on a focused sign):** the constellation flares and a short burst of star dust travels from it to the phone. The phone stops spinning and holds facing front, and its display shows that sign's reading for today. A chip "🍀 7 · Gold" floats beside the phone with the sign's lucky number and colour. The note reads "Leo · Your day ahead".
  5. **Ambient:** every few seconds a shooting star crosses the sky. A click on empty sky sends one from the cursor.
  6. With no sign picked, the phone spins as usual and its display shows today's horoscope.
  7. The strip shows the reading categories, in white.
- **Components:**
  - night sky: a shader or canvas with three star layers, a milky band and twinkle
  - constellations: twelve star patterns as SVG, with lines drawn by `stroke-dashoffset`. Each is a focusable button with the sign's name as its label.
  - phone: a live screen with the chosen sign's reading, plus hold front, plus a floating chip
  - strip "Readings for": Love · Career · Health
- **Rules:** a dark hero (see §2, "Custom scenes"). The readings are fixed sample text, one per sign, not today's real horoscope. Under reduced motion the stars don't twinkle or drift, there are no shooting stars, and hover and click still draw the lines and show the reading.
- **To make:**
  - twelve constellation star maps (star positions and lines) and twelve short readings with a lucky number and colour
  - no screen images (the screen is drawn live)
  - icons: heart, briefcase, leaf

### Notes & To Do Launcher · `notes`

- **MVP:** say it, and it's on your list.
- **Scene:** `notes`
- **Flow:**
  1. At rest, the phone spins and its display shows a to-do list with one or two tasks.
  2. Beside the phone is a 🎤 **Voice command** button.
  3. Pressing it stops the spin and holds the phone facing front. The note reads "Listening…".
  4. Animated audio waves stream out of the button toward the phone's screen: pulsing bars or sine ribbons that travel across and fade into the display.
  5. On the display, the predefined tasks are added one by one, each about 0.6s apart. Each one types in, then slides into the list with a soft bounce and an empty checkbox:
     - "Buy milk"
     - "Call mom at 6"
     - "Gym tomorrow 7am"
  6. The waves stop, the last task ticks a colour tag, and the note reads "3 tasks added". After a pause, the phone resumes its spin and the list keeps the new tasks.
  7. Pressing the button again resets the list and replays the sequence.
  8. The strip names the ways to organise notes.
- **Components:**
  - Voice command button
  - waves: SVG or canvas from the button to the phone
  - list: a live screen drawn as the tasks arrive, plus hold front
  - strip "Keep it tidy": Colour · Lock · Checklist
- **Rules:** no microphone is used and no sound plays; the tasks are always the same. Under reduced motion the waves are not shown and the tasks simply appear.
- **To make:**
  - no screen images (the screen is drawn live)
  - icons: palette, padlock, checkbox

### Live Weather Radar Launcher · `weather-radar`

- **MVP:** see the rain coming on a live map.
- **Scene:** `weather`
- **Flow:**
  1. The shader sky is replaced by a real map that fills the hero: map tiles, slightly washed out so the headline reads over them.
  2. Over the map, a shader draws rain clouds: soft fbm cloud masses drifting with the wind, with rain streaks falling beneath the densest parts, tinted like a radar layer (blue to green to yellow at the heaviest).
  3. **Cursor:** the clouds react to the pointer. Moving through them pushes them aside like wind, and a click sends a gust that scatters them before they drift back together.
  4. The phone spins at rest in the centre, showing the app's radar screen if there is one.
  5. The strip names the map layers.
- **Components:**
  - map: a static grid of map tiles (e.g. CARTO Positron or OSM) round a fixed point, or a map library if panning is wanted
  - rain: a second fragment shader on a transparent canvas, using the shared shader's mouse and click uniforms
  - strip "Map layers": Rain · Wind · Temperature
- **Rules:** the map credit ("© OpenStreetMap contributors © CARTO") stays visible in a bottom corner. The tiles come from a third party, so the hero falls back to a plain light map tint if they fail to load. Under reduced motion the clouds hold still and the rain is not drawn.
- **To make:**
  - choose a map provider and a centre point
  - optionally a `hero.screen` of the radar view
  - icons: raindrops, wind, thermometer

### Calculator Launcher · `calculator`

- **MVP:** every calculator, including the unit converter.
- **Flow:**
  1. At rest, the phone shows the calculator.
  2. **Calculate** steps through a sum being typed, then the result; the note reads "= 1,250".
  3. **Convert** shows a unit or currency conversion; the note reads "Converted".
  4. The strip names more of the calculators.
- **Components:**
  - Calculate: ➗ `screens` (proposed)
  - Convert: 🔄 `screen`
  - strip "Also": Tip · BMI · Loan
- **To make:**
  - four screens
  - icons: receipt, scale, bank

### QR & Barcode Scanner Launcher · `qr-scanner`

- **MVP:** point, scan, done, shown as a picture of how a scan works.
- **Scene:** `qr`
- **Flow:** a flat 2D illustration takes the 3D phone's place in the centre of the hero. It plays a loop of about 6s, and a step label under it tracks the stages: "Point · Lock on · Decode · Open".
  1. **Point:** a flat phone outline slides in toward a QR code printed on a card (a poster, a menu or a product box). The phone's screen shows the camera view of the card.
  2. **Lock on:** a scan line sweeps down the viewfinder. Corner brackets snap onto the code's three square finder patterns, one after another, each with a small pop, and then close in round the whole code.
  3. **Decode:** the code's modules (its black and white squares) light up row by row. They lift off the card as small squares and stream into the phone, turning into 1s and 0s as they go. The phone gives one short buzz, drawn as two small motion lines.
  4. **Open:** the result card rises out of the phone's screen, e.g. "🔗 atom.app/menu" with an **Open** button, and it's added to a short history list behind it.
  5. The next loop scans a barcode on a product instead. A red laser line crosses the bars, and the result is a product card "🛒 Oat milk · 1L". The loops alternate QR and barcode.
  6. **Interaction:** the step labels are buttons. Clicking one jumps to that stage and pauses there, and clicking it again resumes the loop. The pointer can hover over the card to tilt it slightly, and the brackets track it.
  7. The strip names what happens after a scan.
- **Components:**
  - illustration: inline SVG (card, code, flat phone, brackets, particles) on a GSAP timeline with a label per stage
  - step labels: buttons that seek the timeline
  - strip "After every scan": History · Auto-copy · Beep or buzz
- **Rules:** the QR code drawn is a real, scannable code that points to the app's Play Store page. The scan line moves smoothly and doesn't flash. Under reduced motion the four stages are shown side by side as still frames.
- **To make:**
  - the illustration in SVG, in the app's accent colour
  - icons: clock, copy, speaker

### Holy Bible Launcher · `holy-bible`

- **MVP:** open the book to the day's verse.
- **Scene:** `bible`
- **Flow:**
  1. **Reveal (about 2.5s, plays once on load):** a closed Bible lies in the centre of the hero in place of the 3D phone: a leather cover with a gilt title, tilted slightly toward the reader. The cover swings open. A run of pages then turns, fast at first and slowing down, each curling over the spine with a soft shadow sweeping across the page beneath.
  2. The book settles open on the verse of the day. On the right-hand page, the verse writes itself in line by line, e.g. "The Lord is my shepherd; I shall not want. Psalm 23:1". A warm light glows on the pages.
  3. **Turn pages:** the reader can turn more pages, and each one lands on another verse. They can drag a page corner across the spine, click the left or right page edge, or use the arrow keys. A dragged page follows the pointer and curls as it bends; let go past halfway and it turns, otherwise it falls back.
  4. **Hover:** the page corner nearest the cursor lifts a little to show it can be turned.
  5. The strip names the ways to use it.
- **Components:**
  - book: DOM pages with CSS 3D (`rotateY` about the spine, `preserve-3d`), and a gradient shadow for the curl. GSAP plays the reveal and the drag.
  - verses: a short list of about 8 (text and reference), one per page spread
  - strip "Read your way": Read · Listen · Devotionals
- **Rules:** no sound. The verse text is real text, so screen readers and search can read it. Under reduced motion there is no reveal: the book is shown open on the verse of the day, and turning a page swaps the spread with a fade.
- **To make:**
  - cover art (leather texture and title)
  - the verse list
  - icons: book, headphones, dove

### Alarm Clock Launcher · `alarm-clock`

- **MVP:** wake up on time, every time.
- **Flow:**
  1. At rest, the phone shows the alarms list.
  2. **Ring alarm** turns the phone round, buzzes and blinks its flash, as `ring` does; the note reads "07:00 · Wake up". A chip "⏰ Snooze 5 min" is optional.
  3. **Timer** shows a timer counting down.
  4. The strip names its other clocks.
- **Components:**
  - Ring alarm: ⏰ `ring`
  - Timer: ⏳ `screens` (proposed), or `screen` with a single frame
  - strip "Also": World clock · Timer · Stopwatch
- **To make:**
  - three or four screens
  - icons: globe, hourglass, stopwatch

### Breaking News Launcher · `breaking-news`

- **MVP:** the day's news and the local weather, one swipe away.
- **Flow:**
  1. At rest, the phone shows the news feed.
  2. **Top stories** shows the headline list; the note reads "Updated just now".
  3. **Weather** shows the forecast card.
  4. The strip names the news categories.
- **Components:**
  - Top stories: 📰 `screen`
  - Weather: 🌦 `screen`
  - strip "Categories": Business · Sports · Tech
- **To make:**
  - three screens
  - icons: chart line, ball, chip
- **Low data:** the listing has no reviews and only 3 features, so the page below the hero will be short. Write `features.heading` and `closing` copy for it in `appTemplates.ts`.

---

## 4. Build order

1. **Can ship now with existing behaviours:** Breaking News and Alarm Clock. Each needs only its screens and strip icons.
2. **Build the scene slot and the `PhoneModel` additions** (live screen, hold, upside down, torch beam). Then build the scenes, simplest first: Flashlight, Volume Control, Notes, QR Scanner, Step Tracker, Calendar, Holy Bible, Daily Horoscope, Weather Radar.
3. **Build `screens` (sequence)**, which unlocks AI Chat and Calculator, and **the floating chip** for Daily Horoscope and Alarm Clock.

## 5. Asset checklist

| App | Screens (1260×2800) | Strip icons |
|---|---|---|
| find-my-phone | 0 (1 optional) | done |
| flashlight | 0 (live screen) | 3 |
| volume-control | 0 (live screen) | 3 |
| step-tracker | 0 (live screen), plus land art and footprint cursor | 3 |
| ai-chat | 5 | 0 |
| calendar | 0 (1 optional) | 3 |
| daily-horoscope | 0 (live screen), plus 12 constellations and readings | 3 |
| notes | 0 (live screen) | 3 |
| weather-radar | 0 (1 optional), plus a map provider | 3 |
| calculator | 4 | 3 |
| qr-scanner | 0, plus the SVG illustration | 3 |
| holy-bible | 0, plus cover art and verse list | 3 |
| alarm-clock | 3–4 | 3 |
| breaking-news | 3 | 3 |

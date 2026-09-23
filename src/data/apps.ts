/**
 * The app pages — one per Play Store listing, at `/apps/<slug>`.
 *
 * Everything here is taken from each app's Google Play listing ("About this
 * app", the header stats and the screenshot strip) and reshaped into one
 * structure so every page renders the same way. The listings all follow the
 * same template — an opening paragraph, the launcher "added benefits", a
 * feature list, then the store boilerplate — so the shape below is that
 * template with the boilerplate left out: the consent line, the trademark
 * notices and the "download now" closers are the store's, not the app's, and
 * the site footer already carries the Google Play attribution.
 *
 * `icon` is the same Fold 03 asset the icon grid uses, so the page a reader
 * lands on shows the exact artwork they clicked. Screenshots are copies of
 * the listing's own images in `public/images/apps/<slug>/`, so the pages do
 * not depend on Google's CDN and get the long-lived caching every file under
 * `public/images/` already has.
 *
 * Stats (`rating`, `ratingCount`, `downloads`, `updated`) are a snapshot of
 * the listing on 23 Sep 2026 — see `APPS_SNAPSHOT`. They are not fetched
 * live; refresh them here when the listings move.
 *
 * The screenshots are the store's own marketing posters — each already has a
 * phone rendered inside it under a headline — so the page shows them as
 * posters rather than framing them again. `heroShot`, `launcherShots` and
 * each feature's `shot` are the hand-made pairings of poster to copy.
 */

export interface AppFeature {
  /** The glyph the listing leads the item with. Kept for the data; the page numbers features instead. */
  emoji: string;
  title: string;
  text: string;
  /** A short list the item carries, e.g. the Bible versions on offer. */
  bullets?: string[];
  /**
   * 1-based index into `screenshots` of the store poster that shows this
   * feature — paired by hand. A feature with one gets a full row with the
   * poster beside it; one without is listed in the compact grid after them.
   */
  shot?: number;
}

export interface AppList {
  /** The line the listing introduces the list with. Empty if it had none. */
  heading: string;
  items: string[];
}

export interface AppScreenshot {
  src: string;
  width: number;
  height: number;
}

export interface AppPage {
  /** URL segment: `/apps/<slug>`. */
  slug: string;
  /** Fold 03 icon id — the artwork in `public/images/fold03/`. */
  icon: string;
  /** Short name, for captions and the "more apps" grid. */
  title: string;
  /** The listing's full name, as it reads on Google Play. */
  name: string;
  /** The listing's one-line description. */
  summary: string;
  /**
   * The page's headline — written from the summary, not the store name, the
   * way the apps' own sites lead. Line breaks are the author's: `\n` forces
   * one.
   */
  headline: string;
  /**
   * The app's colour, sampled from its icon and darkened where the icon's own
   * is too bright to hold type. Tints the hero and numbers the features.
   */
  accent: string;
  /** 1-based index into `screenshots` of the poster beside the headline. */
  heroShot: number;
  /**
   * 1-based indices of the two launcher posters every listing carries — the
   * "one-swipe access" and "web search widget" shots — shown beside the
   * launcher benefits.
   */
  launcherShots: number[];
  category: string;
  contentRating: string;
  /** Average rating out of 5, one decimal. */
  rating: number;
  ratingCount: number;
  /** Google Play's install bracket, e.g. "1M+". */
  downloads: string;
  /** "Updated on" date, as the listing prints it. */
  updated: string;
  /** Android package id — what the Play Store URL is built from. */
  packageId: string;
  /** The app's own site. */
  website: string;
  links: {
    faq?: string;
    contact?: string;
    terms?: string;
    privacy?: string;
  };
  /** The "About this app" prose, minus the sections broken out below. */
  intro: string[];
  /** The listing's tick list, where it has one. */
  highlights?: string[];
  /** The app's own features. */
  features: AppFeature[];
  /** What comes with the launcher itself — the same five, worded per app. */
  launcherBenefits: AppFeature[];
  /** Any other list the listing carries ("How to use the app", "Why choose…"). */
  lists?: AppList[];
  screenshots: AppScreenshot[];
}

/** When the stats below were read off the listings. */
export const APPS_SNAPSHOT = "23 September 2026";

/**
 * Every listing carries this notice. The FAQ link is the one thing in it that
 * differs per app — see `links.faq`.
 */
export const LAUNCHER_NOTE =
  "As a launcher app, the layout of your home screen may change after install. Don't worry, all your apps are still on your phone — they may just be in a different location.";

export function playStoreUrl(app: Pick<AppPage, "packageId">): string {
  return `https://play.google.com/store/apps/details?id=${app.packageId}`;
}

export function appIconSrc(app: Pick<AppPage, "icon">): string {
  return `/images/fold03/${app.icon}.jpg`;
}

export function getApp(slug: string): AppPage | undefined {
  return APPS.find((app) => app.slug === slug);
}

/** Order follows the Play Store's "More by AtomApplications" row. */
export const APPS: AppPage[] = [
  {
    slug: "breaking-news",
    icon: "icon-04",
    title: "Breaking News",
    name: "Breaking News Launcher",
    summary: "Business, Sports, Entertainment, Technology News. Local Weather Forecast Service",
    headline: "The news,\none swipe away.",
    accent: "#322553",
    heroShot: 1,
    launcherShots: [5, 6],
    category: "News & Magazines",
    contentRating: "Everyone 10+",
    rating: 4.4,
    ratingCount: 101,
    downloads: "10K+",
    updated: "Sep 18, 2026",
    packageId: "com.news.breakingnews.headlines.android",
    website: "https://newsheadlines.press/",
    links: {
      faq: "https://newsheadlines.press/#faq",
      contact: "https://newsheadlines.press/contact-us",
      terms: "https://newsheadlines.press/terms-of-service",
      privacy: "https://newsheadlines.press/privacy-policy",
    },
    intro: [
      "Breaking News Launcher – stay informed anytime, anywhere. Stay up to date with daily news from around the world, along with accurate weather forecasts - all in one place. Explore global news & trending stories, plus daily weather updates. Simply swipe right from your home screen to instantly access the latest updates, top stories, and essential weather information anytime you need it.",
    ],
    features: [
      { emoji: "📰", title: "Latest news stories", text: "Stay up to date with the most recent headlines and trending articles. Read full stories and catch up on what's happening right now.", shot: 2 },
      { emoji: "📂", title: "News by categories", text: "Explore topics that interest you. Easily navigate through categories like Business, Sports, Entertainment, Technology.", shot: 3 },
      { emoji: "🌦", title: "Weather – complete forecast", text: "Check the current temperature, hourly forecast, 7‑day forecast, and sunrise & sunset times. Plan your day with all the weather details you need.", shot: 4 },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Open the latest national and global news instantly with just one swipe from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful themed wallpapers." },
      { emoji: "🏠", title: "Home screen shortcut", text: "Use the Breaking News Launcher shortcut on your home screen to get quick access to the latest news and weather." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps and web search has never been easier. Search for installed apps or the web (powered by Google or Yahoo!) from multiple access points." },
    ],
    lists: [
      { heading: "Why choose Breaking News Launcher?", items: ["Quick access to daily news", "Easy-to-use interface", "Organized categories for better browsing", "Reliable weather updates", "Optimized for speed and performance"] },
    ],
    screenshots: [
      { src: "/images/apps/breaking-news/shot-1.webp", width: 720, height: 1280 },
      { src: "/images/apps/breaking-news/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/breaking-news/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/breaking-news/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/breaking-news/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/breaking-news/shot-6.webp", width: 720, height: 1280 },
    ],
  },
  {
    slug: "volume-control",
    icon: "icon-02",
    title: "Volume Control",
    name: "Volume Control Sound Launcher",
    summary: "Audio Booster: Volume Control, Sound Enhancer, Make Music, Calls, Alarms Louder",
    headline: "Every sound,\nexactly as loud as you want.",
    accent: "#1F5BFF",
    heroShot: 2,
    launcherShots: [4, 5],
    category: "Tools",
    contentRating: "Everyone",
    rating: 4.5,
    ratingCount: 28996,
    downloads: "1M+",
    updated: "Sep 22, 2026",
    packageId: "com.soundcontroller.loudspeaker.volume.manager.android",
    website: "https://phonevolumecontrol.com/",
    links: {
      faq: "https://phonevolumecontrol.com/#faq",
      contact: "https://phonevolumecontrol.com/contact-us",
      terms: "https://phonevolumecontrol.com/terms-of-service",
      privacy: "https://phonevolumecontrol.com/privacy-policy",
    },
    intro: [
      "Do you sometimes wish your phone’s volume controls were easier to manage?",
      "With Volume Control Sound Launcher, every sound – from your favorite songs to morning alarms – feels just right. This launcher app gives you quick access to the tools you need for a smoother and more personalized sound experience.",
      "This launcher app puts all your essential volume settings just one swipe away, making it easy to adjust volume, fine-tune your sound, and enjoy better control throughout the day. Whether you want a simple volume control, clearer calls, or more balanced media sound, everything is easier to manage in one place.",
      "Whether you’re enjoying music, watching videos, gaming, or taking calls, Volume Control Sound Launcher helps you create a more balanced and satisfying listening experience that fits your lifestyle. Use it as a sound settings tool for everyday phone use, to make music louder, or as a practical tool when you need faster access to your sound settings.",
      "This free launcher app is ideal for anyone who values convenience and clarity in their daily phone use. Whether you’re relaxing with music, taking an important call, or waking up to an alarm.",
    ],
    highlights: [
      "Easily adjust volume for music, videos, calls, alarms, and notifications",
      "Manage all system sounds quickly from one convenient location",
      "Use smart controls designed for comfortable daily listening and better clarity",
      "Convenient access to all your volume settings in one place",
    ],
    features: [
      { emoji: "🔊", title: "Adjust volume", text: "Easily adjust volume for music, videos, calls, alarms, and notifications — and boost your phone's media volume past its usual ceiling.", shot: 2 },
      { emoji: "🎛️", title: "All-in-one sound control", text: "Manage all system sounds quickly from one convenient location: ringtone, alarm, media, notifications and system, each on its own slider.", shot: 3 },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Quickly adjust your device’s volume with just one swipe from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful themed wallpapers." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps and web search has never been easier. Search for installed apps or the web (powered by Google or Yahoo!) from multiple access points." },
    ],
    screenshots: [
      { src: "/images/apps/volume-control/shot-1.webp", width: 720, height: 405 },
      { src: "/images/apps/volume-control/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/volume-control/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/volume-control/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/volume-control/shot-5.webp", width: 720, height: 1280 },
    ],
  },
  {
    slug: "step-tracker",
    icon: "icon-03",
    title: "Step Tracker",
    name: "Step Tracker Launcher",
    summary: "Track steps, set goals, view stats & celebrate milestones — all in one app.",
    headline: "Every step counts.\nCount them.",
    accent: "#4567FD",
    heroShot: 1,
    launcherShots: [7, 8],
    category: "Health & Fitness",
    contentRating: "Everyone",
    rating: 4.4,
    ratingCount: 2262,
    downloads: "500K+",
    updated: "Sep 9, 2026",
    packageId: "com.stepcounter.pedometer.steptracker.fitness.android",
    website: "https://steptrackerlauncher.com/",
    links: {
      faq: "https://steptrackerlauncher.com/#faq",
      contact: "https://steptrackerlauncher.com/contact-us",
      terms: "https://steptrackerlauncher.com/terms-of-service",
      privacy: "https://steptrackerlauncher.com/privacy-policy",
    },
    intro: [
      "Step Tracker Launcher makes it easy to stay active with real-time step counting, distance, and calorie tracking right from your home screen. Track your steps daily, view weekly and monthly stats, and set personalized walking goals. See how consistent you’ve been, stay on top of your progress, and celebrate milestones as you build healthier habits.",
      "With Step Tracker Launcher, you get a comprehensive view of your daily steps, personalized fitness goals, and real-time progress updates to ensure you stay active and on track towards a healthier lifestyle.",
      "Take control of your fitness journey with Step Tracker Launcher – your trusted companion in step tracking and physical activity management. Stay motivated, track your progress, and make every step count!",
    ],
    highlights: [
      "Track steps, distance & calories instantly",
      "One-swipe access from your home screen",
      "Set and reach daily walking goals",
      "View weekly & monthly progress",
      "Stay consistent and celebrate milestones",
    ],
    features: [
      { emoji: "🚶", title: "Instant Step Tracking", text: "Track your daily steps instantly with just a swipe from your home screen. Stay informed about your physical activity throughout the day and watch your progress in real-time.", shot: 2 },
      { emoji: "📏", title: "Distance & Calorie Tracking", text: "See how far you’ve walked and how many calories you’ve burned, helping you stay motivated to hit your fitness targets and maintain a healthy lifestyle.", shot: 4 },
      { emoji: "🎯", title: "Set Goals", text: "Set personalized daily step goals to challenge yourself. Achieve new milestones and track your progress as you move towards a healthier and more active routine.", shot: 5 },
      { emoji: "📊", title: "Personalized Insights", text: "Get personalized insights into your daily activity and monitor how you're improving. Track your steps over time and see how your fitness journey evolves.", shot: 6 },
      { emoji: "⏰", title: "Celebrate Milestones", text: "Track your progress and celebrate every milestone, big or small, as you reach your fitness goals and stay motivated on your journey.", shot: 3 },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Easily track your daily steps, distance, and calories burned with just a swipe from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful themed wallpapers." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps and web search has never been easier. Search for installed apps or the web (powered by Google, Brave, and Yahoo!) from multiple access points." },
    ],
    screenshots: [
      { src: "/images/apps/step-tracker/shot-1.webp", width: 720, height: 1280 },
      { src: "/images/apps/step-tracker/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/step-tracker/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/step-tracker/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/step-tracker/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/step-tracker/shot-6.webp", width: 720, height: 1280 },
      { src: "/images/apps/step-tracker/shot-7.webp", width: 720, height: 1280 },
      { src: "/images/apps/step-tracker/shot-8.webp", width: 720, height: 1280 },
    ],
  },
  {
    slug: "find-my-phone",
    icon: "icon-05",
    title: "Find My Phone",
    name: "Find My Phone",
    summary: "Lost your phone? Use device finder: locate missing phone with a clap or whistle.",
    headline: "Lost your phone?\nClap.",
    accent: "#3455FD",
    heroShot: 2,
    launcherShots: [5, 6],
    category: "Tools",
    contentRating: "Everyone",
    rating: 4.6,
    ratingCount: 25683,
    downloads: "1M+",
    updated: "Sep 18, 2026",
    packageId: "com.find.phone.device.locate.lostphone.android",
    website: "https://findmyphonelauncher.com/",
    links: {
      faq: "https://findmyphonelauncher.com/#faq",
      contact: "https://findmyphonelauncher.com/contact-us",
      terms: "https://findmyphonelauncher.com/terms-of-service",
      privacy: "https://findmyphonelauncher.com/privacy-policy",
    },
    intro: [
      "Do you often misplace or lose your phone? Then Find My Phone is the perfect app for you! Find My Phone is a smart device finder designed to help you quickly locate a missing phone simply by clapping or whistling. When you clap or whistle, your phone will make a sound, vibrate, and flash, making it easy to find your device in seconds.",
    ],
    highlights: [
      "Clap or whistle to find phone",
      "Flashlight and vibration alerts",
      "Customizable alert sounds and duration",
      "Battery efficient and optimized for performance",
    ],
    features: [
      { emoji: "👏", title: "Find my phone by clap or whistle", text: "Start clapping or whistling to activate advanced sound recognition. Our sound recognition technology helps you locate your device in seconds, even if it is in the next room." },
      { emoji: "💡", title: "Multi alert system", text: "When activated, Find My Phone triggers a powerful combination of loud ringtones and bright flashing lights. This makes your phone easy to spot whether it is hidden under pillows, behind furniture, or in a dark corner.", shot: 4 },
      { emoji: "⚡", title: "Bright flash and vibration response", text: "The flashlight and vibration make it easy to locate your phone even in noisy or low light environments." },
      { emoji: "🎵", title: "Customizable alerts", text: "Choose from a variety of attention grabbing sounds. Select from soothing melodies, whistles, playful animal sounds, or modern electronic tones. Adjust volume levels to suit your environment.", shot: 3 },
      { emoji: "⏰", title: "Set alert duration", text: "Control how long your phone rings when activated. Choose from 10, 30, 60, or 120 seconds." },
      { emoji: "🔋", title: "Battery friendly design", text: "Find My Phone is optimized for minimal battery consumption while running in the background, so your phone is always ready without unnecessary drain." },
      { emoji: "✨", title: "Easy to use", text: "Enjoy a seamless experience with a simple and intuitive interface. No complicated setup required." },
      { emoji: "📲", title: "Versatile compatibility", text: "Works across multiple phone models and functions whether your phone is on silent, vibrate, or full volume." },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Activate the clap & whistle detector instantly with just one swipe from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful themed wallpapers." },
      { emoji: "🏠", title: "Home screen shortcut", text: "Use the Find My Phone Launcher shortcut on your home screen to enjoy quick access." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps and web search has never been easier. Search for installed apps or the web (powered by Google, Brave, and Yahoo!) from multiple access points." },
    ],
    screenshots: [
      { src: "/images/apps/find-my-phone/shot-1.webp", width: 720, height: 405 },
      { src: "/images/apps/find-my-phone/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/find-my-phone/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/find-my-phone/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/find-my-phone/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/find-my-phone/shot-6.webp", width: 720, height: 1280 },
    ],
  },
  {
    slug: "ai-chat",
    icon: "icon-06",
    title: "AI Chat",
    name: "AI Chat Launcher: AI Assistant",
    summary: "AI Chat & Smart Assistant Chatbot Launcher powered by GPT-5.2, Gemini and Claude",
    headline: "An AI assistant,\none swipe from home.",
    accent: "#039471",
    heroShot: 5,
    launcherShots: [6, 7],
    category: "Productivity",
    contentRating: "Everyone",
    rating: 4.4,
    ratingCount: 2505,
    downloads: "100K+",
    updated: "Sep 4, 2026",
    packageId: "com.chat.gpt.ai.assistant.chatbot.android",
    website: "https://aichatlauncher.com/",
    links: {
      faq: "https://aichatlauncher.com/#faq",
      contact: "https://aichatlauncher.com/contact-us",
      terms: "https://aichatlauncher.com/terms-of-service",
      privacy: "https://aichatlauncher.com/privacy-policy",
    },
    intro: [
      "Get instant answers with the new AI Chat Launcher app. Powered by advanced AI models including GPT-5.2, Claude 4, Gemini, Grok 4, Sonnet 4, and Sonar 4, and just a swipe away from your home screen, this smart assistant can help with anything - brainstorming ideas, generating images, summarizing documents, analyzing videos, or improving your writing. It’s fast, simple, and absolutely free to use!",
      "Your personal AI assistantis always ready - smart, fast, and just one swipe away. Try AI Chat Launcher today!",
    ],
    features: [
      { emoji: "🎙️", title: "Voice Chat Mode", text: "Chat with AI using voice. Ask questions, get instant answers, brainstorm ideas, or solve problems hands-free. It feels like having a real conversation with your personal assistant anytime.", shot: 4 },
      { emoji: "🖼️", title: "AI Image Generator", text: "Turn your imagination into stunning visuals. Simply type what you want to create, and the AI generates high-quality images for social media, projects, and creative use.", shot: 2 },
      { emoji: "📄", title: "PDF & Document Summarizer", text: "Upload PDFs or documents and get clear, concise summaries in seconds. Perfect for reports, study materials, long articles, and work documents.", shot: 3 },
      { emoji: "📧", title: "Draft Professional Emails", text: "Struggling with writing? Let the AI create polished emails, messages, and responses in seconds for work or personal use." },
      { emoji: "📚", title: "Grammar, Writing & Text Help", text: "Fix grammar, rewrite content, generate ideas, and improve writing instantly with AI assistance." },
      { emoji: "🌍", title: "Language Translation", text: "Translate text quickly and accurately across multiple languages to communicate effortlessly." },
      { emoji: "🔎", title: "So Much More", text: "Ask anything, plan trips, generate captions, get recommendations, brainstorm ideas, and handle everyday tasks faster. You can also chat using voice, upload images to ask questions, perform image analysis, and even snap and solve math problems instantly - all from one swipe on your home screen." },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Get quick answers from the AI Chatbot by simply swiping right from your home screen." },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful themed wallpapers." },
      { emoji: "🏠", title: "Home screen shortcut", text: "Use the AI Chat Launcher shortcut on your home screen to get fast access to the AI Chat." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Search apps on your phone or the web (powered by Google or Yahoo!) from multiple access points with ease." },
    ],
    screenshots: [
      { src: "/images/apps/ai-chat/shot-1.webp", width: 720, height: 405 },
      { src: "/images/apps/ai-chat/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/ai-chat/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/ai-chat/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/ai-chat/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/ai-chat/shot-6.webp", width: 720, height: 1280 },
      { src: "/images/apps/ai-chat/shot-7.webp", width: 720, height: 1280 },
    ],
  },
  {
    slug: "calendar",
    icon: "icon-07",
    title: "2026 Calendar",
    name: "2026 Calendar Launcher",
    summary: "Daily Calendar Launcher 2026 - Reminder, event planner & appointment scheduler",
    headline: "Your month,\nat a glance.",
    accent: "#3B5FC4",
    heroShot: 6,
    launcherShots: [7, 8],
    category: "Productivity",
    contentRating: "Everyone",
    rating: 4.4,
    ratingCount: 10266,
    downloads: "1M+",
    updated: "Sep 22, 2026",
    packageId: "com.calendarlauncher.calendar.agenda.planner.schedule.events.android",
    website: "https://dailycalendar.app/",
    links: {
      faq: "https://dailycalendar.app/#faq",
      contact: "https://dailycalendar.app/contact-us",
      terms: "https://dailycalendar.app/terms-of-service",
      privacy: "https://dailycalendar.app/privacy-policy",
    },
    intro: [
      "Manage your monthly schedule and stay organized with Calendar Launcher. Get instant access to a simple calendar planner with a single swipe from your home screen. Our calendar app is a launcher that lets you create events and set reminders for birthdays, dinner dates, business meetings and appointments.",
      "Take control of your schedule with Calendar Launcher. Create events and get things done, easily set reminders for tasks, and simplify your daily routine with our easy-to-use calendar planner.",
    ],
    highlights: [
      "Monthly calendar view",
      "Event scheduling",
      "Reminders",
    ],
    features: [
      { emoji: "📅", title: "Easy schedule management", text: "Get a complete picture of your monthly schedule with our simple launcher app. Easily switch between months, view events scheduled on specific dates and plan your time.", shot: 6 },
      { emoji: "📌", title: "Create events", text: "From important appointments and deadlines to birthdays and brunch with friends, this launcher application allows you to easily add events to your calendar.", shot: 4 },
      { emoji: "🔔", title: "Set reminders", text: "Stay on top of your schedule and never miss a beat. Add reminders for events including vacations, anniversaries, birthdays, business meetings, and calls on the calendar launcher app.", shot: 5 },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Schedule calendar events by simply swiping right from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful themed wallpapers." },
      { emoji: "🏠", title: "Home screen shortcut", text: "Use the Calendar Launcher shortcut on your home screen to get fast access to a calendar planner." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps and web search has never been easier. Search for installed apps or the web (powered by Google or Yahoo!) from multiple access points." },
    ],
    screenshots: [
      { src: "/images/apps/calendar/shot-1.webp", width: 720, height: 352 },
      { src: "/images/apps/calendar/shot-2.webp", width: 720, height: 352 },
      { src: "/images/apps/calendar/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/calendar/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/calendar/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/calendar/shot-6.webp", width: 720, height: 1280 },
      { src: "/images/apps/calendar/shot-7.webp", width: 720, height: 1280 },
      { src: "/images/apps/calendar/shot-8.webp", width: 720, height: 1280 },
    ],
  },
  {
    slug: "daily-horoscope",
    icon: "icon-16",
    title: "Daily Horoscope",
    name: "Daily Horoscope Launcher",
    summary: "Astrology Birth Chart & Zodiac compatibility for all zodiac signs. Check yours!",
    headline: "What the stars have in store,\nevery day.",
    accent: "#5B0A4F",
    heroShot: 1,
    launcherShots: [7, 8],
    category: "Lifestyle",
    contentRating: "Everyone",
    rating: 4.5,
    ratingCount: 13928,
    downloads: "1M+",
    updated: "Sep 22, 2026",
    packageId: "com.horoscopedaily.astrology.zodiac.horoscope.android",
    website: "https://horoscopedaily.app/",
    links: {
      faq: "https://horoscopedaily.app/#faq",
      contact: "https://horoscopedaily.app/contact-us",
      terms: "https://horoscopedaily.app/terms-of-service",
      privacy: "https://horoscopedaily.app/privacy-policy",
    },
    intro: [
      "Horoscope Launcher offers daily horoscope readings, love compatibility, birth charts & information on lucky number and color for every zodiac sign. With one-swipe access from your home screen, get astrology insights for Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces every day. Get insights on love, health, emotions, and career with our popular astrology and horoscope app!",
      "Get the Daily Horoscope Launcher to access daily horoscopes, horoscope predictions by category, birth charts, lucky signs, and compatibility insights—all from your home screen!",
    ],
    highlights: [
      "Lucky number, letter & color: Find out which signs are lucky for you  to attract positivity and good fortune.",
      "Compatibility by zodiac sign: Discover how compatible you are with your partner based on zodiac insights.",
      "Daily horoscopes for all zodiac signs: Get horoscope readings tailored for Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces.",
      "Horoscope predictions by category: Explore specific categories like love horoscopes, career horoscopes, health horoscopes, and mood horoscopes to see what the future holds.",
    ],
    features: [
      { emoji: "🌟", title: "Daily Horoscope & Astrology Guidance", text: "Horoscope Launcher provides daily insights on love, career, health, emotions, and fortune. Get yesterday's, today’s, and tomorrow’s predictions for each zodiac sign and let the stars guide your life’s path. Find out your lucky number, color, and letter and bring extra clarity to life’s important decisions. Share your astrological readings with friends and family!", shot: 5 },
      { emoji: "🔮", title: "Personalized birth chart", text: "Get deep astrology insights based on your birth details — your sun, moon and ascendant signs, and what each says about you.", shot: 2 },
      { emoji: "🍀", title: "Lucky number, letter & color", text: "Find out which signs are lucky for you to attract positivity and good fortune, refreshed every day.", shot: 6 },
      { emoji: "🔥", title: "Love Compatibility", text: "Find out what the stars have in store for your love life. Simply enter your zodiac sign and your partner’s to discover if your relationship is astrologically aligned. Find out if your zodiac signs are a perfect match or need extra work with the unique wisdom of astrology.", shot: 3 },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Get your personalized horoscope by simply swiping right from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful themed wallpapers." },
      { emoji: "🏠", title: "Home screen shortcut", text: "Use the Daily Horoscope Launcher shortcut on your home screen to get fast access to horoscope readings, love compatibility insights, and your birth chart." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps and web search has never been easier. Search for installed apps or the web (powered by Google or Yahoo!) from multiple access points." },
    ],
    screenshots: [
      { src: "/images/apps/daily-horoscope/shot-1.webp", width: 720, height: 1280 },
      { src: "/images/apps/daily-horoscope/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/daily-horoscope/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/daily-horoscope/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/daily-horoscope/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/daily-horoscope/shot-6.webp", width: 720, height: 1280 },
      { src: "/images/apps/daily-horoscope/shot-7.webp", width: 720, height: 1280 },
      { src: "/images/apps/daily-horoscope/shot-8.webp", width: 720, height: 1280 },
    ],
  },
  {
    slug: "notes",
    icon: "icon-09",
    title: "Notes & To Do",
    name: "Notes, Notepad, To Do Launcher",
    summary: "Notes & Notepad Launcher with Color Note, To Do List Planner, Reminders, Widgets",
    headline: "Jot it down\nbefore it's gone.",
    accent: "#896040",
    heroShot: 1,
    launcherShots: [6, 7],
    category: "Productivity",
    contentRating: "Everyone",
    rating: 4.3,
    ratingCount: 23726,
    downloads: "1M+",
    updated: "Sep 22, 2026",
    packageId: "com.notes.todolist.notebook.checklist.notepad.android",
    website: "https://notepadhome.app/",
    links: {
      faq: "https://notepadhome.app/#faq",
      contact: "https://notepadhome.app/contact-us",
      terms: "https://notepadhome.app/terms-of-service",
      privacy: "https://notepadhome.app/privacy-policy",
    },
    intro: [
      "Jot down thoughts, ideas and important information with Notes, Notepad, To-Do Launcher. Swipe right from your home screen to create quick notes or to-do lists, share them with friends and family, add locks to secure sensitive information, and more.",
    ],
    features: [
      { emoji: "📝", title: "Create notes & checklists", text: "Quickly jot down ideas and important information on the go. Make a grocery list, a wish list, or a to-do list, then check off items as you accomplish them." },
      { emoji: "✨", title: "Text formatting tools", text: "Enhance your notes with the rich-text editor. Change font sizes, italicize or underline text, and create bulleted or numbered lists." },
      { emoji: "🎨", title: "Color-code notes", text: "Choose a note color to easily categorize and prioritize information. Whether it's managing work tasks or weekend plans, color-coding makes organizing your notes easier.", shot: 3 },
      { emoji: "🔐", title: "Lock notes", text: "Secure sensitive information like passwords, bank account details, medical prescriptions and more in a locked note.", shot: 4 },
      { emoji: "🗂️", title: "Categorize", text: "Save notes under custom categories like vacation checklists or emergency contacts. Group related notes together to instantly access them at any time." },
      { emoji: "🚦", title: "Sort", text: "Use the sorting filter to arrange notes by the date they were modified or in ascending/descending order of creation to easily find what you need." },
      { emoji: "🕵️", title: "Find", text: "Quickly find what you're looking for with Notes, Notepad, To-Do Launcher's intuitive search feature. Enter a keyword or phrase in the app's search bar to quickly locate relevant notes." },
      { emoji: "🤝", title: "Share", text: "Planning a travel itinerary? Working on a group project? Share your notes with family and friends through email, social media and other messaging apps." },
      { emoji: "🎤", title: "Speech to Text", text: "Quickly create notes using voice input. Just speak and your words will be transcribed into text instantly.", shot: 2 },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Create notes & to-do lists instantly by simply swiping right from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful themed wallpapers." },
      { emoji: "🏠", title: "Home screen shortcut", text: "Use the Notes Launcher shortcut on your home screen to get quick access to your to-do lists." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps and web search has never been easier. Search for installed apps or the web (powered by Google or Yahoo!) from multiple access points." },
    ],
    screenshots: [
      { src: "/images/apps/notes/shot-1.webp", width: 720, height: 1280 },
      { src: "/images/apps/notes/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/notes/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/notes/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/notes/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/notes/shot-6.webp", width: 720, height: 1280 },
      { src: "/images/apps/notes/shot-7.webp", width: 720, height: 1280 },
    ],
  },
  {
    slug: "weather-radar",
    icon: "icon-10",
    title: "Live Weather Radar",
    name: "Live Weather Radar Launcher",
    summary: "All-in-one weather radar launcher with rain, temperature maps & local forecast.",
    headline: "See the weather\nbefore it arrives.",
    accent: "#0591F3",
    heroShot: 5,
    launcherShots: [7, 8],
    category: "Weather",
    contentRating: "Everyone",
    rating: 4.2,
    ratingCount: 15531,
    downloads: "1M+",
    updated: "Aug 24, 2026",
    packageId: "com.weatherradarhome.weather.forecast.live.radar.aqi.android",
    website: "https://liveweatherradar.com/",
    links: {
      faq: "https://liveweatherradar.com/#faq",
      contact: "https://liveweatherradar.com/contact-us",
      terms: "https://liveweatherradar.com/terms-of-service",
      privacy: "https://liveweatherradar.com/privacy-policy",
    },
    intro: [
      "Live Weather Radar Launcher is your all-in-one weather app for knowing what is happening outside before changing weather affects your plans. Swipe right from your home screen to access live weather radar and detailed weather maps. Follow rain, wind, temperature, cloud cover, air quality, storm conditions, and hurricane weather in your area. Check local weather forecasts, an hourly forecast, and a 7-day forecast to plan with confidence.",
    ],
    features: [
      { emoji: "🌧️", title: "Live Weather Radar", text: "Use live weather radar and rain radar maps to view areas of rain and snow. Follow changing storm conditions, wind, rain, and hurricane weather in your area with a local weather app built for quick access. Weather radar helps you see conditions before heading outside.", shot: 1 },
      { emoji: "▶️", title: "Radar Forecast Map", text: "Review recent weather patterns and use the radar forecast map to view expected movement for up to six hours. Use this short-term weather forecast to check expected rain movement, then compare rain radar and storm radar views with your local weather forecast." },
      { emoji: "🗺️", title: "Radar Map Layers", text: "Explore weather map layers for rain and snow, temperature, cloud cover, wind, and sea-level pressure. Use wind maps and rain radar views in light, dark, and satellite modes, and choose the map that works best for you." },
      { emoji: "📆", title: "Hourly and 7-Day Weather Forecast", text: "Check the hourly forecast for up to 96 hours and plan ahead with a detailed 7-day weather forecast. Review the daily forecast for rain, wind, temperature, air quality, and other local weather conditions throughout the week.", shot: 2 },
      { emoji: "🌡️", title: "Temperature and Air Quality", text: "Use this weather and air quality app to check local temperature, air quality, and the air quality index before outdoor activities. Understand how wind, rain, storm conditions, and air quality may affect your plans." },
      { emoji: "📰", title: "Weather News", text: "Read weather news about storms, hurricane weather, major hurricane events, hurricane conditions, storm conditions, and climate trends. Follow weather updates when changing storm activity, hurricane weather, or local conditions may affect your plans.", shot: 6 },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "View live weather radar maps and accurate weather forecasts by simply swiping right from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful weather themed wallpapers." },
      { emoji: "🏠", title: "Home screen shortcut", text: "Use the Weather Launcher shortcut on your home screen to get fast access to weather updates." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps and web search has never been easier. Search for installed apps or the web (powered by Google or Yahoo!) from multiple access points." },
    ],
    screenshots: [
      { src: "/images/apps/weather-radar/shot-1.webp", width: 720, height: 1280 },
      { src: "/images/apps/weather-radar/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/weather-radar/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/weather-radar/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/weather-radar/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/weather-radar/shot-6.webp", width: 720, height: 1280 },
      { src: "/images/apps/weather-radar/shot-7.webp", width: 720, height: 1280 },
      { src: "/images/apps/weather-radar/shot-8.webp", width: 720, height: 1280 },
    ],
  },
  {
    slug: "calculator",
    icon: "icon-11",
    title: "Calculator",
    name: "Calculator Launcher",
    summary: "Perform quick calculations & unit conversions with this easy calculator launcher",
    headline: "Every calculator\nyou'll ever need.",
    accent: "#5E8A14",
    heroShot: 1,
    launcherShots: [7, 8],
    category: "Tools",
    contentRating: "Everyone",
    rating: 4.2,
    ratingCount: 15073,
    downloads: "1M+",
    updated: "Sep 11, 2026",
    packageId: "com.tip.calculator.unit.converter.android",
    website: "https://calculatorhome.app/",
    links: {
      faq: "https://calculatorhome.app/about-us#faq",
      contact: "https://calculatorhome.app/contact-us",
      terms: "https://calculatorhome.app/terms-of-service",
      privacy: "https://calculatorhome.app/privacy-policy",
    },
    intro: [
      "Get instant access to every calculator you need - right from your home screen. Calculator Launcher gives you quick access to a basic calculator, tip calculator, unit converter, currency converter, BMI checker, mortgage calculator, loan calculator, and compound interest tools. Whether you’re splitting dinner bills, converting measurements in the kitchen, or planning monthly payments, this free calculator app is always one swipe away.",
    ],
    features: [
      { emoji: "➗", title: "Simple Calculator", text: "Perform quick and clear calculations anytime. Use the basic calculator to total expenses, manage your daily budget, double-check bills, or help with math homework. Fast, reliable, and simple to use." },
      { emoji: "💲", title: "Tip Calculator", text: "Make dining out easier with our tip calculator. Enter the bill amount, choose a tip percentage, and instantly split bills with friends. Calculate tips in seconds for stress-free meals.", shot: 5 },
      { emoji: "🔄", title: "Unit Converter", text: "Switch between units easily with the unit converter calculator. Convert length (mile ↔ kilometer), temperature (Fahrenheit ↔ Celsius), weight, volume, speed, and more. Great for cooking, travel, and everyday tasks.", shot: 4 },
      { emoji: "💱", title: "Currency Converter", text: "Convert currencies in a simple and convenient way with our currency converter calculator. Check conversions for USD, EUR, GBP, INR, CAD, AUD, JPY and more. Ideal for travel, online shopping, and general budgeting needs.", shot: 2 },
      { emoji: "❤️", title: "BMI Calculator", text: "Get a quick view of your body mass index using the BMI calculator. Enter your height and weight to understand your general BMI range. Designed for simple tracking—not medical guidance.", shot: 3 },
      { emoji: "🏡", title: "Mortgage Calculator", text: "Estimate monthly payments and long-term costs with the mortgage calculator. Get a clearer picture when planning home purchases or comparing mortgage options." },
      { emoji: "💼", title: "Loan Calculator", text: "Use the loan calculator to view EMIs, interest estimates, and total payable amounts. Helpful for car loans, personal loans, education expenses, and more." },
      { emoji: "📈", title: "Compound Interest Calculator", text: "Explore how your savings may grow over time with the compound interest calculator. View projected growth using customizable inputs for long-term planning." },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Perform calculations by simply swiping right from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful themed wallpapers." },
      { emoji: "🏠", title: "Home screen shortcut", text: "Use the Calculator Launcher shortcut on your home screen to get fast access to various calculators." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps and web search has never been easier. Search for installed apps or the web (powered by Google and Yahoo!) from multiple access points." },
    ],
    screenshots: [
      { src: "/images/apps/calculator/shot-1.webp", width: 720, height: 1280 },
      { src: "/images/apps/calculator/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/calculator/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/calculator/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/calculator/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/calculator/shot-6.webp", width: 720, height: 1280 },
      { src: "/images/apps/calculator/shot-7.webp", width: 720, height: 1280 },
      { src: "/images/apps/calculator/shot-8.webp", width: 720, height: 1280 },
    ],
  },
  {
    slug: "flashlight",
    icon: "icon-12",
    title: "Brightest Flashlight",
    name: "Brightest Flashlight Launcher",
    summary: "Powerful LED flashlight, alert torch, screen light & magnifying glass launcher",
    headline: "The brightest light\nin your pocket.",
    accent: "#059C54",
    heroShot: 1,
    launcherShots: [6, 7],
    category: "Tools",
    contentRating: "Everyone",
    rating: 4.3,
    ratingCount: 35671,
    downloads: "5M+",
    updated: "Sep 22, 2026",
    packageId: "com.flashlight.bright.led.light",
    website: "https://flashlight.app/",
    links: {
      faq: "https://flashlight.app/#faq",
      contact: "https://flashlight.app/contact-us",
      terms: "https://flashlight.app/terms-of-service",
      privacy: "https://flashlight.app/privacy-policy",
    },
    intro: [
      "Flashlight Launcher is a feature-packed app that turns your smartphone into a powerful flashlight and magnifying glass. It revamps your home screen to give you instant access to a flashlight, a magnifier and personal safety tools like a compass, SOS alerts, and a screen light. Whether you're navigating the great outdoors, stuck in a power outage or in need of a portable light source, this super bright flashlight app has got you covered.",
    ],
    highlights: [
      "Brightest flashlight",
      "Magnifier",
      "Built-in compass",
      "SOS alerts",
      "Screen light",
    ],
    features: [
      { emoji: "🔦", title: "Flashlight", text: "Turn your device into a powerful flashlight with one tap. Whether you're finding your way in the dark to searching for lost items, easily illuminate your surroundings with Flashlight Launcher.", shot: 2 },
      { emoji: "🔍", title: "Magnifier", text: "Flashlight Launcher's magnifier turns your phone into a magnifying glass with light. This makes it perfect for reading small print on food packaging, product labels, and examining objects up close. Plus, the built-in flashlight provides illumination for clear viewing, even in dim lighting.", shot: 3 },
      { emoji: "🧭", title: "Compass", text: "The built-in compass ensures you'll never lose your way. Whether you're hiking, camping, or exploring the outdoors, this flashlight app is your trusted navigation companion.", shot: 5 },
      { emoji: "🆘", title: "SOS Alerts", text: "Your personal safety is important. That's why Flashlight Launcher offers SOS alerts - a potential lifesaver in emergency situations. Activate it to flash an SOS signal that can be seen from a distance, ensuring you can receive help as quickly as possible." },
      { emoji: "💡", title: "Screen Light", text: "Flashlight Launcher’s screen light allows you to use your smartphone's display as a light source. It's perfect for enhancing visibility in low-light conditions.", shot: 4 },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Access flashlight, magnifier & other safety essentials instantly by simply swiping right from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful themed wallpapers." },
      { emoji: "🏠", title: "Home screen shortcut", text: "Use the Flashlight Launcher shortcut on your home screen to get fast access to flashlight & more." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps and web search has never been easier. Search for installed apps or the web (powered by Google, Brave, and Yahoo!) from multiple access points." },
    ],
    lists: [
      { heading: "How to use the app", items: ["Read menus in dimly lit restaurants, or the newspaper without eyeglasses", "Find lost objects, like keys or reading glasses", "Navigate uneven sidewalks at night", "Magnify & read fine print on product labels", "Zoom in on distant text/objects", "Emergency SOS", "Light up keyholes for easy entry", "DIY home repairs"] },
    ],
    screenshots: [
      { src: "/images/apps/flashlight/shot-1.webp", width: 720, height: 1280 },
      { src: "/images/apps/flashlight/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/flashlight/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/flashlight/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/flashlight/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/flashlight/shot-6.webp", width: 720, height: 1280 },
      { src: "/images/apps/flashlight/shot-7.webp", width: 720, height: 1280 },
      { src: "/images/apps/flashlight/shot-8.webp", width: 720, height: 352 },
    ],
  },
  {
    slug: "qr-scanner",
    icon: "icon-13",
    title: "QR & Barcode Scanner",
    name: "QR & Barcode Scanner Launcher",
    summary: "Easy to use QR code scanner and barcode reader. Scan codes quickly and easily.",
    headline: "Point.\nScan. Done.",
    accent: "#2D9E94",
    heroShot: 1,
    launcherShots: [7, 6],
    category: "Tools",
    contentRating: "Everyone",
    rating: 4.3,
    ratingCount: 37315,
    downloads: "5M+",
    updated: "Sep 4, 2026",
    packageId: "com.qr.code.reader.scanner.qrscan.android",
    website: "https://qrscanner.com/",
    links: {
      faq: "https://qrscanner.com/#faq",
      contact: "https://qrscanner.com/contact-us",
      terms: "https://qrscanner.com/terms-of-service",
      privacy: "https://qrscanner.com/privacy-policy",
    },
    intro: [
      "Experience the lightning-fast QR & Barcode Scanner Launcher that lets you scan any QR code or barcode effortlessly with just a swipe from your home screen. Whether you're codes with links, checking product details, or accessing information, the QR & Barcode Scanner Launcher app guarantees a quick, secure, and seamless user experience. As a powerful QR code reader, it ensures accurate scanning for all your needs.",
      "Get the free & easy-to-use app and experience the power of instant scanning right at your fingertips!",
    ],
    highlights: [
      "QR Code Scanner",
      "Barcode Scanner",
      "Scan History",
      "Auto-copy",
      "Vibrate or beep notifications",
    ],
    features: [
      { emoji: "📷", title: "QR Code Scanner", text: "Effortlessly scan QR codes with your smartphone’s built-in camera. Just point your device's camera at the QR code, and our app will instantly decode it. Access Wi-Fi credentials, event invitations, contact details, coupons, and more.", shot: 2 },
      { emoji: "🛒", title: "Barcode Scanner", text: "Enjoy the convenience of our user-friendly Barcode Scanner! Quickly and accurately scan barcodes to access essential product information in real time. The app provides detailed descriptions, helping you make informed purchasing decisions.", shot: 3 },
      { emoji: "📚", title: "Scan History", text: "Keep your scanning experience organized and efficient with our Scan History feature. This intuitive function automatically stores all your previously scanned QR codes and barcodes in one convenient location, allowing you to easily revisit important links, product details, and information whenever you need.", shot: 5 },
      { emoji: "📋", title: "Auto-copy to clipboard", text: "Say goodbye to the hassle of manually copying links or text from barcodes or QR codes. QR & Barcode Scanner & Launcher automatically copies the scanned content to your clipboard, allowing you to paste it wherever you want." },
      { emoji: "🔊", title: "Vibration or beep notifications", text: "Get instantly notified through vibration or a beep, confirming the QR code or Barcode is scanned correctly. Choose your preferred notification style so you never miss a successful QR code or Barcode scan." },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Scan QR & barcodes instantly by simply swiping right from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful themed wallpapers." },
      { emoji: "🏠", title: "Home screen shortcut", text: "Use the QR & Barcode Scanner Launcher shortcut on your home screen to get fast access to a QR code reader and barcode scanner." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps and web search has never been easier. Search for installed apps or the web (powered by Google or Yahoo!) from multiple access points." },
    ],
    screenshots: [
      { src: "/images/apps/qr-scanner/shot-1.webp", width: 720, height: 1280 },
      { src: "/images/apps/qr-scanner/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/qr-scanner/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/qr-scanner/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/qr-scanner/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/qr-scanner/shot-6.webp", width: 720, height: 1280 },
      { src: "/images/apps/qr-scanner/shot-7.webp", width: 720, height: 1280 },
    ],
  },
  {
    slug: "holy-bible",
    icon: "icon-14",
    title: "Holy Bible",
    name: "Holy Bible Launcher: KJV+Audio",
    summary: "Holy Bible (KJV) launcher with audio. Read verses daily & study the word of God.",
    headline: "God's Word,\none swipe away.",
    accent: "#733B02",
    heroShot: 1,
    launcherShots: [6, 8],
    category: "Books & Reference",
    contentRating: "Everyone",
    rating: 4.8,
    ratingCount: 6933,
    downloads: "1M+",
    updated: "Sep 4, 2026",
    packageId: "com.beloved.bible.prayer.verse.android",
    website: "https://belovedbible.app/",
    links: {
      faq: "https://belovedbible.app/#faq",
      contact: "http://belovedbible.app/contact-us",
      terms: "https://belovedbible.app/terms-of-service",
      privacy: "https://belovedbible.app/privacy-policy",
    },
    intro: [
      "Looking for a free, easy-to-use Bible app to strengthen your connection with God? Want instant access to daily KJV Bible verses & audio Bible resources?",
      "Holy Bible Launcher: KJV+Audio is your gateway to the Bible, offering a seamless experience for your faith journey. This all-in-one Holy Bible app transforms your home screen, providing one-swipe access to the King James Bible (KJV) & 10 other Bible versions, including Reina-Valera 1909 & Smith-Van Dyke. Read, listen, & share KJV Bible verses & other Bible study resources for free. This launcher also offers an enhanced home screen, device search & custom web search with results by Google, Yahoo! or Microsoft Bing.",
      "Holy Bible Launcher: KJV+Audio is your Bible Gateway - a door to scripture that connects you with King James Bible (KJV) & other versions anytime, anywhere. Whether reading or listening, this app is your gateway to God's Word. Discover the Word of God today!",
    ],
    features: [
      { emoji: "📖", title: "Easy-to-use Holy Bible", text: "Read in more than one language, with the Reina-Valera 1909 (Spanish) and Smith-Van Dyke (Arabic) alongside the KJV, and share Bible verses via text, email, or Bluetooth® to inspire others." },
      { emoji: "🎧", title: "Audio Bible", text: "Enjoy audio for select versions like the KJV. Listen while commuting, exercising, or relaxing. Offline access keeps you connected to scripture anywhere.", shot: 2 },
      { emoji: "✝️", title: "Study God’s Word", text: "Access 10 popular Bible versions for free, with quick verse lookup: search by keywords like “hope,” or browse by book and chapter with ease.",
        bullets: ["King James Version (KJV)", "Reina-Valera 1909", "Smith-Van Dyke", "American Standard Version (ASV) 1901", "Bible in Basic English", "Darby English Bible", "KJV 1611", "Webster Bible", "World English Bible"], shot: 3 },
      { emoji: "🕊️", title: "Spiritual Devotionals", text: "Find daily devotionals that offer encouragement from the Holy Bible KJV and other versions. Get insights to strengthen your faith, with the Bible KJV as your guide.", shot: 7 },
      { emoji: "😇", title: "Customize Your Bible", text: "Make the app your own.",
        bullets: ["Highlight your favorite KJV Bible verses for quick access.", "Take notes on Bible passages to enhance your Bible study experience.", "Adjust font size to make reading more comfortable."], shot: 5 },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Get access to the Holy Bible KJV by simply swiping right from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, & more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful Bible themed wallpapers." },
      { emoji: "🏠", title: "Home screen shortcut", text: "Use the Bible Launcher shortcut on your home screen to get fast access to 10 popular Bible versions." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps & web search has never been easier. Search for installed apps or the web from multiple access points." },
    ],
    screenshots: [
      { src: "/images/apps/holy-bible/shot-1.webp", width: 720, height: 1280 },
      { src: "/images/apps/holy-bible/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/holy-bible/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/holy-bible/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/holy-bible/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/holy-bible/shot-6.webp", width: 720, height: 1280 },
      { src: "/images/apps/holy-bible/shot-7.webp", width: 720, height: 1280 },
      { src: "/images/apps/holy-bible/shot-8.webp", width: 720, height: 1280 },
    ],
  },
  {
    slug: "alarm-clock",
    icon: "icon-01",
    title: "Alarm Clock",
    name: "Alarm Clock Launcher",
    summary: "Wake up & get tasks done! Add alarms & reminders on the Alarm Clock Launcher.",
    headline: "Wake up on time,\nevery time.",
    accent: "#107D82",
    heroShot: 1,
    launcherShots: [7, 8],
    category: "Productivity",
    contentRating: "Everyone",
    rating: 4.2,
    ratingCount: 15793,
    downloads: "1M+",
    updated: "Sep 18, 2026",
    packageId: "com.clockhome.android.clock.alarm",
    website: "https://clockhome.app/",
    links: {
      faq: "https://clockhome.app/#faq",
      contact: "https://clockhome.app/contact-us",
      terms: "https://clockhome.app/terms-of-service",
      privacy: "https://clockhome.app/privacy-policy",
    },
    intro: [
      "Alarm Clock Launcher is an easy-to-use alarm clock and launcher app that offers instant access to essential time management tools with a single swipe from the home screen. Effortlessly manage your day: check the time in any city, and set alarms, reminders, and timers to stay organized and on schedule.",
      "Our alarm clock is perfect for heavy sleepers – select a loud alarm tone to make sure you get out of bed instantly! Use the alarm clock not only to wake up but also to remind yourself of important tasks, such as taking breaks or completing chores. Use this versatile and reliable Android™ alarm clock app & never be late again! Additionally, you can set your alarm clock to repeat on specific days, making it easier to maintain a consistent routine. Efficiently manage your schedule with our alarm clock app.",
    ],
    highlights: [
      "Alarm clock",
      "World clock",
      "Reminders",
      "Timer",
      "Stopwatch",
    ],
    features: [
      { emoji: "⏰", title: "Alarm Clock", text: "Wake up and start your day right with our personalized alarm clock. Customize alarms to fit your lifestyle. Set daily or weekly alarms, choose from different tones, and select the perfect snooze duration to ensure you wake up comfortably.", shot: 3 },
      { emoji: "🌎", title: "International time", text: "This app is perfect if you are a frequent traveler or have international meetings. Check the clock reading for any city and track time differences with our accurate world clock. Save your favorite cities for easy reference.", shot: 5 },
      { emoji: "🔔", title: "Reminders", text: "Never miss an important appointment again. Set travel reminders for flights and event reminders to keep track of personal and business events." },
      { emoji: "⏳", title: "Timer", text: "Our easy-to-use timer lets you set reminders for cooking, workouts, or that important phone call. No more burnt dinners or missed deadlines.", shot: 6 },
      { emoji: "⏱", title: "Stopwatch", text: "Use the highly accurate stopwatch to define workout durations and track progress. Monitor your improvement in fitness." },
    ],
    launcherBenefits: [
      { emoji: "🚀", title: "One-swipe access", text: "Set alarms, timers & reminders by simply swiping right from your home screen!" },
      { emoji: "📱", title: "Home screen widget", text: "See the time, weather, and more, conveniently on your home screen with our customized widget." },
      { emoji: "🖼️", title: "Wallpaper", text: "Personalize your home or lock screen with a wide selection of beautiful clock themed wallpapers." },
      { emoji: "🏠", title: "Home screen shortcut", text: "Use the Alarm Clock Launcher shortcut on your home screen to get fast access to alarms, timer, reminders & more." },
      { emoji: "🔍", title: "Multi-touchpoint search", text: "Apps and web search has never been easier. Search for installed apps or the web (powered by Google or Yahoo!) from multiple access points." },
    ],
    screenshots: [
      { src: "/images/apps/alarm-clock/shot-1.webp", width: 720, height: 1280 },
      { src: "/images/apps/alarm-clock/shot-2.webp", width: 720, height: 1280 },
      { src: "/images/apps/alarm-clock/shot-3.webp", width: 720, height: 1280 },
      { src: "/images/apps/alarm-clock/shot-4.webp", width: 720, height: 1280 },
      { src: "/images/apps/alarm-clock/shot-5.webp", width: 720, height: 1280 },
      { src: "/images/apps/alarm-clock/shot-6.webp", width: 720, height: 1280 },
      { src: "/images/apps/alarm-clock/shot-7.webp", width: 720, height: 1280 },
      { src: "/images/apps/alarm-clock/shot-8.webp", width: 720, height: 1280 },
    ],
  },
];

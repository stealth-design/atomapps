import { APPS, appIconSrc, type AppPage } from "@/data/apps";

/**
 * Fold 07 — Testimonials.
 *
 * Figma: desktop 1136:2631 (1440x757), mobile 1136:2451 (393x729).
 *
 * Desktop lays the quotes across two masonry columns that drift vertically;
 * mobile runs them across two rows that drift sideways.
 *
 * The quotes are real Google Play reviews, imported from `content/reviews.csv`
 * (two columns: app name, review) and kept verbatim — spelling and all —
 * because that is what makes them read as reviews rather than copy. Every one
 * is five stars, which is why the card draws five rather than reading a
 * figure. To add reviews, append rows to the CSV and regenerate `REVIEWS`, or
 * add entries here directly in the same shape.
 *
 * Each review is keyed to its app page by `slug`, so the chip's icon, name and
 * link all come from `@/data/apps` and cannot drift from it.
 */

export interface Review {
  id: string;
  /** `AppPage.slug` — the app the review is of. */
  slug: string;
  /** The review, without surrounding quotation marks; the card adds them. */
  quote: string;
}

/** What the card renders: the review joined to its app. */
export interface Testimonial extends Review {
  app: string;
  icon: string;
  /** The app's page on this site. */
  href: string;
}

/**
 * In display order. Round-robin by app, so two reviews of the same app never
 * sit next to each other on the track — the apps with the most reviews lead
 * each round.
 */
export const REVIEWS: Review[] = [
  { id: "volume-control-1", slug: "volume-control", quote: "FANTASTIC! This is the FIRST sound boosting app that I have ever installed that actually WORKS!! THANK YOU! 🥰🤗🥳💋💞" },
  { id: "holy-bible-1", slug: "holy-bible", quote: "I love that I can read along or just listen! I love the Bible app! The Bible is literally God's word spoken! Best Book ever written!" },
  { id: "find-my-phone-1", slug: "find-my-phone", quote: "I like this app it's the best app in the world" },
  { id: "calculator-1", slug: "calculator", quote: "This calculator is FANTASTIC!!! I LOVE IT! It has every unit of measuremement for anything you can think of! Try it, you will be very happy you did. No more looking for a better one now." },
  { id: "calendar-1", slug: "calendar", quote: "Great calendar, room to write, very organized!! which is Always what I need!😊" },
  { id: "alarm-clock-1", slug: "alarm-clock", quote: "First Day But It's So Far, Simply Awesome!!" },
  { id: "flashlight-1", slug: "flashlight", quote: "Exceptional. Eazy to manage and work with. The Light Beam is exceptionally strong and wide" },
  { id: "notes-1", slug: "notes", quote: "This is an actual GOOD app. One that doesn't suck, and won't disappoint you." },
  { id: "qr-scanner-1", slug: "qr-scanner", quote: "Very easy to use and understand the app. Had a lot of information about the product that I was trying to find information on. Would recommend to others." },
  { id: "daily-horoscope-1", slug: "daily-horoscope", quote: "Great App with Great features and positive vibes!" },
  { id: "weather-radar-1", slug: "weather-radar", quote: "Always recieve up to the minute and accurate weather forecast" },
  { id: "volume-control-2", slug: "volume-control", quote: "Great app! I can control all my app volumes separately and the boost is incredible!" },
  { id: "holy-bible-2", slug: "holy-bible", quote: "I love that I can read the bible while I drive or make dinner...it makes it so convenient there's no reason to miss a day of getting into the word." },
  { id: "find-my-phone-2", slug: "find-my-phone", quote: "I lose my phone all the time. this has been a life saver. since it's still free it's even better." },
  { id: "calculator-2", slug: "calculator", quote: "This calculator has never let me down at home or work. I am more than great fully appreciative of it's simplicity. It's also free...so a no brainer! win win people…" },
  { id: "calendar-2", slug: "calendar", quote: "This calendar is easy to use,I like it !" },
  { id: "alarm-clock-2", slug: "alarm-clock", quote: "Nice loud alarm got me right up! Iam a heavy sleeper..Good job on development guys..Thank you." },
  { id: "flashlight-2", slug: "flashlight", quote: "I needed a stronger light than the light that was on my phone and it downloaded immediately and it's quite bright!" },
  { id: "notes-2", slug: "notes", quote: "I love this app! I keep notes about birthdays, clothing sizes, my family's addresses, notes for my doctor, and more!" },
  { id: "qr-scanner-2", slug: "qr-scanner", quote: "Out of several bar code readers that I have used this is by far the quickest and best!" },
  { id: "daily-horoscope-2", slug: "daily-horoscope", quote: "Love this App its absolutely great & teaches me more than I ever knew on astrology & our Zodiac signs" },
  { id: "weather-radar-2", slug: "weather-radar", quote: "Loving my new Weather app...So detailed.." },
  { id: "volume-control-3", slug: "volume-control", quote: "I love this app so much i didn't know I can make my volume so loud i hope this app never dies😃" },
  { id: "holy-bible-3", slug: "holy-bible", quote: "This is awesome for when I don't have time to read i can listen to it and still learn the word of God" },
  { id: "find-my-phone-3", slug: "find-my-phone", quote: "I love this. I lose my phone all the the time. I now find it with just a whistle." },
  { id: "calculator-3", slug: "calculator", quote: "I use this when I go grocery shopping and it helps me track my spending" },
  { id: "calendar-3", slug: "calendar", quote: "This is the calendar I was hoping to have. Simple and easy to use. Thanks to the developers" },
  { id: "alarm-clock-3", slug: "alarm-clock", quote: "It woke me up on time this morning, perfect.I'm very pleased thank you." },
  { id: "flashlight-3", slug: "flashlight", quote: "This flashlight 🔦 app is so much better than others I have used!" },
  { id: "notes-3", slug: "notes", quote: "I love this app because it really does help me remember stuff!" },
  { id: "qr-scanner-3", slug: "qr-scanner", quote: "The grocery store had the wrong barcode on the item on the shelf. Barcode scanner works like it is suppose to" },
  { id: "volume-control-4", slug: "volume-control", quote: "I used to have trouble hearing the phone ring,low volume on my music, alarms and notifications until now" },
  { id: "holy-bible-4", slug: "holy-bible", quote: "Easy reading and I love how I can highlight scriptures that I would like to remember." },
  { id: "find-my-phone-4", slug: "find-my-phone", quote: "The easiest, the coolest, the loudest app, to find my phone 5 stars all the way." },
  { id: "volume-control-5", slug: "volume-control", quote: "I love this app it made my phone 10 times louder I'm going to recommend this to all my friends and family" },
];

function join(review: Review): Testimonial {
  const app = APPS.find((candidate): candidate is AppPage => candidate.slug === review.slug);
  if (!app) throw new Error(`Review ${review.id} names an app with no page: ${review.slug}`);
  return { ...review, app: app.title, icon: appIconSrc(app), href: `/apps/${app.slug}` };
}

export const TESTIMONIALS: Testimonial[] = REVIEWS.map(join);

/**
 * The one quote the contact page carries beside its form. A reader there is
 * being asked to get in touch, so it is the review that talks about the app
 * as a fix for something rather than about a feature.
 */
export const CONTACT_QUOTE: Testimonial = TESTIMONIALS.find(
  (testimonial) => testimonial.id === "find-my-phone-2",
)!;

/**
 * Desktop: two masonry columns, even and odd. Each column loops on its own,
 * so they need not be the same height — MarqueeMotion measures each track and
 * paces it so both drift at the same speed regardless.
 */
export const DESKTOP_COLUMNS: Testimonial[][] = [
  TESTIMONIALS.filter((_, index) => index % 2 === 0),
  TESTIMONIALS.filter((_, index) => index % 2 === 1),
];

/**
 * Longest quote the mobile rows carry. Every card on a row is drawn at one
 * height, clamped to four lines of quote, and at the 262px card that is about
 * 105 characters — so the rows take the reviews that fit whole rather than
 * cutting the longer ones off mid-sentence.
 */
const MOBILE_QUOTE_MAX = 105;

/** Mobile: the reviews that fit four lines, split the same way into two rows. */
const MOBILE_TESTIMONIALS = TESTIMONIALS.filter(
  (testimonial) => testimonial.quote.length <= MOBILE_QUOTE_MAX,
);

export const MOBILE_ROWS: Testimonial[][] = [
  MOBILE_TESTIMONIALS.filter((_, index) => index % 2 === 0),
  MOBILE_TESTIMONIALS.filter((_, index) => index % 2 === 1),
];

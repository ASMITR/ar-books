/**
 * Seed script — development only.
 * Run: npx ts-node --project tsconfig.json scripts/seed.ts
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

async function seed() {
  const now = new Date().toISOString();

  // ── Categories ──────────────────────────────────────────────────────────────
  console.log("Seeding categories…");
  const categoryDefs = [
    { name: "Business", slug: "business", description: "Entrepreneurship and business strategy.", sortOrder: 1, visible: true },
    { name: "Personal Development", slug: "personal-development", description: "Growth, habits, and mindset.", sortOrder: 2, visible: true },
    { name: "Finance", slug: "finance", description: "Money, investing, and financial freedom.", sortOrder: 3, visible: true },
    { name: "Technology", slug: "technology", description: "Programming, software, and digital tools.", sortOrder: 4, visible: true },
    { name: "Productivity", slug: "productivity", description: "Systems and tools to get more done.", sortOrder: 5, visible: true },
    { name: "Fiction", slug: "fiction", description: "Stories and novels.", sortOrder: 6, visible: true },
    { name: "Horror", slug: "horror", description: "Dark and unsettling fiction.", sortOrder: 7, visible: true },
    { name: "Science Fiction", slug: "science-fiction", description: "Speculative and futuristic fiction.", sortOrder: 8, visible: true },
  ];

  const catIds: Record<string, string> = {};
  for (const cat of categoryDefs) {
    const ref = db.collection("categories").doc();
    await ref.set({ ...cat, createdAt: now });
    catIds[cat.slug] = ref.id;
    console.log(`  ✓ ${cat.name}`);
  }

  // ── Books ───────────────────────────────────────────────────────────────────
  console.log("\nSeeding books…");
  const bookDefs = [
    {
      title: "The Founder's Mindset",
      slug: "the-founders-mindset",
      subtitle: "How to Think Like an Entrepreneur",
      description: "A practical guide to developing the mental frameworks that drive successful founders. Learn how to identify opportunities, make decisions under uncertainty, and build resilience in the face of failure. This book distills lessons from hundreds of startup journeys into actionable principles you can apply immediately.",
      pricePaise: 49900,
      originalPricePaise: 79900,
      categoryIds: [catIds["business"], catIds["personal-development"]],
      pageCount: 210,
      published: true,
      featured: true,
      whatYouLearn: ["Identify high-value opportunities", "Make decisions under uncertainty", "Build a resilient mindset", "Communicate your vision effectively", "Hire and lead your first team"],
      targetAudience: "Aspiring entrepreneurs, startup founders, and business professionals.",
      tableOfContents: ["Chapter 1: The Opportunity Lens", "Chapter 2: Decision Frameworks", "Chapter 3: Building Resilience", "Chapter 4: Vision & Communication", "Chapter 5: Your First Team"],
      seoTitle: "The Founder's Mindset — Asmit Rajaramkar",
      seoDescription: "Learn to think like a successful entrepreneur with this practical guide.",
    },
    {
      title: "Money Clarity",
      slug: "money-clarity",
      subtitle: "A Simple System for Financial Freedom",
      description: "Cut through the noise and build a clear, actionable financial plan. This book covers budgeting, investing basics, and the psychology of money in plain language. No jargon, no fluff — just a system that works for real people with real incomes.",
      pricePaise: 39900,
      originalPricePaise: 59900,
      categoryIds: [catIds["finance"]],
      pageCount: 180,
      published: true,
      featured: true,
      whatYouLearn: ["Build a personal budget that works", "Understand investing fundamentals", "Overcome money anxiety", "Set and achieve financial goals", "Automate your savings"],
      targetAudience: "Anyone who wants to take control of their personal finances.",
      tableOfContents: ["Chapter 1: The Money Mindset", "Chapter 2: Your First Budget", "Chapter 3: Investing 101", "Chapter 4: Automating Wealth", "Chapter 5: Financial Goals"],
      seoTitle: "Money Clarity — Asmit Rajaramkar",
      seoDescription: "A simple, practical guide to personal finance and financial freedom.",
    },
    {
      title: "Deep Work Habits",
      slug: "deep-work-habits",
      subtitle: "Reclaim Your Focus in a Distracted World",
      description: "A step-by-step system for building the habit of focused, high-quality work. Learn to eliminate distractions, design your environment, and produce your best work consistently. Backed by cognitive science and real-world productivity research.",
      pricePaise: 29900,
      originalPricePaise: 49900,
      categoryIds: [catIds["productivity"]],
      pageCount: 155,
      published: true,
      featured: true,
      whatYouLearn: ["Design a distraction-free environment", "Build a deep work routine", "Manage digital interruptions", "Measure and improve focus quality"],
      targetAudience: "Knowledge workers, students, and anyone who wants to do their best work.",
      tableOfContents: ["Chapter 1: The Focus Crisis", "Chapter 2: Designing Your Environment", "Chapter 3: The Deep Work Ritual", "Chapter 4: Digital Minimalism"],
      seoTitle: "Deep Work Habits — Asmit Rajaramkar",
      seoDescription: "Build the habit of focused, high-quality work in a distracted world.",
    },
    {
      title: "Code & Clarity",
      slug: "code-and-clarity",
      subtitle: "Writing Software That Lasts",
      description: "A guide to writing clean, maintainable code that your future self and teammates will thank you for. Covers naming, structure, testing philosophy, and the mindset of a professional software engineer.",
      pricePaise: 44900,
      categoryIds: [catIds["technology"]],
      pageCount: 240,
      published: true,
      featured: false,
      whatYouLearn: ["Write readable, self-documenting code", "Structure projects for long-term maintainability", "Adopt a pragmatic testing philosophy", "Refactor legacy code safely"],
      targetAudience: "Junior to mid-level software developers.",
      tableOfContents: ["Chapter 1: Naming Things Well", "Chapter 2: Structure & Architecture", "Chapter 3: Testing Philosophy", "Chapter 4: Refactoring Safely"],
      seoTitle: "Code & Clarity — Asmit Rajaramkar",
      seoDescription: "Write software that lasts with this practical guide to clean code.",
    },
    {
      title: "The Quiet Hours",
      slug: "the-quiet-hours",
      subtitle: "A Novel",
      description: "A literary fiction novel set in a small coastal town where a retired detective is drawn back into a decades-old mystery when a stranger arrives with a familiar face. A slow-burn story about memory, guilt, and the things we bury.",
      pricePaise: 34900,
      categoryIds: [catIds["fiction"]],
      pageCount: 320,
      published: true,
      featured: false,
      targetAudience: "Fans of literary fiction and slow-burn mysteries.",
      seoTitle: "The Quiet Hours — Asmit Rajaramkar",
      seoDescription: "A literary fiction novel about memory, guilt, and buried secrets.",
    },
    {
      title: "Signal Lost",
      slug: "signal-lost",
      subtitle: "A Science Fiction Thriller",
      description: "When a deep-space communications relay goes dark, a small crew is sent to investigate. What they find challenges everything they know about consciousness, identity, and what it means to be human. A tense, ideas-driven sci-fi thriller.",
      pricePaise: 37900,
      categoryIds: [catIds["science-fiction"]],
      pageCount: 290,
      published: true,
      featured: false,
      targetAudience: "Fans of hard science fiction and psychological thrillers.",
      seoTitle: "Signal Lost — Asmit Rajaramkar",
      seoDescription: "A tense sci-fi thriller about consciousness, identity, and deep space.",
    },
    {
      title: "Habit Architecture",
      slug: "habit-architecture",
      subtitle: "Design Your Life One Habit at a Time",
      description: "A practical framework for building habits that stick. Goes beyond motivation and willpower to show you how to design your environment, stack behaviours, and create systems that make good habits inevitable.",
      pricePaise: 27900,
      originalPricePaise: 39900,
      categoryIds: [catIds["personal-development"], catIds["productivity"]],
      pageCount: 165,
      published: true,
      featured: false,
      whatYouLearn: ["Understand the habit loop", "Design your environment for success", "Stack habits effectively", "Break bad habits at the root"],
      targetAudience: "Anyone looking to build lasting positive habits.",
      seoTitle: "Habit Architecture — Asmit Rajaramkar",
      seoDescription: "Design your life one habit at a time with this practical framework.",
    },
    {
      title: "The Hollow Season",
      slug: "the-hollow-season",
      subtitle: "A Horror Novel",
      description: "A family moves to a remote farmhouse to escape city life. But as autumn deepens, strange things begin to happen — things that can't be explained, and can't be ignored. A slow, atmospheric horror novel about isolation and dread.",
      pricePaise: 32900,
      categoryIds: [catIds["horror"], catIds["fiction"]],
      pageCount: 275,
      published: false,
      featured: false,
      targetAudience: "Fans of atmospheric, literary horror.",
      seoTitle: "The Hollow Season — Asmit Rajaramkar",
      seoDescription: "A slow, atmospheric horror novel about isolation and dread.",
    },
  ];

  const bookIds: string[] = [];
  for (const book of bookDefs) {
    const ref = db.collection("books").doc();
    await ref.set({
      ...book,
      author: "Asmit Rajaramkar",
      currency: "INR",
      coverImageUrl: null,
      coverImagePath: null,
      privatePdfPath: null,
      previewPdfPath: null,
      whatYouLearn: book.whatYouLearn ?? [],
      targetAudience: book.targetAudience ?? null,
      tableOfContents: book.tableOfContents ?? [],
      createdAt: now,
      updatedAt: now,
    });
    bookIds.push(ref.id);
    console.log(`  ✓ ${book.title} (${book.published ? "published" : "draft"})`);
  }

  // ── Articles ─────────────────────────────────────────────────────────────────
  console.log("\nSeeding articles…");
  const articleDefs = [
    {
      title: "Why Most People Never Finish What They Start",
      slug: "why-most-people-never-finish",
      excerpt: "Starting is easy. Finishing is the hard part. Here's why we abandon projects and what to do about it.",
      content: `Starting is easy. The blank page, the new project, the fresh idea — there's a rush of energy that comes with beginnings. But somewhere between the start and the finish line, most people stop.

It's not laziness. It's not lack of discipline. It's something more fundamental: we underestimate the middle.

The middle of any project is where the initial excitement has worn off and the end is still too far away to feel real. Psychologists call this the "valley of despair" — the dip in motivation that comes after the honeymoon phase.

The solution isn't to push harder. It's to design your project so the middle is survivable.

**Three things that help:**

1. **Break the middle into milestones.** The middle feels endless because it is, until you put markers in it. Small wins keep momentum alive.

2. **Make your progress visible.** A chart on the wall, a streak counter, a word count — anything that shows you've moved. Invisible progress feels like no progress.

3. **Reconnect with your why.** Not the surface reason ("I want to write a book") but the deep reason ("I want to prove to myself I can do hard things"). The deep reason survives the dip.

The people who finish things aren't more talented. They've just learned to survive the middle.`,
      published: true,
      publishedAt: daysAgo(14),
    },
    {
      title: "The One Financial Habit That Changes Everything",
      slug: "the-one-financial-habit",
      excerpt: "Before budgets, before investing, before any of it — there's one habit that makes everything else possible.",
      content: `Before you can budget, before you can invest, before you can build any kind of financial life — you need to know where your money is going.

Not roughly. Exactly.

Most people have a vague sense of their spending. They know they spend "too much" on food or "a bit" on subscriptions. But vague awareness doesn't change behaviour. Precise awareness does.

The habit is simple: track every rupee you spend for 30 days. Not to judge yourself. Not to cut anything. Just to see.

What happens when you do this is remarkable. The act of recording spending changes spending. You become conscious of choices that were previously automatic. That ₹200 coffee becomes a decision, not a reflex.

After 30 days, you'll have data. Real data about your real life. And from that data, every other financial decision becomes clearer.

Budget categories that actually match your life. Subscriptions you forgot you had. Patterns you didn't know existed.

You don't need a complicated system. A notes app works. A spreadsheet works. The tool doesn't matter. The habit does.

Track everything for 30 days. Then decide what to do with what you find.`,
      published: true,
      publishedAt: daysAgo(7),
    },
    {
      title: "How to Read More (Without Forcing Yourself)",
      slug: "how-to-read-more",
      excerpt: "Reading more isn't about discipline. It's about removing the friction between you and books.",
      content: `The advice you usually hear about reading more is: wake up earlier, read before bed, carry a book everywhere. All of that is fine. None of it is the point.

The point is friction.

If reading feels like work, you won't do it. If it feels easy and natural, you will. The goal isn't to force yourself to read — it's to make reading the path of least resistance.

**Reduce friction:**

- Keep a book on your pillow, not on a shelf.
- Delete one social media app and put your reading app in its place.
- Give yourself permission to quit books you don't enjoy. Life is too short for books you're forcing yourself through.

**Increase pull:**

- Only read books you're genuinely curious about. Not books you think you should read.
- Follow your interests, not a list. If you're obsessed with a topic, read everything about it.
- Talk about what you're reading. Explaining ideas to others makes you want to understand them better.

The readers who read a lot don't have more discipline. They've just arranged their lives so that reading is what happens when they have a free moment.

Make it easy. Make it interesting. The rest follows.`,
      published: true,
      publishedAt: daysAgo(3),
    },
    {
      title: "The Myth of the Perfect Morning Routine",
      slug: "myth-of-perfect-morning-routine",
      excerpt: "Everyone's selling a morning routine. Here's why yours doesn't need to look like anyone else's.",
      content: `Wake up at 5am. Meditate for 20 minutes. Journal. Exercise. Cold shower. Read. All before 8am.

You've seen the list. Maybe you've tried it. Maybe you felt like a failure when you couldn't sustain it.

Here's the truth: there is no perfect morning routine. There's only a morning routine that works for you.

The 5am crowd has convinced a lot of people that early rising is a virtue. It isn't. It's a preference. Some people do their best work at night. Some people have children who don't care about your optimal schedule.

What matters isn't when you start your day. It's how you start it.

A good morning routine does one thing: it puts you in a state where you can do your best work. That's it. Everything else is decoration.

For some people that's meditation. For others it's a long shower and a podcast. For others it's just coffee and silence.

Stop optimising for someone else's morning. Start paying attention to what actually works for yours.`,
      published: false,
    },
    {
      title: "Writing Every Day: What I Learned After 365 Days",
      slug: "writing-every-day-365-days",
      excerpt: "I wrote something every day for a year. Here's what changed — and what didn't.",
      content: `A year ago I committed to writing something every day. Not publishing every day. Just writing.

Some days it was a full essay. Some days it was three sentences in a notebook. The rule was simple: words on a page, every day, no exceptions.

Here's what I learned.

**It gets easier, but not in the way you expect.** The writing itself doesn't get easier. Some days are still hard. What gets easier is starting. The resistance to sitting down shrinks. You stop waiting to feel inspired.

**Quantity produces quality.** This sounds wrong but it's true. The more you write, the more you find the good stuff. You can't edit a blank page. You can edit a bad draft.

**Your voice emerges slowly.** In the first month, everything I wrote sounded like someone else. By month six, I started to hear something that sounded like me. By month twelve, I knew what I was trying to say and roughly how I wanted to say it.

**The streak becomes a trap.** Around day 200, I started writing to protect the streak rather than to say something. That's backwards. The streak is a tool, not the goal. I broke it deliberately on day 247 to remind myself why I was doing it.

If you want to write, write. Not when you're ready. Not when you have something important to say. Just write. The rest figures itself out.`,
      published: true,
      publishedAt: daysAgo(1),
    },
  ];

  for (const article of articleDefs) {
    const ref = db.collection("articles").doc();
    await ref.set({ ...article, createdAt: now });
    console.log(`  ✓ ${article.title} (${article.published ? "published" : "draft"})`);
  }

  // ── Coupons ──────────────────────────────────────────────────────────────────
  console.log("\nSeeding coupons…");
  const couponDefs = [
    { code: "WELCOME20", discountType: "percent", discountValue: 20, usageLimit: 100, usageCount: 14, enabled: true },
    { code: "FLAT100", discountType: "flat", discountValue: 100, usageLimit: 50, usageCount: 8, enabled: true },
    { code: "READER50", discountType: "percent", discountValue: 50, usageLimit: 20, usageCount: 20, enabled: false },
    { code: "LAUNCH30", discountType: "percent", discountValue: 30, usageCount: 0, enabled: true, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  for (const coupon of couponDefs) {
    const ref = db.collection("coupons").doc();
    await ref.set({ ...coupon, createdAt: now });
    console.log(`  ✓ ${coupon.code}`);
  }

  // ── Demo Users ───────────────────────────────────────────────────────────────
  console.log("\nSeeding demo customers…");
  const userDefs = [
    { displayName: "Priya Sharma", email: "priya.sharma@example.com", role: "member", emailVerified: true, createdAt: daysAgo(30) },
    { displayName: "Rahul Mehta", email: "rahul.mehta@example.com", role: "member", emailVerified: true, createdAt: daysAgo(22) },
    { displayName: "Ananya Iyer", email: "ananya.iyer@example.com", role: "member", emailVerified: false, createdAt: daysAgo(15) },
    { displayName: "Vikram Nair", email: "vikram.nair@example.com", role: "member", emailVerified: true, createdAt: daysAgo(10) },
    { displayName: "Sneha Patil", email: "sneha.patil@example.com", role: "member", emailVerified: true, createdAt: daysAgo(5) },
    { displayName: "Arjun Das", email: "arjun.das@example.com", role: "member", emailVerified: true, createdAt: daysAgo(2) },
  ];

  const userIds: string[] = [];
  for (const user of userDefs) {
    const ref = db.collection("users").doc();
    await ref.set({ ...user, updatedAt: now });
    userIds.push(ref.id);
    console.log(`  ✓ ${user.displayName}`);
  }

  // ── Demo Orders ──────────────────────────────────────────────────────────────
  console.log("\nSeeding demo orders…");

  const orderScenarios = [
    { userIdx: 0, bookIdxs: [0, 1], status: "paid", daysBack: 28 },
    { userIdx: 1, bookIdxs: [2], status: "paid", daysBack: 20 },
    { userIdx: 2, bookIdxs: [0], status: "pending", daysBack: 18 },
    { userIdx: 3, bookIdxs: [1, 3], status: "paid", daysBack: 12 },
    { userIdx: 4, bookIdxs: [4], status: "paid", daysBack: 9 },
    { userIdx: 5, bookIdxs: [2, 6], status: "paid", daysBack: 6 },
    { userIdx: 0, bookIdxs: [5], status: "refunded", daysBack: 4 },
    { userIdx: 1, bookIdxs: [3], status: "paid", daysBack: 3 },
    { userIdx: 2, bookIdxs: [6], status: "failed", daysBack: 2 },
    { userIdx: 3, bookIdxs: [0, 2, 4], status: "paid", daysBack: 1 },
  ];

  for (let i = 0; i < orderScenarios.length; i++) {
    const s = orderScenarios[i];
    const user = userDefs[s.userIdx];
    const items = s.bookIdxs.map((bi) => ({
      bookId: bookIds[bi],
      title: bookDefs[bi].title,
      pricePaise: bookDefs[bi].pricePaise,
      coverImageUrl: null,
    }));
    const subtotal = items.reduce((sum, it) => sum + it.pricePaise, 0);
    const createdAt = daysAgo(s.daysBack);
    const orderNumber = `ORD-${String(1000 + i + 1)}`;

    const orderData: Record<string, unknown> = {
      orderNumber,
      customerId: userIds[s.userIdx],
      customerEmail: user.email,
      customerName: user.displayName,
      items,
      subtotalPaise: subtotal,
      discountPaise: 0,
      taxPaise: 0,
      totalPaise: subtotal,
      currency: "INR",
      paymentStatus: s.status,
      fulfillmentStatus: s.status === "paid" ? "fulfilled" : "pending",
      razorpayOrderId: `order_demo${String(i + 1).padStart(6, "0")}`,
      razorpayPaymentId: s.status === "paid" ? `pay_demo${String(i + 1).padStart(6, "0")}` : null,
      createdAt,
      paidAt: s.status === "paid" ? createdAt : null,
    };

    const ref = db.collection("orders").doc();
    await ref.set(orderData);

    // Create download entitlements for paid orders
    if (s.status === "paid") {
      for (const item of items) {
        const entRef = db.collection("downloadEntitlements").doc();
        await entRef.set({
          orderId: ref.id,
          customerId: userIds[s.userIdx],
          productId: item.bookId,
          status: "active",
          createdAt,
        });
      }

      // Create download logs
      for (const item of items) {
        const logRef = db.collection("downloadLogs").doc();
        await logRef.set({
          orderId: ref.id,
          customerId: userIds[s.userIdx],
          productId: item.bookId,
          timestamp: createdAt,
          outcome: "success",
        });
      }
    }

    console.log(`  ✓ ${orderNumber} — ${user.displayName} — ${s.status} — ${formatINR(subtotal)}`);
  }

  // ── Store Settings ──────────────────────────────────────────────────────────
  console.log("\nSeeding store settings…");
  await db.collection("settings").doc("store").set({
    storeName: "AR Books",
    supportEmail: "support@arbooks.in",
    currency: "INR",
    taxPercent: 0,
    authorBio: "I'm Asmit Rajaramkar — a writer, builder, and lifelong learner. I write books that help people think clearly, build useful skills, and explore new ideas. From business and personal finance to fiction and technology, every book is crafted with care and a deep respect for the reader's time.",
    authorPhotoUrl: null,
    homepageSettings: {
      heroHeadline: "WHAT WILL YOU DISCOVER NEXT?",
      heroSubtext: "Explore new ideas, build useful skills, and discover fresh perspectives through the books I write.",
    },
    updatedAt: now,
  });
  console.log("  ✓ Store settings");

  console.log("\n✅ Seed complete.");
}

function formatINR(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

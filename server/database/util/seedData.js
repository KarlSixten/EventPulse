/* eslint-disable no-multi-spaces */
export const seedUsersData = [
  [
    'admin@example.com',         // email
    'adminPass123!',             // plainTextPassword
    'Admin',                     // first_name
    'User',                      // last_name
  ],
  [
    'k.joergensen@example.dk',   // email
    'kristianPass456',           // plainTextPassword
    'Kristian',                  // first_name
    'Jørgensen',                 // last_name
  ],
  [
    'sofie.nielsen@example.com', // email
    'sofiePass789',              // plainTextPassword
    'Sofie',                     // first_name
    'Nielsen',                   // last_name
  ],
];

export const seedEventTypesData = [
  [
    'Concert',
  ],
  [
    'Meetup',
  ],
  [
    'Birthday',
  ],
  [
    'Food',
  ],
  [
    'Workshop',
  ],
  [
    'Workout',
  ],
  [
    'Presentation',
  ],
  [
    'Other',
  ],
];

export const seedEventsData = [
  // Upcoming Events
  [
    'Copenhagen Tech Meetup - AI Ethics', // title
    'Join us for an engaging discussion on the ethics of Artificial Intelligence. Networking session included.', // description
    1, // created_by_id
    12.5600, // longitude (Nørrebro area)
    55.6870, // latitude (Nørrebro area)
    '2025-05-29T18:00', // date_time (upcoming)
    false, // is_private
    2, // Meetup
    10, // Price
    false, // is_ticketed
  ],
  [
    'Summer Jazz Night in Frederiksberg Have', // title
    'Enjoy a relaxing evening of live jazz music under the stars in the beautiful Frederiksberg Gardens.', // description
    2, // created_by_id
    12.5255, // longitude (Frederiksberg Have)
    55.6775, // latitude (Frederiksberg Have)
    '2025-06-14T19:30', // date_time (upcoming)
    false, // is_private
    1, // Concert
    0, // Price
    false, // is_ticketed
  ],
  [
    'Private Birthday Bash for Alex', // title
    "Celebrating Alex's 30th! A private gathering for friends and family. Invitation only.", // description
    3, // created_by_id
    12.5580, // longitude (Vesterbro area, e.g., a rented venue)
    55.6700, // latitude (Vesterbro area)
    '2025-06-07T20:00', // date_time (upcoming)
    true, // is_private
    3, // Birthday
    0, // Price
    false, // is_ticketed
  ],
  [
    'Refshaleøen Street Food Market - Opening Weekend', // title
    "Explore diverse culinary delights from Copenhagen's best food trucks and stalls at the new Refshaleøen market area. Live music on Saturday!", // description
    1, // created_by_id
    12.6180, // longitude (Refshaleøen)
    55.6925, // latitude (Refshaleøen)
    '2025-05-24T12:00', // date_time (upcoming - this weekend!)
    false, // is_private
    4, // Food
    0, // Price
    false, // is_ticketed
  ],
  [
    'Advanced Svelte Workshop: Mastering Runes', // title
    'Deep dive into Svelte 5 runes, advanced state management, and performance optimization techniques. Limited seats available.', // description
    2, // created_by_id
    12.5750, // longitude (City Center, near a tech hub)
    55.6780, // latitude (City Center)
    '2025-07-05T09:00', // date_time (upcoming - further out)
    false, // is_private
    5, // Workshop
    50, // Price
    false, // is_ticketed
  ],

  // Past Events
  [
    'Østerbro Morning Yoga Flow', // title
    'Start your day with an invigorating Vinyasa yoga session in the serene Fælledparken. All levels welcome, bring your own mat.', // description
    3, // created_by_id
    12.5710, // longitude (Fælledparken, Østerbro)
    55.7025, // latitude (Fælledparken, Østerbro)
    '2025-05-15T07:30', // date_time (past)
    false, // is_private
    6, // Workout
    100, // Price
    false, // is_ticketed
  ],
  [
    'Indie Game Devs - May Showcase (Members Only)', // title
    'Local indie game developers share their latest projects, prototypes, and gather feedback. An exclusive event for community members.', // description
    1, // created_by_id
    12.5780, // longitude (City Center, e.g., a small venue near Strøget)
    55.6790, // latitude (City Center)
    '2025-05-08T19:00', // date_time (past) - Changed from April to make it more recent past
    true, // is_private
    7, // Presentation
    0, // Price
    false, // is_ticketed

  ],
  [
    'Nyhavn Historical Walking Tour', // title
    'Discover the rich history, colorful facades, and maritime tales of the iconic Nyhavn harbor. Led by local historian Anders Jensen.', // description
    2, // created_by_id
    12.5905, // longitude (Nyhavn)
    55.6798, // latitude (Nyhavn)
    '2025-05-04T14:00', // date_time (past)
    false, // is_private
    7, // Presentation
    10, // Price
    false, // is_ticketed
  ],

  // Event with No Location
  [
    'Online Webinar: The Future of Sustainable Urban Living', // title
    'Experts discuss innovative solutions, green technologies, and policy changes for creating sustainable cities. Fully online.', // description
    3, // created_by_id
    null, // longitude (no physical location)
    null, // latitude (no physical location)
    '2025-06-10T16:00', // date_time (upcoming)
    false, // is_private
    7, // Presentation
    0, // Price
    false, // is_ticketed
  ],

  // Another Community Event
  [
    'Christianshavn Canal Cleanup - Spring Edition', // title
    'Join your neighbors and local volunteers to help keep the beautiful canals of Christianshavn clean. Equipment and refreshments provided.', // description
    1, // created_by_id
    12.5940, // longitude (Christianshavn, meeting point near a canal)
    55.6725, // latitude (Christianshavn)
    '2025-04-20T10:00', // date_time (past) - Made it further in the past for variety
    false, // is_private
    2, // Meetup
    0, // Price
    false, // is_ticketed
  ],
];

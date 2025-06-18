/* eslint-disable max-len */
/* eslint-disable no-multi-spaces */
export const seedUsersData = [
  // email, plainTextPassword, first_name, last_name
  ['freja.andersen@email.dk', 'password123', 'Freja', 'Andersen'],
  ['viktor.jensen@email.com', 'password123', 'Viktor', 'Jensen'],
  ['clara.nielsen@email.co.uk', 'password123', 'Clara', 'Nielsen'],
  ['emil.christensen@email.com', 'password123', 'Emil', 'Christensen'],
  ['sofia.larsen@email.dk', 'password123', 'Sofia', 'Larsen'],
  ['magnus.pedersen@email.com', 'password123', 'Magnus', 'Pedersen'],
  ['ida.sorensen@email.co.uk', 'password123', 'Ida', 'Sorensen'],
  ['oscar.rasmussen@email.dk', 'password123', 'Oscar', 'Rasmussen'],
];

export const seedEventTypesData = [
  ['Concert'],
  ['Meetup'],
  ['Workshop'],
  ['Food & Drink'],
  ['Art & Culture'],
  ['Sports & Fitness'],
  ['Charity'],
  ['Other'],
];

export const seedEventsData = [
  // title, description, created_by_id, lon, lat, date_time, is_private, type_id, price, accepts_online_payment, accepts_venue_payment
  [
    'Summer Jazz in the King\'s Garden',
    'Enjoy a relaxing evening of live jazz music right in the heart of Copenhagen. Bring a blanket and a picnic basket!',
    1, // Created by Freja
    12.5794, 55.6855, // Rosenborg Castle Gardens
    '2025-07-25 18:30:00+02',
    false, // Public
    1, // Concert
    75.00,
    true,
    true,
  ],
  [
    'Node.js Copenhagen Meetup',
    'Monthly meetup for Node.js enthusiasts. This month, we\'ll have talks on the latest features in Node.js 22 and scalable WebSocket architectures.',
    2, // Created by Viktor
    12.5896, 55.6782, // A tech hub in Christianshavn
    '2025-08-12 19:00:00+02',
    false, // Public
    2, // Meetup
    0.00,
    false,
    false,
  ],
  [
    'Clara\'s Birthday Bash',
    'Celebrating my birthday with drinks and music at my place. Please RSVP so I know how many to expect! It\'s a private gathering.',
    3, // Created by Clara
    12.5511, 55.6901, // An apartment in Nørrebro
    '2025-09-05 20:00:00+02',
    true, // Private
    8, // Other
    0.00,
    false,
    false,
  ],
  [
    'Sourdough Baking Workshop',
    'Learn the art and science of sourdough bread from scratch. All materials provided, and you get to take your own loaf home!',
    1, // Created by Freja
    12.5486, 55.6720, // A cozy bakery in Vesterbro
    '2025-08-23 10:00:00+02',
    false, // Public
    3, // Workshop
    450.00,
    true,
    false,
  ],
  [
    'Morning Yoga at Amager Strand',
    'Start your weekend with a refreshing yoga session by the sea. All levels are welcome. Please bring your own mat.',
    2, // Created by Viktor
    12.6491, 55.6429, // Amager Strandpark
    '2025-08-03 09:00:00+02',
    false, // Public
    6, // Sports & Fitness
    50.00,
    true,
    true,
  ],
];

export const seedRsvpsData = [
  // event_id, user_id, status
  [2, 1, 'going'],
  [2, 3, 'maybe'],
  [1, 2, 'going'],
  [1, 4, 'going'],
  [1, 5, 'maybe'],

  [2, 4, 'going'],
  [2, 6, 'going'],

  [3, 1, 'going'],
  [3, 2, 'not_going'],
  [4, 3, 'going'],
  [4, 7, 'going'],
  [4, 8, 'maybe'],

  [5, 1, 'going'],
  [5, 5, 'going'],
  [5, 6, 'not_going'],
];

export const seedInvitationsData = [
  // [event_id, inviter_id, invitee_id, message]
  [3, 3, 1, 'Hey Freja, hope you can make it to my birthday party!'],
  [3, 3, 2, 'Viktor, come celebrate with me!'],
  [3, 3, 4, 'Emil, would be great to see you at my party!'],
  [3, 3, 5, 'Hi Sofia! You are invited to my birthday bash.'],
  [1, 2, 8, 'Oscar, you like jazz, right? Check this out.'],
];

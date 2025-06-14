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
  [
    'Sankt Hans Bonfire on the Beach', // title
    'Join us for a traditional Danish Midsummer celebration with a huge bonfire, songs, and a beautiful sunset over the water.', // description
    2, // created_by_id
    12.6491, // longitude
    55.6429, // latitude
    '2025-06-23 20:00:00+02', // date_time
    false, // is_private
    8, // type_id (Other)
    0.00, // price
    false, // accepts_online_payment
    false, // accepts_venue_payment
  ],
  [
    'Open Air Cinema: Modern Classics', // title
    'Enjoy a movie under the stars. We are showing a beloved modern classic. Bring blankets and snacks for a cozy evening.', // description
    3, // created_by_id
    12.5786, // longitude
    55.6738, // latitude
    '2025-08-01 21:30:00+02', // date_time
    false, // is_private
    1, // type_id (Concert - repurposed for outdoor screening)
    50.00, // price
    true, // accepts_online_payment
    true, // accepts_venue_payment
  ],
  [
    'Startup Pitch Night CPH', // title
    'Local startups pitch their latest ideas. A great opportunity for networking with founders, investors, and tech talents.', // description
    1, // created_by_id
    12.5878, // longitude
    55.6698, // latitude
    '2025-07-10 18:00:00+02', // date_time
    false, // is_private
    7, // type_id (Presentation)
    25.00, // price
    true, // accepts_online_payment
    false, // accepts_venue_payment
  ],
  [
    'Morning Run & Coffee', // title
    'A social 5k run around the Copenhagen lakes, followed by coffee and conversation at a nearby cafe. All paces welcome!', // description
    2, // created_by_id
    12.5623, // longitude
    55.6836, // latitude
    '2025-06-21 09:00:00+02', // date_time
    false, // is_private
    6, // type_id (Workout)
    0.00, // price
    false, // accepts_online_payment
    true, // accepts_venue_payment
  ],
  [
    'Sofie\'s Summer Grill Party', // title
    'Private garden party to celebrate summer. I\'ll provide the grill and some basics, you bring your favorite grilling food and drinks.', // description
    3, // created_by_id
    12.5298, // longitude
    55.6755, // latitude
    '2025-07-19 18:00:00+02', // date_time
    true, // is_private
    4, // type_id (Food)
    0.00, // price
    false, // accepts_online_payment
    false, // accepts_venue_payment
  ],
  [
    'Advanced Javascript Workshop', // title
    'Deep dive into advanced Javascript concepts including async/await, generators, and performance optimization. For experienced developers.', // description
    1, // created_by_id
    12.5896, // longitude
    55.6782, // latitude
    '2025-08-16 10:00:00+02', // date_time
    false, // is_private
    5, // type_id (Workshop)
    650.00, // price
    true, // accepts_online_payment
    false, // accepts_venue_payment
  ],
  [
    'Indie Game Developers Meetup', // title
    'A casual get-together for indie game developers in Copenhagen. Show off your projects, share experiences, and find collaborators.', // description
    2, // created_by_id
    12.5656, // longitude
    55.6826, // latitude
    '2025-07-29 19:00:00+02', // date_time
    false, // is_private
    2, // type_id (Meetup)
    0.00, // price
    false, // accepts_online_payment
    true, // accepts_venue_payment
  ],
  [
    'Kristian\'s Housewarming', // title
    'I finally moved! Come see my new place and celebrate with me. There will be drinks, snacks, and music.', // description
    2, // created_by_id
    12.5511, // longitude
    55.6901, // latitude
    '2025-09-06 19:30:00+02', // date_time
    true, // is_private
    3, // type_id (Birthday - repurposed for housewarming)
    0.00, // price
    false, // accepts_online_payment
    false, // accepts_venue_payment
  ],
];

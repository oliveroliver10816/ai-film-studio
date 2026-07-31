/* Cast bibles, turnaround-sheet prompts and per-angle prompts.
   Split out of index.html because the prompt text is the actual deliverable and it is long. */

const ELENA_ID = "a 32-year-old woman, 5 feet 8 inches, slim and long-limbed with a long neck and straight square shoulders; oval face tapering to a narrow sharp chin; high flat wide-set cheekbones; a clean defined jawline; fair skin with a cool undertone, fine visible pore texture, a scatter of very faint freckles across the bridge of the nose, no blemishes and no heavy makeup; almond-shaped grey-green eyes with slightly hooded upper lids and dark natural lashes, no eyeliner; straight dark auburn eyebrows with a slight arch at the tail; a narrow straight nose bridge with a small refined tip; medium-full lips with a sharply defined cupid's bow, matte deep oxblood-red lipstick; one small dark mole one centimetre below the outer corner of her LEFT eye; a very faint vertical crease between the brows; dark auburn hair with a centre parting pulled back smooth into a low chignon at the nape, matte not glossy, no loose strands";

const ADRIAN_ID = "a 38-year-old man, 6 feet 1 inch, broad-shouldered and heavy through the chest but not overweight; square face with a wide jaw and a strong chin with a shallow cleft; olive skin with a warm undertone, visible pore texture, fine sun lines at the outer corners of the eyes; deep-set dark brown eyes under a heavy pronounced brow ridge; thick straight black eyebrows with a faint pale vertical scar about one centimetre long crossing the outer third of the RIGHT eyebrow; a straight slightly broad nose with a small bump at the bridge; a thin upper lip and a fuller lower lip; black hair swept straight back off the forehead, cut short at the sides, grey at both temples; three-day close-cropped stubble with grey coming through at the chin";

const SHEET_TECH = "Shot on a 105mm lens at f/8 so every view is equally sharp, subject two metres from the background, no depth-of-field falloff, no vignette, no lens flare, no film grain, no colour grade, neutral white balance at 5600K, true-to-life skin tone, high resolution, sharp focus on the eyes in every view, no text, no labels, no watermark, no border";

const SHEET_LIGHT = "Lit completely flat and even by a large softbox directly behind camera plus two fill panels at 45 degrees left and right, no visible shadow on the background, no rim light, no coloured light, shadow ratio 1:1 — this sheet must be lighting-neutral so each shot can be lit differently later";

const CAST = [
  {
    key: "elena",
    name: "Elena Voss",
    role: "Lead · 32 · appears in seven of the ten shots",
    bio: [
      ["Build", "5'8\", slim, long neck, straight square shoulders. Stands very still."],
      ["Face", "Oval tapering to a narrow sharp chin, high flat wide-set cheekbones, clean jawline."],
      ["Skin", "Fair, cool undertone, fine pore texture, faint freckles across the nose bridge."],
      ["Eyes", "Almond, grey-green, slightly hooded lids, dark natural lashes, no eyeliner."],
      ["Marks", "One small dark mole 1 cm below the outer corner of the <b>left</b> eye. Faint vertical crease between the brows."],
      ["Hair", "Dark auburn, centre parting, low smooth chignon at the nape, matte."],
      ["Mouth", "Medium-full, sharp cupid's bow, matte deep oxblood-red."],
      ["Wardrobe", "Charcoal wool overcoat (S02, S09) · oxblood silk blouse (S05) · black satin gown (S07, S08)."],
      ["Bearing", "Does not gesture. Movement is head and eyes only."]
    ],
    sheet: `Professional character reference sheet for film casting, one single image containing SIX separate views of THE SAME WOMAN arranged in two rows of three on a plain mid-grey seamless studio background. All six views must be unmistakably the same person, identical face, identical hair, identical clothing, identical age, no variation between views.

TOP ROW, left to right: (1) head-and-shoulders straight-on front view at eye level, neutral expression, looking directly into the lens; (2) head-and-shoulders three-quarter view turned 45 degrees to her right, eyes to camera; (3) head-and-shoulders three-quarter view turned 45 degrees to her left, eyes to camera.

BOTTOM ROW, left to right: (4) head-and-shoulders full left profile at 90 degrees, looking straight ahead out of frame; (5) rear three-quarter view from behind at 135 degrees showing the back and side of the head and the nape, face barely visible; (6) full-length standing front view, arms relaxed at her sides, feet together, head to shoes in frame.

THE SUBJECT: ${ELENA_ID}.

WARDROBE for the sheet: a plain matte black high-neck long-sleeved top and plain black trousers, no jewellery, no watch, no scarf, no pattern, no logo — deliberately neutral so wardrobe can be changed per scene.

LIGHTING: ${SHEET_LIGHT}.

TECHNICAL: ${SHEET_TECH}.`,
    angles: [
      ["Front, eye level", "used for S08 — the payoff close-up", "straight-on front view at eye level, head and shoulders, neutral expression, looking directly into the lens, chin level, shoulders square to camera"],
      ["Three-quarter right", "used for S02 — the window turn", "three-quarter view with her head turned 45 degrees to her right while her eyes come back to the lens, head and shoulders, chin very slightly down"],
      ["Three-quarter left", "spare coverage / reverse angle", "three-quarter view with her head turned 45 degrees to her left while her eyes come back to the lens, head and shoulders"],
      ["Full profile", "used for the montage", "full left profile at 90 degrees, head and shoulders, looking straight ahead out of frame, jawline and nose line clean against the background"],
      ["Rear three-quarter", "used for S10 and the montage", "seen from behind at 135 degrees, showing the back and right side of the head, the nape of the neck and the chignon, only the edge of her cheekbone visible"],
      ["Full length, standing", "used for S07 — the staircase", "full-length standing front view, head to shoes in frame, arms relaxed at her sides, feet together, weight even"]
    ]
  },
  {
    key: "adrian",
    name: "Adrian Kane",
    role: "Lead · 38 · appears in five of the ten shots",
    bio: [
      ["Build", "6'1\", broad-shouldered, heavy through the chest, not overweight."],
      ["Face", "Square, wide jaw, strong chin with a shallow cleft."],
      ["Skin", "Olive, warm undertone, visible pores, fine sun lines at the outer eyes."],
      ["Eyes", "Deep-set, dark brown, under a heavy pronounced brow ridge."],
      ["Marks", "A faint pale vertical scar ~1 cm crossing the outer third of the <b>right</b> eyebrow."],
      ["Hair", "Black, swept straight back, short at the sides, grey at both temples."],
      ["Beard", "Three-day close-cropped stubble, grey coming through at the chin."],
      ["Wardrobe", "Navy three-piece suit, no tie, collar open one button — the same suit in every shot."],
      ["Bearing", "Occupies the centre of frame. Slow to turn. Never rushed."]
    ],
    sheet: `Professional character reference sheet for film casting, one single image containing SIX separate views of THE SAME MAN arranged in two rows of three on a plain mid-grey seamless studio background. All six views must be unmistakably the same person, identical face, identical hair, identical clothing, identical age, no variation between views.

TOP ROW, left to right: (1) head-and-shoulders straight-on front view at eye level, neutral expression, looking directly into the lens; (2) head-and-shoulders three-quarter view turned 45 degrees to his left, eyes to camera; (3) head-and-shoulders three-quarter view turned 45 degrees to his right, eyes to camera.

BOTTOM ROW, left to right: (4) head-and-shoulders full right profile at 90 degrees, looking straight ahead out of frame; (5) rear three-quarter view from behind at 135 degrees showing the back and side of the head and the collar line, face barely visible; (6) full-length standing front view, arms relaxed at his sides, head to shoes in frame.

THE SUBJECT: ${ADRIAN_ID}.

WARDROBE for the sheet: a plain white cotton dress shirt with the collar open one button, sleeves down, no tie, no jacket, no watch, no ring, no pattern, no logo — deliberately neutral so wardrobe can be changed per scene.

LIGHTING: ${SHEET_LIGHT}.

TECHNICAL: ${SHEET_TECH}.`,
    angles: [
      ["Front, eye level", "used for S06 — the accusation close-up", "straight-on front view at eye level, head and shoulders, neutral expression, looking directly into the lens, chin level"],
      ["Three-quarter left", "used for S04 and the montage", "three-quarter view with his head turned 45 degrees to his left while his eyes come back to the lens, head and shoulders"],
      ["Three-quarter right", "spare coverage / reverse angle", "three-quarter view with his head turned 45 degrees to his right while his eyes come back to the lens, head and shoulders"],
      ["Full profile", "used for S03 — the silhouette", "full right profile at 90 degrees, head and shoulders, looking straight ahead out of frame, brow and nose line clean against the background"],
      ["Rear three-quarter", "used for S09 — at the glass", "seen from behind at 135 degrees, showing the back and left side of the head, the hairline at the nape and the shirt collar, only the edge of his brow visible"],
      ["Full length, standing", "used for S04 — the long table", "full-length standing front view, head to shoes in frame, arms relaxed at his sides, weight even"]
    ]
  }
];
